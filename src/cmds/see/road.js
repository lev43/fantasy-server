let bundle = {}
for(let i in Bundle)bundle[i] = Bundle[i].commands.see.road

module.exports.run = async(p) => {
  const {id, language} = p
  let entity = Game.entity.get(id)
  let location = Game.location.get(entity.location)
  //console.log(location, Game.entity.get(id))
  let roads = []
  if(location?.roads_save.length > 0){
    location.roads_save.forEach((road, i) => {
      roads.push(`(${i+1})` + Game.location.get(road).name[language] + `<${road}>`)
    });
    roads = roads.join('\n')
  }else roads = bundle[language].noRoads
  entity.message(bundle[language]._ + '\n' + roads)
}

module.exports.help = {
  name: 'road'
}