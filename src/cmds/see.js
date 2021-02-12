const help = {
  name: 'see',
  no_cmd: 'Вы не можете посмотреть это'
}

module.exports = {
  help,
  run: require('../command_is_router.js')(help)
}