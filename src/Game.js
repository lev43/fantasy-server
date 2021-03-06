//Данный файл запускается лишь один раз

const fs = require('fs')
const events = require('events');
const {jsonToStr, strToJson, log, mapToArr} = require('./functions.js');
const { LocationMap, EnemyMap } = require('./Maps.js');
const DATA = global.DATA
const {Event} = require('./objects')


class Game extends events{
  #saves = {id: Map, location: LocationMap, enemy: EnemyMap, nickname: Map}//Для всех сохраняемых хранилищ
  users = new Map()//Хранит WebSockets пользователей во время игры
  #cmds = new Map()//Хранит комманды которые используют пользователи
  location = new LocationMap()
  enemy = new EnemyMap()
  id = new Map()
  nickname = new Map()
  events = new Map()
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
  async save(){//Сохраняем хранилища указанные в saves
    for(let s in this.#saves){
      fs.writeFileSync(`${DATA}/saves/save-${s}.json`, jsonToStr(mapToArr(this[s])))
    }
    Setting.save('./src/DATA/setting.properties')//.then((s, e) => console.log(s, e))
  }
  async player(hash, message, language){//Обрабатывает сообщения пользователей вызывая комманды или отправляя сообщения в чат
    let id = this.id.get(hash)
    if(!id)return
    let enemy = this.enemy.get(id)
    enemy.language = language
    if(!enemy.status.send)return

    let args = message.split(' ')
    let command = args.shift()
    let cmd = this.#cmds.get(command)
    if(cmd)message = message.slice(command.length)//Если есть комманда, ее стоит вырезать поскольку некоторые комманды работаю с текстом сообщения

    if(cmd){
      cmd.run({id, message, args, language})
    }else this.emit('local-message', enemy.location, `%id{${id}}%id: ${message}`)
  }
  async update(){
    if(this.location.size < 1 || this.location.size < 2 && this.location.has('spawn'))this.location.add({name: 'spawn'})
    if(!this.location.spawn || !this.location.has(this.location.spawn))this.location.spawn = ([...this.location?.values()].find(loc => loc?.id))?.id

    this.users.forEach((user, id) => {
      if(!this.enemy.has(id))this.enemy.add({id})
      if(this.enemy.has(id))this.enemy.get(id).player = true
    })
    this.enemy.forEach((enemy, id) => {
      if(!enemy.location || !this.location.has(enemy.location))enemy.location = this.location.spawn
      if(enemy.player)this.nickname.get(enemy.id)[enemy.id] = Bundle[enemy.language].names.enemy.default
      enemy.update()
    })
  }
}

Game = new Game()

Game.on('global-message', (id, msg)=>{//Комманда рассылки сообщения всем
  Game.enemy.forEach(enemy => enemy.send({type: 'msg', id, content: `%id{${id}}%id: ${msg}`}))
  log(`Message<${id}>: ${msg}`, 'messages')
})
Game.on('private-server-message', (id, msg) => {
  Game.enemy.get(id)?.send({type: 'msg', id, content: msg})
})
Game.on('private-server-message-edit', (id, mid, msg) => {
  Game.enemy.get(id)?.send({type: 'msg-edit', id, mid, content: msg})
})
Game.on('private-server-message-delete', (id, mid) => {
  Game.enemy.get(id)?.send({type: 'msg-delete', mid})
})
Game.on('private-message', (id1, id2, msg) => {
  Game.enemy.get(id1)?.send({type: 'msg', id: id1, content: `%id{${id1}}%id->%id{${id2}}%id: ${msg}`})
})
Game.on('server-message', (msg)=>{//Комманда рассылки сообщения всем
  Game.enemy.forEach(user => user.send({type: 'msg', content: `SERVER: ${msg}`}))
  log(`Message<SERVER>: ${msg}`, 'messages')
})
Game.on('local-message', (locationID, msg, id) => {
  [...Game.enemy.values()].filter(enemy => enemy.location === locationID && enemy.id != id).forEach(enemy => enemy.send({type: 'msg', id, content: msg}))
  log(`Message<${id}>\nLocation<${locationID}>\n${msg}`, 'messages')
})

