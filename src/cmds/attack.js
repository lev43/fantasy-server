let bundle = {}
for(let i in Bundle)bundle[i] = Bundle[i].commands.attack

module.exports.run = async(p) => {
  const {id, args, language} = p
  let enemy = Game.enemy.get(id)
  let enemys_ = [...Game.enemy.getByParameters({location: enemy.location, id: id, id_not: true}).keys()]
  let target = args[0]
  
  if(parseInt(target) < 1000)target = enemys_[parseInt(target)-1] ?? target

  if(!Game.enemy.has(target)){
    enemy.message(f.s(bundle[language].noTarget, target))
    return
  }
  enemy.attack(target).then(t => {if(t == false)enemy.message(f.s(bundle[language].noTarget, target))})
}

module.exports.help = {
  name: 'attack'
}