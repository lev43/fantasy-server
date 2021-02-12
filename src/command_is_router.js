const fs = require('fs')

function command_is_router(help = {name}){
  let cmds = new Map()
  fs.readdir(`./src/cmds/${help.name}/`, 'utf-8', (err, files)=>{
    if(err)throw err
    console.log(files)
    files.filter(file=> file.split('.').pop() == 'js')
    .forEach(cmd_name => {
      let cmd = require(`./cmds/${help.name}/` + cmd_name)
      cmds.set(cmd.help.name, cmd)
    })
  })

  return async(id, message, args) => {
    if(!args[0]){
      global.Game.emit('private-server-message', id, help.no_cmd)
      return
    }
    let cmd = cmds.get(args[0])
    if(cmd)message = message.slice(args[0].length + 1)//Если есть комманда, ее стоит вырезать поскольку некоторые комманды работаю с текстом сообщения

    if(cmd){
      cmd.run(id, message, args.slice(1))
    }else global.Game.emit('private-server-message', id, help.no_cmd)
  }
}

module.exports = command_is_router
