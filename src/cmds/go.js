module.exports.run = async(id, message, args) => {
  const enemy = global.Game.enemy.get(id)
  args.forEach((loc, i) => {
    if(parseInt(loc) < 1000)loc = global.Game.location.get(enemy.location).roads_save[parseInt(loc)-1]

    if(global.Game.location.has(loc), global.Game.location.hasRoad(enemy.location, loc)){
      global.Game.emit('private-server-message', id, `Вы пошли на локацию ${global.Game.location.get(loc).name}`)
      enemy.location = loc
    }else{
      global.Game.emit('private-server-message', id, `Вы не можете пойти туда (${i+1}|${loc})`)
    }
  })
}

module.exports.help = {
  name: 'go'
}