let bundle = {}
for(let i in Bundle)bundle[i] = Bundle[i].commands.see.nick

module.exports.run = async(p) => {
  const {id, language, args} = p
  let nicks = Game.nickname.get(id)
  let value = args[0], nick = nicks[value]
  if(!nick)
    for(let i in nicks)
      if(nicks[i] == args[0]){
        nick = args[0]
        value = i
      }
  if(!nick){
    Game.emit('private-server-message', id, bundle[language])
    return
  }
  Game.emit('private-server-message', id, `${value}=>${nick}`)
}

module.exports.help = {
  name: 'nick'
}