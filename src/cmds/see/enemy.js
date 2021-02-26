let bundle = {}
for(let i in Bundle)bundle[i] = Bundle[i].commands.see.enemy

module.exports.run = async(p) => {
  const {id, args, language} = p
  let enemy = Game.enemy.get(id)
  let enemys = [];
  let enemys_ = [...Game.enemy.getByParameters({location: enemy.location, id: id, id_not: true}).keys()]
  enemys_.forEach((enemy, i) => {
    enemys.push(`(${i+1})%id{${enemy}}%id`)
  })
  //console.log(enemys, enemys_)

  if(args[0]){
    let y = false
    let searchEnemy = args[0]
    if(parseInt(searchEnemy) < 1000)searchEnemy = enemys_[parseInt(searchEnemy)-1]
    y = enemys_.find(e=>e==searchEnemy)
    Game.emit('private-server-message', id, global.f.s(bundle[language].search, searchEnemy ?? '???', searchEnemy, (y ? '' : bundle[language].no + ' ')))
    return
  }

  if(enemys.length > 0)Game.emit('private-server-message', id, bundle[language]._ + '\n' + enemys.join('\n'))
  else Game.emit('private-server-message', id, bundle[language]._ + '\n' + bundle[enemy.language].noEnemys)
}

module.exports.help = {
  name: 'enemy'
}