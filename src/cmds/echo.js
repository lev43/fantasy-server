module.exports.run = async(id, message) => {
  if(Game.users.has(id))Game.emit('private-server-message', id, '<echo> ' + message)
}

module.exports.help = {
  name: 'echo'
}