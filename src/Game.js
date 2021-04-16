//Данный файл запускается лишь один раз

const fs = require('fs')
const events = require('events');
const {jsonToStr, strToJson, mapToArr} = require('./functions.js');
const { LocationMap, EntityMap } = require('./Maps.js');
const DATA = global.DATA
const {Event} = require('./objects')


class GameClass extends events{
  #saves = {id: Map, location: LocationMap, entity: EntityMap, nickname: Map}//Для всех сохраняемых хранилищ
  users = new Map()//Хранит WebSockets пользователей во время игры
  #cmds = new Map()//Хранит комманды которые используют пользователи
  location = new LocationMap()
  entity = new EntityMap()
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
    // Setting.save('./src/DATA/setting.properties')//.then((s, e) => console.log(s, e))
  }
  async player(hash, message, language){//Обрабатывает сообщения пользователей вызывая комманды или отправляя сообщения в чат
    let id = this.id.get(hash), messageCopy = message
    if(!id)return
    let entity = this.entity.get(id)
    entity.language = language
    if(!entity.status.send)return

    let args = message.split(' ')
    let command = args.shift()
    let cmd = this.#cmds.get(command)
    if(cmd)message = message.slice(command.length)//Если есть комманда, ее стоит вырезать поскольку некоторые комманды работаю с текстом сообщения

    if(cmd){
      cmd.run({id, message, args, language})
    }else this.message('location:' + entity.location, `%id{${id}}%id: ${message}`)

    if(entity.training){
      // let eventSpawn = [...this.events.values()].find(e => e.type == 'player-training-spawn' && e.id == id)
      // console.log(command + message)
      let code = 0
      switch(command + message){
        case 'see location':
          code = 1
          break
        case 'see health':
          code = 2
          break
        case 'see road':
          code = 3
          break
        case 'go 1':
          code = 4
          break
        case 'go 1 1':
          code = 4
          break
        case 'see entity':
          if(entity.training > 5)code = 6
          break
        case 'see entity 1':
          code = 7
          break
        default:
          if(command == 'set')code = 8
      }
      if(code > entity.training - 1)steps[entity.id][code](1)
    }
  }
  async update(){
    if(!this.location.spawn('player'))this.location.add({name: {ru: 'Граница тумана', en: 'Fog border'}, spawn: {type: 'player'}})
    // console.log(this.location.spawn('player'))

    this.users.forEach((user, id) => {
      if(!this.entity.get(id))user.close()
    })
    this.entity.forEach((entity, id) => {
      entity.update()
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
          const entity = this.entity.get(target[1])
          if(autoLanguage)entity.send({type, id, content: content(entity.language), mid})
          else entity.send({type, id, content, mid})
          break;
        case 'all':
          this.entity.forEach(entity => {
            if(!noID.find(n => n[1] == entity.id))
              if(autoLanguage)entity.send({type, id, content: content(entity.language), mid})
              else entity.send({type, id, content, mid})
          })
          break;
        case 'location':
          [...this.entity.values()].filter(entity => entity.location == target[1]).forEach(entity => {
            if(!noID.find(n => n[1] == entity.id))
              if(autoLanguage)entity.send({type, id, content: content(entity.language), mid})
              else entity.send({type, id, content, mid})
          })
      }
    })
  }

  async training(id){
    var player = this.entity.get(id)
    var location = [Game.generateID(), Game.generateID()]
    this.location.add({id: location[0], name: {ru: 'Туман', en: 'Fog'}})
    player.location = location[0]
    this.location.add({id: location[1], name: {ru: 'Туман', en: 'Fog'}})
    this.location.addRoad(location[0], location[1])
    this.location.addRoad(location[1], this.location.spawn('player'))
    this.entity.add({location: location[1]})
    let enemy = this.entity.getByParameters({location: location[1], id_not: true, id}).values().next().value

    let e1 = new Event(() => {
      this.location.delete(location[0])
    }, 0, {type: 'training-end1', id})
    let e2 = new Event(() => {
      this.location.delete(location[1])
      delete player.training
      delete global.steps
    }, 0, {type: 'training-end2', id})

    let t1 = setInterval(() => {
      if(player.location != location[0]){
        e1.end()
        let t2 = setInterval(() => {
          if(player.location != location[1]){
            e2.end()
            clearInterval(t2)
          }
        }, 1000)
        clearInterval(t1)
      }
    }, 1000)

    global.steps = {}
    global.steps[player.id] = [
      code => { // 0
        player.send({type: 'msg', id: 'Голос', content: Bundle[player.language].training._1})
        player.training = 1
      }, // Осматриватся
      code => { // 1
        player.send({type: 'msg', id: 'Голос', content: Bundle[player.language].training._2})
        player.training = 2
      }, // Осматривает себя
      code => { // 2
        player.send({type: 'msg', id: 'Голос', content: Bundle[player.language].training._3})
        player.training = 3
      }, // Осматривает дороги
      code => { // 3
        player.send({type: 'msg', id: 'Голос', content: Bundle[player.language].training._4}) 
        steps[player.id][4](1)
        player.training = 5
      }, // Идет по дороге
      code => { // 4
        let t = setInterval(() => {
          if(player.location == location[1]){
            player.send({type: 'msg', id: 'Голос', content: Bundle[player.language].training._5})
            enemy.attack(id)
            this.location.delete(location[0])
            steps[player.id][5](1)
            clearInterval(t)
          }
        }, 1000)
        player.training = 5
      }, // Убивает противника
      code => { // 5
        let t = setInterval(() => {
          if(enemy.type == 'corpse'){
            player.send({type: 'msg', id: 'Голос', content: Bundle[player.language].training._6})
            clearInterval(t)
          }
        }, 1000)
        player.training = 6
      }, // Осматривает существ
      code => { // 6
        player.send({type: 'msg', id: 'Голос', content: Bundle[player.language].training._7})
        player.training = 7
      }, // Осматривает труп
      code => { // 7
        player.send({type: 'msg', id: 'Голос', content: f.s(Bundle[player.language].training._8, enemy.id)})
        player.training = 8
      }, // Ставит имя
      code => { // 8
        player.send({type: 'msg', id: 'Голос', content: Bundle[player.language].training._9})
        let t = setInterval(() => {
          if(!Game.entity.get(enemy.id) && player.location == location[1]){
            player.send({type: 'msg', id: 'Голос', content: Bundle[player.language].training._10})
            clearInterval(t)
          }
        }, 1000)
        player.training = Infinity
      }  // Хоронит
    ]
    steps[player.id][0](1)
  }
}

