const fs = require('fs');
const http = require('http');
const WebSocket = require('ws');


require('./load-setting.js')
const DATA = require('./src/DATA.js')
const {jsonToStr, strToJson} = require('./src/functions.js')
Game = require('./src/Game.js')


Game.load()
//Game.location.add({name: 'hehehe'})
setInterval(()=>{
  Game.save()
}, parseInt(Setting.path().all.saveTime))

const host = '0.0.0.0';
const port = 6852;

html = {}

readFiles('/', html, './src/html')

const server = http.createServer(function(req, res){
  let file = req.url, type = file.split('.').pop()
  //console.log(file)
  if(req.url == '/'){
    res.writeHead(200, {"Content-Type": "text/html"})
    res.end(html['/html/address.html'])
  }else if(req.url == '/icon.png'){
    res.writeHead(200, {"Content-Type": "image/png"})
    res.end(html['/img/icon.png'])
  }else if(html[file]){
    res.writeHead(200, {"Content-Type": "text/" + type})
    res.end(html[file])
  }else{
    res.writeHead(404, {"Content-Type": "text/html"})
    res.end(`<string>Not content</string>`)
  }
})

const wss = new WebSocket.Server({ server });

wss.on('error', (err) => {
  if(err.code === 'EADDRINUSE')console.log('Порт занят')
  else throw err
  process.exit(0)
})

wss.on('connection', function connection(ws, request, client) {
  ws.on('message', function incoming(message) {
    let data = strToJson(message)

    let type = data.type
    let content = data.content.trim()


    switch(type){
      case 'player-message':
        if(content.length > 0)Game.player(data.password, content, data.language)
        break;

      case 'player-key':
        let id = Game.id.get(content)
        if(!id){
          id = Game.generateID(content)
          log(`New player on id <${id}>`, 'sockets', 'connections')
        }

        if(Game.users.has(id)){
          ws.send(jsonToStr({type: 'err', content: 'Этим персонажем уже играют'}))
          ws.close()

        }else{
          ws.send = new Proxy(ws.send, {
            apply(fun, obj, args){
              let msg = args[0]
              let myID, entity


              Game.entity.forEach((_, id) => {
                if(Game.users.get(id) === obj){
                  myID = id
                  entity = _
              }})
              while((msg.content?.indexOf('\\n') ?? -1) != -1)
                msg.content = msg.content.replace('\\n', '\n')
              while((msg.content?.indexOf('%id{') ?? -1) != -1){
                let id = msg.content.slice(msg.content.search('%id{')+4, msg.content.search('}%id'))
                try{
                  let index = [...Game.entity.getByParameters({location: entity.location, id: myID, id_not: true}).keys()].findIndex(v => v == id) + 1
                  let nick = (Game.nickname.get(myID)?.[id] ?? Bundle[entity.language].names[Game.entity.get(id)?.brieflyAppearance] ?? id)
                  msg.content = msg.content.slice(0, msg.content.search('%id{')) + nick + (index ? `(${index})` : '') + msg.content.slice(msg.content.search('}%id') + 4)
                }catch(err){
                  if(err.message != 'Invalid string length')throw err
                }
              }

              if(!msg.id)throw new Error('Not id')

              fun.bind(obj)(JSON.stringify(msg))
            }
          });
          Game.users.set(id, ws)
          log(`Socket(${request.connection.remoteAddress})[${id}] connect`, 'sockets', 'connections')

          function close(){
            log(`Socket(${request.connection.remoteAddress})[${id}] disconnect`, 'sockets', 'connections')
            Game.users.delete(id)
          }
          ws.on('close', close)

          if(Game.entity.get(id)){ 
            Game.entity.get(id).language = data.language
            ws.send({type: 'msg', id: 'SERVER', content:
              f.s(
                Bundle[data.language].events.connect,
                id,
                Game.location.get(Game.entity.get(id)?.location)?.name[data.language] ?? Game.location.get(Game.location.spawn)?.name[data.language]
              )
            })
          } else Game.entity.add({id, training: true})
        }
        break;

      default:
        con(message)
    }
  });

  ws.on('pong', msg => {})
});


//process.on('IGBREAK', ()=>{}).on('SIGHUP', ()=>{}).on('SIGINT', ()=>{})
// process.on('exit', ()=>{})


server.listen(port, host, () => {
  con(`Start server on http://${host}:${port}`)
  setInterval(()=>{
    Game.update()
  }, parseInt(Setting.path().all.updateTime))

  require('./console.js')
});