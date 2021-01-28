const fs = require('fs');
const http = require('http');
const WebSocket = require('ws');
const Game = require('./src/Game.js')

const host = '0.0.0.0';
const port = 6852;
var html = {}

function js(json){
  return JSON.stringify(json)
}
function sj(str){
  return JSON.parse(str)
}

const server = http.createServer(function(req, res){
  switch(req.url){
    default:
      res.writeHead(200, {"Content-Type": "text/html"})
      res.end(html.index)
  }
})

const wss = new WebSocket.Server({ server });
var users = {};
var ids = {};
function generateID(key){
  let id;
  while(users[id] || !id){
    id = Math.floor(Math.random()*100000)
  }
  ids[key] = id
  return id
}

wss.on('connection', function connection(ws, request, client) {
  ws.on('message', function incoming(message) {
    let data = sj(message)
    let type = data.type
    let id = ids[data.password]
    let content = data.content
    switch(type){
      case 'player-message':
        //console.log(content)
        for(user in users){
          users[user].send(js({type: 'msg', id: id, content: content}))
        }
        break;
      case 'player-key':
        //console.log(content)
        let id_ = ids[content]
        if(!id_)id_ = generateID(content)
        if(users[id_]){
          ws.send(js({type: 'err', content: 'Этим персонажем уже играют'}))
          ws.close()
        }else{
          users[id_] = ws
          console.log(`Socket connect to ${id_}`)
        }
        function close(ws, request, client){
          console.log(`Socket on ${id_} is closed`)
          delete users[id_]
        }
        ws.on('close', close)
        break;
      default:
        console.log(message)
    }
  });

  ws.on('pong', msg => {
    console.log(`pong: ${msg}`)
  })
});

html.index = fs.readFileSync('./index.html', 'utf-8')
html.icon = fs.readFileSync('./favicon.ico', 'utf-8')
server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});