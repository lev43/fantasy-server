let bundle = {}
for(let i in Bundle)bundle[i] = Bundle[i].commands.see.health

module.exports.run = async(p) => {
  const {id, language} = p
  
  Game.emit('private-server-message', id, bundle[language]['_' + Game.enemy.get(id).healthStat])
}

module.exports.help = {
  name: 'health'
}