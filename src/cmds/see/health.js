let bundle = {}
for(let i in Bundle)bundle[i] = Bundle[i].commands.see.health

module.exports.run = async(p) => {
  const {id, language} = p
  const {health, maxHealth} = Game.enemy.get(id).parameters
  
  let s
  if(health > maxHealth)     s = bundle[language]._0
  if(health == maxHealth)    s = bundle[language]._1
  if(health < maxHealth)     s = bundle[language]._2
  if(health <= maxHealth / 2)s = bundle[language]._3
  if(health <= maxHealth / 4)s = bundle[language]._4
  if(health <= maxHealth / 8)s = bundle[language]._5

  Game.emit('private-server-message', id, s)
}

module.exports.help = {
  name: 'health'
}