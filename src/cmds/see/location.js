let bundle = {}
for(let i in Bundle)bundle[i] = Bundle[i].commands.see.location

module.exports.run = async(p) => {
  const {id, language} = p, entity = Game.entity.get(id)
  const location = Game.location.get(Game.entity.get(id).location)
  //console.log(location, Game.entity.get(id).location, Game.location)
  if(!location)return

  const location_description = f.s(bundle[language], location.name[language], location.id)

  entity.message(location_description)
}

module.exports.help = {
  name: 'location'
}