Game = new GameClass()
Game.on('entity-move', (id, road) => {
  const entity = Game.entity.get(id)
  if(!entity)throw new Error('No entity ' + id)
  const {language} = entity

  function go(roads){
    const time = parseInt(Setting.path().commands.go.time)
    let location = roads.shift()
    if(parseInt(location) < 1000)location = Game.location.get(entity.location).roads_save[parseInt(location) - 1] ?? location

    if(Game.location.has(location), Game.location.hasRoad(entity.location, location)){
      location = Game.location.get(location)

      let m = new Event((code, id_intercept) => {
        switch(code){
          case 0:
            Game.message('id:' + id, f.s(Bundle[language].commands.go.successfully, location.name[language]), 'msg-edit', m.i);
            Game.message('autoLanguage;location:' + entity.location + ';noId:' + entity.id, (l)=>f.s(Bundle[l].events.move.gone, id, location.name[l]), 'msg-edit', m.i)

              
            Game.message('autoLanguage;location:' + entity.location + ';noId:' + entity.id, (l)=>f.s(Bundle[l].events.move.came, id, Game.location.get(entity.location).name[l]), 'msg-edit', m.i)
                
            entity.location = location.id
            if(roads.length > 0)go(roads)
            break;
          case 1:
            Game.message('id:' + id_intercept, f.s(Bundle[Game.entity.get(id_intercept).language].commands.intercept, id, location.name[l]), 'msg-edit', m.i)
            Game.message('id:' + id, f.s(Bundle[language].commands.go.intercept, id_intercept, location.name[language]), 'msg-edit', m.i)
            Game.message(`autoLanguage;location:${entity.location};noId:${id};noId:${id_intercept}`, (l)=>f.s(Bundle[l].events.move.intercept, id, id_intercept, location.name[l]), 'msg-edit', m.i)
            break;
          case 2:
            Game.message('id:' + id, f.s(Bundle[language].commands.go.stop, location.name[language]), 'msg-edit', m.i)
            Game.message(`autoLanguage;location:${entity.location};noId:${id}`, (l)=>f.s(Bundle[l].events.move.stop, id, location.name[l]), 'msg-edit', m.i)
            break;
          default:
            throw new Error('code ' + code + ' not defined')
        }
      }, time * 1000, {id, location, type: 'move-entity', one: true});

      Game.message(`autoLanguage;location:${entity.location};noId:${id}`,
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
  attacking = Game.entity.get(attacking), defender = Game.entity.get(defender)
  if(!attacking || !defender)throw Error((attacking ? '' : 'Attacking is not defined\n') + (defender ? '' : 'Defender is not defined\n'))
  if(attacking.location != defender.location)throw Error('location of attacking is not defender location')
  let attack = new Event( function(code, id){
    switch(code){
      case 0:
        let fine = Math.trunc(this._t / attacking.parameters.attackInterval * 100) / 100
        if(Math.abs(fine) == Infinity)fine = 0
        let damage = Math.floor(
          (
            (attacking.parameters.damage)
            +
            Math.floor( Math.random() * (attacking.parameters.damage / 100 * attacking.parameters.inaccuracyDamage) )
            * 2 - 
            Math.floor(attacking.parameters.damage / 100 * attacking.parameters.inaccuracyDamage) 
          ) - (
            Math.floor(fine * attacking.parameters.damage/1.01)
          )
        )
        if(damage < 0)damage = 0
        // console.log(damage, fine, fine*attacking.parameters.damage/1.01, this._t, attacking.parameters.attackInterval)
        if(!Game.entity.has(attacking.id)){
          Game.message(`location:${attacking.location};noId:${attacking.id}`, '', 'msg-delete', attack.i)
          return
        }
        if(!Game.entity.has(defender.id)){
          attacking.message(f.s(Bundle[attacking.language].commands.attack.noTarget, defender.id), 'msg-edit', attack.i)
          Game.message(`location:${attacking.location};noId:${attacking.id}`, '', 'msg-delete', attack.i)
          return
        }
        defender.damage(damage)
          .then(damage => {
            let attackingStrong = attacking.indicatorOfDamage(damage), defenderStrong = defender.indicatorOfDamageMe(damage)
            // console.log(damage, fine, fine*attacking.parameters.damage/1.01, this._t, attacking.parameters.attackInterval)
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
  }, time * 1000, {id: attacking.id, type: 'attack', _t: attacking.parameters.attackTime})

  attacking.message(f.s(Bundle[attacking.language].events.attack.attacking, defender.id, time, attack.i))
  defender.message(f.s(Bundle[attacking.language].events.attack.receiving, attacking.id, time, attack.i, attack.i))
  Game.message(`autoLanguage;location:${attacking.location};noId:${attacking.id};noId:${defender.id}`, (l)=>f.s(Bundle[l].events.attack.see, attacking.id, defender.id, time, attack.i))
})

module.exports = Game