let bundle = {}
for(let i in Bundle)bundle[i] = Bundle[i].commands.see.health

module.exports.run = async(p) => {
  const {language} = p, entity = Game.entity.get(p.id)
  
  entity.message(f.s(bundle[language], Bundle[language].indicator.health[entity.healthStat]))
}

module.exports.help = {
  name: 'health'
}