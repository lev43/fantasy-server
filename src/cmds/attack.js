let bundle = {}
for(let i in Bundle)bundle[i] = Bundle[i].commands.attack

module.exports.run = async(p) => {
  const {id, args, language} = p
  let entity = Game.entity.get(id)
  let entitys_ = [...Game.entity.getByParameters({location: entity.location, id: id, id_not: true}).keys()]
  let target = args[0]
  
  if(parseInt(target) < 1000)target = entitys_[parseInt(target)-1] ?? target

  if(!Game.entity.has(target)){
    entity.message(f.s(bundle[language].noTarget, target))
    return
  }
  entity.attack(target).then(t => {if(t == false)entity.message(f.s(bundle[language].noTarget, target))})
}

module.exports.help = {
  name: 'attack'
}