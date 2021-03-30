let bundle = {}
for(let i in Bundle)bundle[i] = Bundle[i].commands.see.entity

module.exports.run = async(p) => {
  const {id, args, language} = p
  let entity = Game.entity.get(id)
  let entitys = [];
  let entitys_ = [...Game.entity.getByParameters({location: entity.location, id: id, id_not: true}).keys()]
  entitys_.forEach((entity, i) => {
    entitys.push(`%id{${entity}}%id`)
  })
  //console.log(entitys, entitys_)

  if(args[0]){
    let y = false
    let searchEntity = args[0]
    if(parseInt(searchEntity) < 1000)searchEntity = entitys_[parseInt(searchEntity)-1]
    searchEntity = Game.entity.get([...Game.entity.getByParameters({id: searchEntity, location: entity.location})][0]?.[1].id)
    if(!searchEntity){
      entity.message(f.s(bundle[language].noEntity, args[0]))
      return
    }
    let health = f.s(bundle[language].health, Bundle[language].indicator.health[searchEntity.healthStat])
    entity.message(f.s(bundle[language].search, Bundle[language].names[searchEntity.appearance], entitys_.findIndex(e => e == searchEntity.id), searchEntity.id, Bundle[language].names[searchEntity.genus], (searchEntity.type == 'corpse' ? bundle[language].search_dead : health)))
    return
  }

  if(entitys.length > 0)entity.message(bundle[language]._ + '\n' + entitys.join('\n'))
  else entity.message(bundle[language]._ + '\n' + bundle[entity.language].noEntitys)
}

module.exports.help = {
  name: 'entity'
}