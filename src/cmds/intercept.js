module.exports.run = async(p) => {
  const {id, language, args} = p
  const enemy = Game.enemy.get(id)
  let event = Game.events.get(args[0])
  if(!enemy || !event)return
  event.end(1, id)
}

module.exports.help = {
  name: '->'
}