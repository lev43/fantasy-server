let bundle = {}
for(let i in Bundle)bundle[i] = Bundle[i].commands.set.nick

module.exports.run = async(p) => {
  let {id, args, language} = p, enemy = Game.enemy.get(id)
  if(args[0] && args[1]){
    if([...Game.id.values()].indexOf(args[0]) != -1){
      if(args[1] == 'del')delete Game.nickname.get(id)[args[0]]
      else Game.nickname.get(id)[args[0]] = args[1]
      enemy.message(bundle[language].successfully)
    } else enemy.message(f.s(bundle[language].noID, args[0]))
  } else {
    enemy.message('set nick {id, nick || \'del\'}')
  }
}

module.exports.help = {
  name: 'nick'
}