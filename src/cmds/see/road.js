module.exports.run = async(id, message) => {
  let location = Game.location.get(Game.enemy.get(id).location)
  //console.log(location, Game.enemy.get(id))
  let roads = []
  if(location?.roads_save.length > 0){
    location.roads_save.forEach((road, i) => {
      roads.push(`(${i+1})` + Game.location.get(road).name + `<${road}>`)
    });
    roads.join('\n')
  }else roads = 'Нету дорог'
  Game.emit('private-server-message', id, `Вы осматриваете дороги\n` + roads)
}

module.exports.help = {
  name: 'road'
}