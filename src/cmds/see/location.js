let bundle = {}
for(let i in Bundle)bundle[i] = Bundle[i].commands.see.location

module.exports.run = async(p) => {
  const {id, language} = p, enemy = Game.enemy.get(id)
  const location = Game.location.get(Game.enemy.get(id).location)
  //console.log(location, Game.enemy.get(id).location, Game.location)
  if(!location)return

  const location_description = f.s(bundle[language], location.name[language], location.id)

  enemy.message(location_description)
}

module.exports.help = {
  name: 'location'
}