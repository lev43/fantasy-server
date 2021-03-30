module.exports.run = async(p) => {
  const {id, language, args} = p
  const entity = Game.entity.get(id)
  let event = Game.events.get(args[0])
  if(!entity || !event)return
  event.end(1, id)
}

module.exports.help = {
  name: '->'
}