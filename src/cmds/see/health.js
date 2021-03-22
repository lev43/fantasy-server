let bundle = {}
for(let i in Bundle)bundle[i] = Bundle[i].commands.see.health

module.exports.run = async(p) => {
  const {language} = p, enemy = Game.enemy.get(p.id)
  
  enemy.message(f.s(bundle[language], Bundle[language].indicator.health[enemy.healthStat]))
}

module.exports.help = {
  name: 'health'
}