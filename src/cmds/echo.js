module.exports.run = async(id, message) => {
  if(global.Game.users.has(id))global.Game.emit('private-server-message', id, '<echo> ' + message)
}

module.exports.help = {
  name: 'echo'
}