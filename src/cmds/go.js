const { Event } = require("../objects")

let bundle = {}
for(let i in Bundle)bundle[i] = Bundle[i].commands.go
const time = 5

module.exports.run = async(p) => {
  const {id, language, args} = p
  const enemy = Game.enemy.get(id)
  if(!enemy)return
  function go(args){
    let loc = args.shift()
    if(parseInt(loc) < 1000)loc = Game.location.get(enemy.location).roads_save[parseInt(loc)-1]

    if(Game.location.has(loc), Game.location.hasRoad(enemy.location, loc)){
      loc = Game.location.get(loc)
      let m = new Event((code) => {
        if(code == 0){
          Game.emit('enemy-move', id, enemy.location, loc.id)
          Game.emit('private-server-message-edit', id, m.i + '-timer', f.s(bundle[language].successfully, loc.name));
          [...Game.enemy.values()].filter(e => e.location === enemy.location && e.id != id)
            .forEach(e => e.send({type: 'msg-edit', id, mid: m.i + '-timer', content: 
              f.s(Bundle[e.language].events.move.gone, id, loc.name, m.i + '-timer')
            }))
          enemy.location = loc.id
          if(args.length > 0)go(args)
        }
      }, time * 1000);
      [...Game.enemy.values()].filter(e => e.location === enemy.location && e.id != id)
        .forEach(e => e.send({type: 'msg', id, content: 
          f.s(Bundle[e.language].events.move.request, id, loc.name, time, m.i)
        }))
      Game.emit('private-server-message', id, f.s(bundle[language].request, loc.name, time, m.i))
    }else{
      Game.emit('private-server-message', id, f.s(bundle[language].noSuccessfully))
    }
  }
  go(args)
}

module.exports.help = {
  name: 'go'
}