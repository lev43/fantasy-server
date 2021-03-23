//Данный файл запускается лишь один раз

const fs = require('fs')
const events = require('events');
const {jsonToStr, strToJson, mapToArr} = require('./functions.js');
const { LocationMap, EnemyMap } = require('./Maps.js');
const DATA = global.DATA
const {Event} = require('./objects')


class GameClass extends events{
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
    }else this.message('location:' + enemy.location, `%id{${id}}%id: ${message}`)
  }
  async update(){
    if(this.location.size < 1 || this.location.size < 2 && !this.location.get('spawn'))this.location.add({name: {ru: 'Локация возрождения', en: 'Spawn'}})
    if(!this.location.spawn || !this.location.has(this.location.spawn))this.location.spawn = ([...this.location?.values()].find(loc => loc?.id))?.id

    this.users.forEach((user, id) => {
      if(!this.enemy.has(id))this.enemy.add({id})
      if(this.enemy.has(id))this.enemy.get(id).player = true
    })
    this.enemy.forEach((enemy, id) => {
      enemy.update()
    })
  }

  async message(addresses, message, type = 'msg', mid){//id; noId; location; all
    let targets = []; for(let i of addresses.split(';'))targets.push(i.split(':'))
    const noID = targets.filter(n => n[0] == 'noId'), autoLanguage = targets.find(a => a[0] == 'autoLanguage')
    targets.forEach(target => {
      let content = target[2] ?? message,
          [messageType, id] = target
      switch(messageType){
        case 'id':
          const enemy = this.enemy.get(target[1])
          if(autoLanguage)enemy.send({type, id, content: content(enemy.language), mid})
          else enemy.send({type, id, content, mid})
          break;
        case 'all':
          this.enemy.forEach(enemy => {
            if(!noID.find(n => n[1] == enemy.id))
              if(autoLanguage)enemy.send({type, id, content: content(enemy.language), mid})
              else enemy.send({type, id, content, mid})
          })
          break;
        case 'location':
          [...this.enemy.values()].filter(enemy => enemy.location == target[1]).forEach(enemy => {
            if(!noID.find(n => n[1] == enemy.id))
              if(autoLanguage)enemy.send({type, id, content: content(enemy.language), mid})
              else enemy.send({type, id, content, mid})
          })
      }
    })
  }
}

