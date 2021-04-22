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
        log(JSON.stringify(data), 'messages-' + Game.id.get(data.password), 'messages')
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
            if(Game.entity.get(id)?.training > 0){
              [...Game.events.values()].find(e => e.id == id && e.type == 'training-end1')?.end();
              [...Game.events.values()].find(e => e.id == id && e.type == 'training-end2')?.end()
              Game.entity.delete(id)
            }
          }
          ws.on('close', close)
          let entity = Game.entity.get(id)
          if(entity){ 
            entity.language = data.language
            ws.send({type: 'msg', id: 'SERVER', content:
              f.s(
                Bundle[data.language].events.connect,
                id,
                Game.location.get(entity?.location)?.name[data.language] ?? Game.location.get(Game.location.spawn)?.name[data.language]
              )
            })
            if(entity.type == 'corpse'){
              entity.send({type: 'msg', id: id, content: Bundle[data.language].events.dead})
              entity.send({type: 'status', id: id, send: false, view: false})
            }
          } else Game.entity.add({id, training: 1, language: data.language})
        }
        break;

      default:
        con(message)
    }
  });

  ws.on('pong', msg => {})
});


process.on('uncaughtException', (err, origin) => {
  con(`${err.code ? (`code: ${err.code}\n`) : ''}${err.message ? (`message: ${err.message}\n`) : ''}${err.stack}\n`, 'crashes')
  setTimeout(process.exit, 1000)
});
//process.on('IGBREAK', ()=>{}).on('SIGHUP', ()=>{}).on('SIGINT', ()=>{})
process.on('exit', ()=>{
  Game.entity.getByParameters({training: '!'}).forEach(entity => {
    [...Game.events.values()].find(e => e.id == entity.id && e.type == 'training-end1')?.end();
    [...Game.events.values()].find(e => e.id == entity.id && e.type == 'training-end2')?.end()
    Game.entity.delete(entity.id)
  })
  Game.save()
  con('Close server')
  setTimeout(process.exit, 1000)
})


server.listen(port, host, () => {
  con(`Start server on http://${host}:${port}`)
  setInterval(()=>{
    Game.update()
  }, parseInt(Setting.path().all.updateTime))

  require('./console.js')
});