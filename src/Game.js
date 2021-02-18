//Данный файл запускается лишь один раз

const fs = require('fs')
const events = require('events');
const {jsonToStr, strToJson, log, mapToArr} = require('./functions.js');
const { LocationMap, EnemyMap } = require('./Maps.js');
const DATA = global.DATA


class Game extends events{
  #saves = {id: Map, location: LocationMap, enemy: EnemyMap, nickname: Map}//Для всех сохраняемых хранилищ
  users = new Map()//Хранит WebSockets пользователей во время игры
  #cmds = new Map()//Хранит комманды которые используют пользователи
  location = new LocationMap()
  enemy = new EnemyMap()
  id = new Map()
  nickname = new Map()
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
      //console.log(files)
      files.filter(file=> file.split('.').pop() === 'js')
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
    Setting.save('./src/DATA/setting.properties')//.then((s, e) => console.log(s, e))
  }
  player(hash, message, language){//Обрабатывает сообщения пользователей вызывая комманды или отправляя сообщения в чат
    let id = this.id.get(hash)
    if(!id)return

    let args = message.split(' ')
    let command = args.shift()
    let cmd = this.#cmds.get(command)
    let enemy = this.enemy.get(id)
    enemy.language = language
    if(cmd)message = message.slice(command.length)//Если есть комманда, ее стоит вырезать поскольку некоторые комманды работаю с текстом сообщения

    if(cmd){
      cmd.run({id, message, args, language})
    }else this.emit('local-message', enemy.location, id, message)
  }
  update(){
    if(this.location.size < 1 || this.location.size < 2 && this.location.has('spawn'))this.location.add({name: 'spawn'})
    if(!this.location.spawn || !this.location.has(this.location.spawn))this.location.spawn = ([...this.location?.values()].find(loc => loc?.id))?.id

    this.users.forEach((user, id) => {
      if(!this.enemy.has(id))this.enemy.add({id})
      if(this.enemy.has(id))this.enemy.get(id).player = true
    })
    this.enemy.forEach((enemy, id) => {
      if(!enemy.location || !this.location.has(enemy.location))enemy.location = this.location.spawn
      if(enemy.player)this.nickname.get(enemy.id)[enemy.id] = Bundle[enemy.language].names.enemy.default
    })
  }
}

Game = new Game()

Game.on('global-message', (id, msg)=>{//Комманда рассылки сообщения всем
  Game.users.forEach(user => user.send({type: 'msg', id, content: `%id{${id}}%id: ${msg}`}))
  log(`Message<${id}>: ${msg}`, 'messages')
})
Game.on('private-server-message', (id, msg) => {
  Game.users.get(id)?.send({type: 'msg', id, content: msg})
})
Game.on('private-message', (id1, id2, msg) => {
  Game.users.get(id1)?.send({type: 'msg', id: id1, content: `%id{${id1}}%id->%id{${id2}}%id: ${msg}`})
})
Game.on('server-message', (msg)=>{//Комманда рассылки сообщения всем
  Game.users.forEach(user => user.send({type: 'msg', content: `SERVER: ${msg}`}))
  log(`Message<SERVER>: ${msg}`, 'messages')
})
Game.on('local-message', (locationID, id, msg) => {
  [...Game.enemy.values()].filter(enemy => enemy.location === locationID).forEach(enemy => enemy.send({type: 'msg', id, content: `${id ? `%id{${id}}%id: ` : ''}${msg}`}))
  log(`Message<${id}>\nLocation<${locationID}>\n${msg}`, 'messages')
})

Game.on('enemy-move', (id, locationID1, locationID2) => {
  [...Game.enemy.values()].filter(enemy => enemy.location === locationID1 && enemy.id != id)
    .forEach(enemy => enemy.send({type: 'msg', id, content: 
      f.s(Bundle[enemy.language].events.move.gone, id, Game.location.get(locationID2).name)
    }))
  log(`${id} перешел на локацию ${Game.location.get(locationID2).name}`, 'messages');


  [...Game.enemy.values()].filter(enemy => enemy.location === locationID2 && enemy.id != id)
    .forEach(enemy => enemy.send({type: 'msg', id, content:
      f.s(Bundle[enemy.language].events.move.came, id, Game.location.get(locationID1).name)
    }))
  log(`${id} пришел на эту локацию с локации ${Game.location.get(locationID1).name}`, 'messages')
})

module.exports = Game