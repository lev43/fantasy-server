module.exports.run = async(p) => {
  const {id, language, args} = p
  const enemy = Game.enemy.get(id)
  let event = Game.events.get(args[0])
  if(!enemy || !event)return
  event.end(1, id)
  Game.emit('private-server-message-edit', id, event.i + '-timer', f.s(Bundle[language].commands.intercept, event.id, event.location.name))
}

module.exports.help = {
  name: '->'
}