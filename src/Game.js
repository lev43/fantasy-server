const fs = require('fs')
const events = require('events');
const {jsonToStr, strToJson, log, mapToArr} = require('./functions.js')
const DATA = global.DATA

class Game extends events{
  saves = ['id']
  users = new Map()
  cmds = new Map()
  generateID(hash){
    let id;
    while(this.id.has(id) || !id){
      id = Math.floor(Math.random()*1000000000)
    }
    id = String(id)
    this.id.set(hash ? hash : id, id)
    return id
  }
  load(){
    this.saves.forEach(s => {
      try{
        fs.statSync(`${DATA}/saves/save-${s}.json`)
        this[s] = new Map(strToJson(fs.readFileSync(`${DATA}/saves/save-${s}.json`, 'utf-8')))
      }catch(err){
        if(err.code!='ENOENT')console.log(err)
        else this[s] = new Map()
      }
    })

    fs.readdir('./src/cmds/', 'utf-8', (err, files)=>{
      if(err)throw err
      console.log(files)
      files.filter(file=> file.split('.').pop() == 'js')
        .forEach(cmd_name => {
          let cmd = require('./cmds/' + cmd_name)
          this.cmds.set(cmd.help.name, cmd)
        })
    })
  }
  save(){
    for(let s in this.saves)
      fs.writeFileSync(`${DATA}/saves/save-${s}.json`, jsonToStr(mapToArr(this[s])))
  }
  player(hash, message){
    let id = this.id.get(hash)
    if(!id)return

    let args = message.split(' ')
    let command = args.shift()
    let cmd = this.cmds.get(command)
    if(cmd)message = message.slice(command.length)

    if(cmd){
      cmd.run(id, message)
    }else this.emit('message', id, message, args)
  }
}

global.Game = new Game()
const game = global.Game

game.on('message', (id, msg)=>{
  game.users.forEach(user => user.send(jsonToStr({type: 'msg', content: `${id}: ${msg}`})))
  log(`Message<${id}>: ${msg}`, 'messages')
})


module.exports = global.Game