Game.on('enemy-move', (id, road) => {
  const enemy = Game.enemy.get(id)
  if(!enemy)throw new Error('No enemy ' + id)
  const {language} = enemy

  function go(roads){
    const time = parseInt(Setting.path().commands.go.time)
    let location = roads.shift()
    if(parseInt(location) < 1000)location = Game.location.get(enemy.location).roads_save[parseInt(location) - 1] ?? location

    if(Game.location.has(location), Game.location.hasRoad(enemy.location, location)){
      location = Game.location.get(location)

      let m = new Event((code, id_intercept) => {
        switch(code){
          case 0:
            Game.emit('private-server-message-edit', id, m.i + '-timer', f.s(Bundle[language].commands.go.successfully, location.name));
            [...Game.enemy.values()].filter(e => e.location == enemy.location && e.id != id)
              .forEach(e => 
                Game.emit('private-server-message-edit', e.id, m.i + '-timer', f.s(Bundle[e.language].events.move.gone, id, location.name))
              );

              
            [...Game.enemy.values()].filter(e => e.location == location.id && e.id != id)
              .forEach(e => 
                Game.emit('private-server-message', e.id, f.s(Bundle[e.language].events.move.came, id, Game.location.get(enemy.location).name))
                )
                
            enemy.location = location.id
            if(roads.length > 0)go(roads)
            break;
          case 1:
            Game.emit('private-server-message-edit', id_intercept, m.i + '-timer', f.s(Bundle[Game.enemy.get(id_intercept).language].commands.intercept, id, location.name))
            Game.emit('private-server-message-edit', id, m.i + '-timer', f.s(Bundle[language].commands.go.intercept, id_intercept, location.name));
            [...Game.enemy.values()].filter(e => e.location === enemy.location && e.id != id && e.id != id_intercept)
              .forEach(e => 
                Game.emit('private-server-message-edit', e.id, m.i + '-timer', f.s(Bundle[e.language].events.move.intercept, id, id_intercept, location.name))
              )
            break;
          case 2:
            Game.emit('private-server-message-edit', id, m.i + '-timer', f.s(Bundle[language].commands.go.stop, location.name));
            [...Game.enemy.values()].filter(e => e.location === enemy.location && e.id != id)
              .forEach(e => 
                Game.emit('private-server-message-edit', e.id, m.i + '-timer', f.s(Bundle[e.language].events.move.stop, id, location.name))
              )
            break;
          default:
            throw new Error('code ' + code + ' not defined')
        }
      }, time * 1000, {id, location, type: 'move-enemy', one: true});

      [...Game.enemy.values()].filter(e => e.location === enemy.location && e.id != id)
        .forEach(e => e.send({type: 'msg', id, content: 
          f.s(Bundle[e.language].events.move.request, id, location.name, time, m.i, m.i)
        }))
      Game.emit('private-server-message', id, f.s(Bundle[language].commands.go.request, location.name, time, m.i))
    } else {
      Game.emit('private-server-message', id, f.s(Bundle[language].commands.go.noSuccessfully, location))
    }
  }
  go(road)
})

