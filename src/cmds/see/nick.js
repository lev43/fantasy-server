let bundle = {}
for(let i in Bundle)bundle[i] = Bundle[i].commands.see.nick

module.exports.run = async(p) => {
  const {language, args} = p, entity = Game.entity.get(p.id)
  let nicks = Game.nickname.get(p.id)
  let value = args[0], nick = nicks[value]
  if(!nick)
    for(let i in nicks)
      if(nicks[i] == args[0]){
        nick = args[0]
        value = i
      }
  if(!nick){
    entity.message(bundle[language])
    return
  }
  entity.message(`${value}=>${nick}`)
}

module.exports.help = {
  name: 'nick'
}