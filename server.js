const fs = require('fs');
const http = require('http');
const WebSocket = require('ws');


const DATA = require('./src/DATA.js')
const {jsonToStr, strToJson, log, con} = require('./src/functions.js')
const Game = require('./src/Game.js')


Game.load()
Game.location.add({name: 'hehehe'})
setInterval(()=>{
  Game.save()
}, 1000)


const host = '0.0.0.0';
const port = 6852;
var html = {}


html.index = fs.readFileSync('./src/html/index.html', 'utf-8')

const server = http.createServer(function(req, res){
  switch(req.url){
    default:
      res.writeHead(200, {"Content-Type": "text/html"})
      res.end(html.index)
  }
})

const wss = new WebSocket.Server({ server });


wss.on('connection', function connection(ws, request, client) {
  ws.on('message', function incoming(message) {
    let data = strToJson(message)

    let type = data.type
    let content = data.content


    switch(type){
      case 'player-message':
        Game.player(data.password, content)
        break;

      case 'player-key':
        let id = Game.id.get(content)
        if(!id)id = Game.generateID(content)

        if(Game.users.has(id)){
          ws.send(jsonToStr({type: 'err', content: 'Этим персонажем уже играют'}))
          ws.close()

        }else{
          Game.users.set(id, ws)
          log(`New player on id <${id}>`)
          log(`Socket(${request.connection.remoteAddress})[${id}] connect`)


          function close(){
            log(`Socket(${request.connection.remoteAddress})[${id}] disconnect`)
            Game.users.delete(id)
          }
          ws.on('close', close)
        }
        break;

      default:
        con(message)
    }
  });

  ws.on('pong', msg => {})
});


server.listen(port, host, () => {
  con(`Сервер запущен на http://${host}:${port}`);
});