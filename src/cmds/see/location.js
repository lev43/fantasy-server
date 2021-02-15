module.exports.run = async(id, message) => {
  const location = Game.location.get(Game.enemy.get(id).location)
  if(!location)return

  const location_description = `Вы осматриваетесь\nВы на локации ${location.name}<${location.id}>\n`

  Game.emit('private-server-message', id, location_description)
}

module.exports.help = {
  name: 'location'
}