Game = new GameClass()
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
            Game.message('id:' + id, f.s(Bundle[language].commands.go.successfully, location.name[language]), 'msg-edit', m.i);
            Game.message('autoLanguage;location:' + enemy.location + ';noId:' + enemy.id, (l)=>f.s(Bundle[l].events.move.gone, id, location.name[l]), 'msg-edit', m.i)

              
            Game.message('autoLanguage;location:' + enemy.location + ';noId:' + enemy.id, (l)=>f.s(Bundle[l].events.move.came, id, Game.location.get(enemy.location).name[l]), 'msg-edit', m.i)
                
            enemy.location = location.id
            if(roads.length > 0)go(roads)
            break;
          case 1:
            Game.message('id:' + id_intercept, f.s(Bundle[Game.enemy.get(id_intercept).language].commands.intercept, id, location.name[l]), 'msg-edit', m.i)
            Game.message('id:' + id, f.s(Bundle[language].commands.go.intercept, id_intercept, location.name[language]), 'msg-edit', m.i)
            Game.message(`autoLanguage;location:${enemy.location};noId:${id};noId:${id_intercept}`, (l)=>f.s(Bundle[l].events.move.intercept, id, id_intercept, location.name[l]), 'msg-edit', m.i)
            break;
          case 2:
            Game.message('id:' + id, f.s(Bundle[language].commands.go.stop, location.name[language]), 'msg-edit', m.i)
            Game.message(`autoLanguage;location:${enemy.location};noId:${id}`, (l)=>f.s(Bundle[l].events.move.stop, id, location.name[l]), 'msg-edit', m.i)
            break;
          default:
            throw new Error('code ' + code + ' not defined')
        }
      }, time * 1000, {id, location, type: 'move-enemy', one: true});

      Game.message(`autoLanguage;location:${enemy.location};noId:${id}`,
        (l)=>f.s(Bundle[l].events.move.request, id, location.name[l], time, m.i, m.i)
      )
      Game.message('id:' + id, f.s(Bundle[language].commands.go.request, location.name[language], time, m.i))
    } else {
      Game.message('id:' + id, f.s(Bundle[language].commands.go.noSuccessfully, location))
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
        let fine = Math.trunc( attacking.parameters.attackTime / attacking.parameters.attackInterval * 100 )
        let damage = Math.floor(
          (
            (attacking.parameters.damage)
            +
            Math.floor( Math.random() * (attacking.parameters.damage / 100 * attacking.parameters.inaccuracyDamage) )
            * 2 - 
            Math.floor(attacking.parameters.damage / 100 * attacking.parameters.inaccuracyDamage) 
          ) - (
            Math.floor(attacking.parameters.damage / 200 * fine)
          )
        )
        //console.log(damage, fine, attacking.parameters.attackTime, attacking.parameters.attackInterval)
        if(!Game.enemy.has(attacking.id)){
          Game.message(`location:${attacking.location};noId:${attacking.id}`, '', 'msg-delete', attack.i)
          return
        }
        if(!Game.enemy.has(defender.id)){
          attacking.message(f.s(Bundle[attacking.language].commands.attack.noTarget, defender.id), 'msg-edit', attack.i)
          Game.message(`location:${attacking.location};noId:${attacking.id}`, '', 'msg-delete', attack.i)
          return
        }
        defender.damage(damage)
          .then(damage => {
            let attackingStrong = attacking.indicatorOfDamage(damage), defenderStrong = defender.indicatorOfDamageMe(damage)
            defender.message(
              f.s(Bundle[defender.language].events.attack.receivingDamage, attacking.id, Bundle[defender.language].indicator.damage[attackingStrong], Bundle[defender.language].indicator.damage[defenderStrong]),
              'msg-edit',
              attack.i
            )
            attacking.message(
              f.s(Bundle[attacking.language].events.attack.attackingSuccessfully, Bundle[attacking.language].indicator.damage[attackingStrong], defender.id, defender.id, Bundle[attacking.language].indicator.damage[defenderStrong]),
              'msg-edit',
              attack.i
            )
            Game.message(
              `autoLanguage;location:${attacking.location};noId:${attacking.id};noId:${defender.id}`,
              (l)=>f.s(Bundle[l].events.attack.seeSuccessfully, attacking.id, Bundle[l].indicator.damage[attackingStrong], defender.id, defender.id, Bundle[l].indicator.damage[defenderStrong]),
              'msg-edit',
              attack.i
            )

            //Увеличение параметров
            attacking.parameters.damage *= 1 + damage / (10000)
            defender.parameters.maxHealth *= 1 + damage / (10000)
        })
        break;
        case 1:
          if(id == defender.id){
            defender.message(f.s(Bundle[defender.language].events.attack.receivingDodge, attacking.id), 'msg-edit', attack.i)
            attacking.message(f.s(Bundle[attacking.language].events.attack.attackingDodge, defender.id), 'msg-edit', attack.i)
            Game.message(`autoLanguage;location:${attacking.location};noId:${attacking.id};noId:${defender.id}`, (l)=>f.s(Bundle[l].events.attack.seeDodge, defender.id, attacking.id), 'msg-edit', attack.i)
          }
        break;
      default:
        throw Error('Code ' + code + ' is not defined')
    }
  }, time * 1000, {id: attacking.id, type: 'attack'})

  attacking.message(f.s(Bundle[attacking.language].events.attack.attacking, defender.id, time, attack.i))
  defender.message(f.s(Bundle[attacking.language].events.attack.receiving, attacking.id, time, attack.i, attack.i))
  Game.message(`autoLanguage;location:${attacking.location};noId:${attacking.id};noId:${defender.id}`, (l)=>f.s(Bundle[l].events.attack.see, attacking.id, defender.id, time, attack.i))
})

module.exports = Game