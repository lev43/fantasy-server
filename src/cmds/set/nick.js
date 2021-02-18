let bundle = {}
for(let i in Bundle)bundle[i] = Bundle[i].commands.set.nick

module.exports.run = async(p) => {
  let {id, args, language} = p
  if(args[0] && args[1]){
    if([...Game.id.values()].indexOf(args[0]) != -1){
      if(args[1] == 'del')delete Game.nickname.get(id)[args[0]]
      else Game.nickname.get(id)[args[0]] = args[1]
      Game.emit('private-server-message', id, bundle[language].successfully)
    }else Game.emit('private-server-message', id, f.s(bundle[language].noID, args[0]))
  }else{
    Game.emit('private-server-message', id, 'set nick {!id, ![nick || \'del\']}')
  }
  //Game.emit('private-server-message', p.id, 'echo ' + p.message)
}

module.exports.help = {
  name: 'nick'
}