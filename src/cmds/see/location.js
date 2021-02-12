module.exports.run = async(id, message) => {
  const location = global.Game.location.get(global.Game.enemy.get(id).location)
  if(!location)return

  const location_description = `Вы осматриваетесь\nВы на локации ${location.name}<${location.id}>\n`

  global.Game.emit('private-server-message', id, location_description)
}

module.exports.help = {
  name: 'location'
}