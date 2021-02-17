let bundle = {}
for(let i in Bundle)bundle[i] = Bundle[i].commands.go

module.exports.run = async(p) => {
  const {id, language, args} = p
  const enemy = Game.enemy.get(id)
  if(!enemy)return
  args.forEach((loc, i) => {
    if(parseInt(loc) < 1000)loc = Game.location.get(enemy.location).roads_save[parseInt(loc)-1]

    if(Game.location.has(loc), Game.location.hasRoad(enemy.location, loc)){
      Game.emit('private-server-message', id, global.f.s(bundle[language].successfully, Game.location.get(loc).name))
      Game.emit('enemy-move', id, enemy.location, loc)
      enemy.location = loc
    }else{
      Game.emit('private-server-message', id, global.f.s(bundle[language].noSuccessfully, i+1, loc))
    }
  })
}

module.exports.help = {
  name: 'go'
}