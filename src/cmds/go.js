const { Event } = require("../objects")

let bundle = {}
for(let i in Bundle)bundle[i] = Bundle[i].commands.go

module.exports.run = async(p) => {
  const {id, args, language} = p
  try{
    if(args[0] == 'stop'){
      [...Game.events.values()].find(event => event.type == 'move-enemy' && event.id == id)?.end(2)
    }else Game.emit('enemy-move', id, args)
  }catch(err){
    if(err.message == 'Duplicate event')Game.emit('private-server-message', id, bundle[language].isGo)
    else throw err
  }
}

module.exports.help = {
  name: 'go'
}