Game.on('attack', (attacking, defender) => {
  const time = parseInt(Setting.path().commands.attack.time)
  attacking = Game.enemy.get(attacking), defender = Game.enemy.get(defender)
  if(!attacking || !defender)throw Error((attacking ? '' : 'Attacking is not defined\n') + (defender ? '' : 'Defender is not defined\n'))
  if(attacking.location != defender.location)throw Error('location of attacking is not defender location')
  let attack = new Event( (code, id) => {
    switch(code){
      case 0:
        let damage = Math.floor(
          (
            (attacking.parameters.damage)
            +
            Math.floor( Math.random() * (attacking.parameters.damage / 100 * attacking.parameters.inaccuracyDamage) )
            * 2 - 
            Math.floor(attacking.parameters.damage / 100 * attacking.parameters.inaccuracyDamage) 
          ) / (
            attacking.parameters.attackTime == 0 ? 1 : ( attacking.parameters.attackTime / attacking.parameters.attackInterval * 100 )
          )
        )
        console.log(damage, attacking.parameters.attackTime / attacking.parameters.attackInterval * 100, attacking.parameters.attackTime, attacking.parameters.attackInterval)
        if(!Game.enemy.has(attacking.id)){
          [...Game.enemy.values()].filter(e => e.location == attacking.location && e.id != attacking.id)
            .forEach(e => 
              Game.emit('private-server-message-delete', e.id, attack.i + '-timer')
            )
          return
        }
        if(!Game.enemy.has(defender.id)){
          attacking.send({type: 'msg-edit', mid: attack.i + '-timer', content: f.s(Bundle[attacking.language].commands.attack.noTarget, defender.id)});
          [...Game.enemy.values()].filter(e => e.location == attacking.location && e.id != attacking.id)
            .forEach(e => 
              Game.emit('private-server-message-delete', e.id, attack.i + '-timer')
            )
          return
        }
        defender.damage(damage)
          .then(damage => {
            let attackingStrong = attacking.indicatorOfDamage(damage), defenderStrong = defender.indicatorOfDamageMe(damage)
            defender.send({type: 'msg-edit', mid: attack.i + '-timer', content: f.s(Bundle[defender.language].events.attack.receivingDamage, attacking.id, Bundle[defender.language].indicator.damage[attackingStrong], Bundle[defender.language].indicator.damage[defenderStrong])})
            attacking.send({type: 'msg-edit', mid: attack.i + '-timer', content: f.s(Bundle[attacking.language].events.attack.attackingSuccessfully, Bundle[attacking.language].indicator.damage[attackingStrong], defender.id, defender.id, Bundle[attacking.language].indicator.damage[defenderStrong])});
            [...Game.enemy.values()].filter(e => e.location == attacking.location && e.id != attacking.id && e.id != defender.id)
              .forEach(e => 
                Game.emit('private-server-message-edit', e.id, attack.i + '-timer', f.s(Bundle[e.language].events.attack.seeSuccessfully, attacking.id, Bundle[e.language].indicator.damage[attackingStrong], defender.id, defender.id, Bundle[e.language].indicator.damage[defenderStrong]))
              )
        })
        break;
        case 1:
          if(id == defender.id){
            defender.send({type: 'msg-edit', mid: attack.i + '-timer', content: f.s(Bundle[defender.language].events.attack.receivingDodge, attacking.id)})
            attacking.send({type: 'msg-edit', mid: attack.i + '-timer', content: f.s(Bundle[attacking.language].events.attack.attackingDodge, defender.id)});
            [...Game.enemy.values()].filter(e => e.location == attacking.location && e.id != attacking.id && e.id != defender.id)
              .forEach(e => 
                Game.emit('private-server-message-edit', e.id, attack.i + '-timer', f.s(Bundle[e.language].events.attack.seeDodge, defender.id, attacking.id))
              )
          }
        break;
      default:
        throw Error('Code ' + code + ' is not defined')
    }
    attacking.parameters.attackTime = attacking.parameters.attackInterval
  }, time * 1000, {id: attacking.id, type: 'attack'})

  attacking.send({type: 'msg', content: f.s(Bundle[attacking.language].events.attack.attacking, defender.id, time, attack.i)})
  defender.send({type: 'msg', content: f.s(Bundle[attacking.language].events.attack.receiving, attacking.id, time, attack.i, attack.i)});
  [...Game.enemy.values()].filter(e => e.location == attacking.location && e.id != attacking.id && e.id != defender.id)
    .forEach(e => 
      Game.emit('private-server-message', e.id, f.s(Bundle[e.language].events.attack.see, attacking.id, defender.id, time, attack.i))
    )
})

module.exports = Game