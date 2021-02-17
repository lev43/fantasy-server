module.exports.run = async(p) => {
  Game.emit('private-server-message', p.id, 'echo ' + p.message)
}

module.exports.help = {
  name: 'echo'
}