module.exports.run = async(id, message, args) => {
  const enemy = Game.enemy.get(id)
  args.forEach((loc, i) => {
    if(parseInt(loc) < 1000)loc = Game.location.get(enemy.location).roads_save[parseInt(loc)-1]

    if(Game.location.has(loc), Game.location.hasRoad(enemy.location, loc)){
      Game.emit('private-server-message', id, `Вы пошли на локацию ${Game.location.get(loc).name}`)
      Game.emit('enemy-move', id, enemy.location, loc)
      enemy.location = loc
    }else{
      Game.emit('private-server-message', id, `Вы не можете пойти туда (${i+1} ${loc})`)
    }
  })
}

module.exports.help = {
  name: 'go'
}