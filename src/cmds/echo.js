module.exports.run = async(p) => {
  Game.message(`id:${p.id}`, 'echo ' + p.message)
}

module.exports.help = {
  name: 'echo'
}