const fs = require('fs');
const http = require('http');
const WebSocket = require('ws');


const DATA = require('./src/DATA.js')
const {js, sj, log, con} = require('./src/functions.js')
const Game = require('./src/Game.js')


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
    let data = sj(message)

    let type = data.type
    let content = data.content


    switch(type){
      case 'player-message':
        Game.player(data.password, content)
        break;

      case 'player-key':
        let id = Game.id.get(content)
        if(!id)id = Game.id.generate(content)

        if(Game.users.has(id)){
          ws.send(js({type: 'err', content: 'Этим персонажем уже играют'}))
          ws.close()

        }else{
          Game.users.new(id, ws)
          log(`New player on id <${id}>`)
          log(`Socket(${request.connection.remoteAddress})[${id}] connect`)


          function close(){
            log(`Socket(${request.connection.remoteAddress})[${id}] disconnect`)
            Game.users.del(id)
          }
          ws.on('close', close)
        }
        break;

      default:
        log(message)
    }
  });

  ws.on('pong', msg => {})
});


server.listen(port, host, () => {
  con(`Сервер запущен на http://${host}:${port}`);
});