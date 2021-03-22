let bundle = {}
for(let i in Bundle)bundle[i] = Bundle[i].commands.bury

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
  if(Game.enemy.get(target).type == 'corpse'){
    Game.enemy.get(target).bury()
    enemy.message(f.s(bundle[language].successfully, target))
    enemy.message('autoLanguage;location:' + enemy.location + ';noId:' + id, (l)=>f.s(Bundle[l].events.seeBury, enemy.id, target))
  }else enemy.message(f.s(bundle[language].noSuccessfully, target))
}

module.exports.help = {
  name: 'bury'
}