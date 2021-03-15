const fs = require('fs');
const http = require('http');
const WebSocket = require('ws');


require('./load-setting.js')
const DATA = require('./src/DATA.js')
const {jsonToStr, strToJson, log, con} = require('./src/functions.js')
Game = require('./src/Game.js')


Game.load()
//Game.location.add({name: 'hehehe'})
setInterval(()=>{
  Game.save()
}, parseInt(Setting.path().all.saveTime))

const host = '0.0.0.0';
const port = 6852;
html = {}

function readFiles(path, obj){
  fs.readdirSync(path).forEach(file => {
    let pathFile = path + file
    try{
      obj[file] = fs.readFileSync(pathFile)
    }catch(err){
      if(err.code == 'EISDIR')readFiles(pathFile + '/', obj)
      else if(err.code == 'ENOENT')console.log("Not file " + file, pathFile)
      else throw err
    }
  })
}

readFiles('src/html/', html)

const server = http.createServer(function(req, res){
  let file = req.url.split('?').shift().slice(1),
      type = file.split('.').pop()
  //console.log(file, type)
  if(req.url == '/'){
    res.writeHead(200, {"Content-Type": "text/html"})
    res.end(html['address.html'])
  }else if(req.url == '/icon.png'){
    res.writeHead(200, {"Content-Type": "image/png"})
    res.end(html['icon.png'])
  }else if(html[file]){
    res.writeHead(200, {"Content-Type": "text/"+type})
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
    let content = data.content


    switch(type){
      case 'player-message':
        content = content.replace('%lastMessage{', `%lastMessage{%id{${Game.id.get(data.password)}}%id: `)
        Game.player(data.password, content, data.language)
        break;

      case 'player-key':
        let id = Game.id.get(content)
        if(!id)id = Game.generateID(content)

        if(Game.users.has(id)){
          ws.send(jsonToStr({type: 'err', content: 'Этим персонажем уже играют'}))
          ws.close()

        }else{
          ws.send = new Proxy(ws.send, {
            apply(fun, obj, args){
              let msg = args[0]
              let myID


              Game.enemy.forEach((enemy, id) => {
                if(Game.users.get(id) === obj){
                  myID = id
                }})

              while((msg.content?.indexOf('%id{') ?? -1) != -1){
                let id = msg.content.slice(msg.content.search('%id{')+4, msg.content.search('}%id'))
                try{
                  msg.content = msg.content.slice(0, msg.content.search('%id{')) + (Game.nickname.get(myID)?.[id] ?? id) + msg.content.slice(msg.content.search('}%id') + 4)
                }catch(err){
                  if(!err.message == 'Invalid string length')throw err
                }
              }

              if(!msg.id)throw new Error('Not id')

              fun.bind(obj)(JSON.stringify(msg))
            }
          });
          Game.users.set(id, ws)
          log(`New player on id <${id}>`)
          log(`Socket(${request.connection.remoteAddress})[${id}] connect`)

          if(Game.enemy.has(id))Game.enemy.get(id).language = data.language

          function close(){
            log(`Socket(${request.connection.remoteAddress})[${id}] disconnect`)
            Game.users.delete(id)
          }
          ws.on('close', close)
          ws.send({type: 'msg', id: 'SERVER', content:
            f.s(
              Bundle[data.language].events.connect,
              id,
              Game.location.get(Game.enemy.get(id)?.location)?.name[data.language] ?? Game.location.get(Game.location.spawn)?.name[data.language]
            )
          })
        }
        break;

      default:
        con(message)
    }
  });

  ws.on('pong', msg => {})
});


server.listen(port, host, () => {
  con(`Start server on http://${host}:${port}`);
  setInterval(()=>{
    Game.update()
  }, parseInt(Setting.path().all.updateTime))

  require('./console.js')
});