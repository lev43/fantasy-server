const { Event } = require("../objects")

let bundle = {}
for(let i in Bundle)bundle[i] = Bundle[i].commands.go

module.exports.run = async(p) => {
  const {id, args, language} = p
  try{
    if(args[0] == 'stop' || args[0] == '0'){
      [...Game.events.values()].find(event => event.type == 'move-entity' && event.id == id)?.end(2)
    }else Game.emit('entity-move', id, args)
  }catch(err){
    if(err.message == 'Duplicate event')Game.message('id:' + id, bundle[language].isGo)
    else throw err
  }
}

module.exports.help = {
  name: 'go'
}