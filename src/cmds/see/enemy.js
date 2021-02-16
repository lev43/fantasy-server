module.exports.run = async(id, message, args) => {
  let enemy = Game.enemy.get(id)
  let enemys = [];
  let enemys_ = [...Game.enemy.getByParameters({location: enemy.location, id: id, id_not: true}).keys()]
  enemys_.forEach((enemy, i) => {
    enemys.push(`(${i})${enemy}`)
  })
  //console.log(enemys, enemys_)

  if(args[0]){
    let y = false
    y = enemys_.find(e=>e==args[0])
    Game.emit('private-server-message', id, `Вы ищете существо <${args[0]}> и ${y ? '' : 'не '}находите его`)
    return
  }

  if(enemys.length > 0)Game.emit('private-server-message', id, `Вы осматриваете существ\n` + enemys.join('\n'))
  else Game.emit('private-server-message', id, `Вы осматриваете существ\nНету существ`)
}

module.exports.help = {
  name: 'enemy'
}