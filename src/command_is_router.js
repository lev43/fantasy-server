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

  return async(p) => {
    let {id, args, message, language} = p
    let cmd = cmds.get(args[0])
    if(cmd)message = message.slice(args[0].length + 1)//Если есть комманда, ее стоит вырезать поскольку некоторые комманды работаю с текстом сообщения

    if(cmd){
      p.args = p.args.slice(1)
      cmd.run(p)
    }else Game.emit('private-server-message', id, Bundle[language].commands[help.name].no_cmd)
  }
}

module.exports = command_is_router
