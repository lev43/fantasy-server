let bundle = {}
for(let i in Bundle)bundle[i] = Bundle[i].commands.bury

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
  if(Game.entity.get(target).type == 'corpse'){
    entity.message(f.s(bundle[language].successfully, target))
    entity.message('autoLanguage;location:' + entity.location + ';noId:' + id, (l)=>f.s(Bundle[l].events.seeBury, entity.id, target))
    Game.entity.get(target).bury()
  }else entity.message(f.s(bundle[language].noSuccessfully, target))
}

module.exports.help = {
  name: 'bury'
}