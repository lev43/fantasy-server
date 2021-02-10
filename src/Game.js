//Данный файл запускается лишь один раз

const fs = require('fs')
const events = require('events');
const {jsonToStr, strToJson, log, mapToArr} = require('./functions.js');
const { LocationMap, EnemyMap } = require('./Maps.js');
const DATA = global.DATA


class Game extends events{
  #saves = {id: Map, location: LocationMap, enemy: EnemyMap}//Для всех сохраняемых хранилищ
  users = new Map()//Хранит WebSockets пользователей во время игры
  #cmds = new Map()//Хранит комманды которые используют пользователи
  location = new LocationMap()
  enemy = new EnemyMap()
  id = new Map()
  generateID(hash){//Используется для генерации юникальных айди для всех обьектов в игре
    let id;
    while(this.id.has(id) || !id){
      id = Math.floor(Math.random()*1000000000)
    }
    id = String(id)
    this.id.set(hash ? hash : id, id)
    return id
  }
  load(){//Подгружает из файлов данные игры перед началом
    for(let s in this.#saves){
      try{
        fs.statSync(`${DATA}/saves/save-${s}.json`)
        if(!this.#saves.con)this[s] = new this.#saves[s](strToJson(fs.readFileSync(`${DATA}/saves/save-${s}.json`, 'utf-8')))
      }catch(err){//На случай если файла еще нету
        if(err.code!='ENOENT')console.log(err)
        //else this[s] = new this.saves[s]()
      }
    }
    

    fs.readdir('./src/cmds/', 'utf-8', (err, files)=>{
      if(err)throw err
      console.log(files)
      files.filter(file=> file.split('.').pop() == 'js')
        .forEach(cmd_name => {
          let cmd = require('./cmds/' + cmd_name)
          this.#cmds.set(cmd.help.name, cmd)
        })
    })
  }
  save(){//Сохраняем хранилища указанные в saves
    for(let s in this.#saves){
      fs.writeFileSync(`${DATA}/saves/save-${s}.json`, jsonToStr(mapToArr(this[s])))
    }
  }
  player(hash, message){//Обрабатывает сообщения пользователей вызывая комманды или отправляя сообщения в чат
    let id = this.id.get(hash)
    if(!id)return

    let args = message.split(' ')
    let command = args.shift()
    let cmd = this.#cmds.get(command)
    if(cmd)message = message.slice(command.length)//Если есть комманда, ее стоит вырезать поскольку некоторые комманды работаю с текстом сообщения

    if(cmd){
      cmd.run(id, message)
    }else this.emit('message', id, message, args)
  }
  update(){
    this.users.forEach((user, id) => {
      if(!this.enemy.has(id))this.enemy.add({id})
    })
  }
}

global.Game = new Game()
const game = global.Game

game.on('message', (id, msg)=>{//Комманда рассылки сообщения всем
  game.users.forEach(user => user.send(jsonToStr({type: 'msg', content: `${id}: ${msg}`})))
  log(`Message<${id}>: ${msg}`, 'messages')
})

module.exports = global.Game