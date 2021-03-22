class MyObject{
  id
  get name(){
    return this._name ?? {ru: 'Нету', en: 'None'}
  }
  set name(v){
    this._name = v
  }
  constructor(par = {id}){
    for(let i in par){
      if(par[i])this[i] = par[i]
    }
    if(!this.id)this.id = Game.generateID()
  }
}

class Location extends MyObject{
  roads = new Set()
  roads_save = []
  constructor(par = {name: {ru, en}, id, roads_save}){
    super(par)
    if(par.roads_save)this.roads = new Set(par.roads_save)
    
    for(let lan in par.name)if(!this.name[lan])this.name[lan] = 'NONE'
    
    //Каждый раз надо обновлять сохранение дорог
    let loc = this
    setInterval( () => {
      this.roads_save = [...this.roads]
    }, 1000)
    Object.defineProperty(this, 'roads', {
      enumerable: false
    })
  }
  send(id, msg){
    Game.message('location:' + this.id, msg)
  }
}

class Enemy extends MyObject{
  #timer = 0
  online = false
  location
  language = 'ru'
  save_par = {}
  _type = 'enemy'
  status = {send: true, view: true}
  get healthStat(){
    const {health, maxHealth} = this.parameters
    if(health > maxHealth)return 'p5'
    if(health == maxHealth)return 'p4'
    if(health <= maxHealth / 8)return '_0'
    if(health <= maxHealth / 4)return 'p1'
    if(health <= maxHealth / 2)return 'p2'
    if(health < maxHealth)return 'p3'
  }
  get type(){
    return this._type
  }
  set type(value){
    if(value == this._type)return
    this.save_par[this._type] = Object.assign({}, this.parameters)
    this._type = value

    if(this.save_par[value])this.parameters = Object.assign({}, this.save_par[value])
    else this.parameters = Object.assign(this.parameters ?? {}, Patterns[value])
  }

  constructor(par = {id, location, language, parameters}){
    super(par)
    if(!par.location)this.location = Game.location.spawn
    else this.location = par.location


    if(!this.parameters)this.parameters = Object.assign({}, Patterns[this.type])
    if(this.player && this._type == 'enemy')this._type = 'player'


    Game.nickname.set(this.id, {})
    Game.nickname.get(this.id)[this.id] = Bundle[this.language].names.enemy.default

    this.online = this.player
  }

  async send(msg){
    log(msg, 'messages-' + this.id, 'messages')
    Game.users.get(this.id)?.send(msg)
  }

  async message(msg, type = 'msg', mid){
    Game.message('id:' + this.id, msg, type, mid)
  }

  async bury(){
    if(this.type != 'corpse')return false
    Game.enemy.delete(this.id)
    Game.id.forEach((id, i) => {
      if(id == this.id)Game.id.delete(i)
    })
    Game.nickname.delete(this.id)
    this.send({type: 'err', id: 'SYSTEM', content: Bundle[this.language].events.youBury})
    return true
  }

  async attack(id){
    try{
    this.parameters.attackTime = this.parameters.attackInterval
    Game.emit('attack', this.id, id)
      this.parameters.attackInterval -= Math.abs(this.parameters.attackInterval / 2.9 - this.parameters.attackTime / this.parameters.attackInterval) / 10
    }catch(err){
      if(err.message == 'location of attacking is not defender location')return false
      else throw err
    }
  }

  async damage(damage){
    this.parameters.health -= damage
    return damage
  }
  indicatorOfDamageMe(damage){
    damage = this.meterageOfDamageMe(damage)
    if(damage <= 1)return 'm3'
    if(damage <= 5)return 'm2'
    if(damage <= 10)return 'm1'

    if(damage >= 100)return 'p3'
    if(damage >= 50)return 'p2'
    if(damage >= 20)return 'p1'

    return '_0'
  }
  indicatorOfDamage(damage){
    damage = this.meterageOfDamage(damage)
    if(damage <= 10)return 'm3'
    if(damage <= 40)return 'm2'
    if(damage <= 70)return 'm1'

    if(damage >= 200)return 'p3'
    if(damage >= 150)return 'p2'
    if(damage >= 130)return 'p1'

    return '_0'
  }

  meterageOfDamage(damage){
    return damage / this.parameters.damage * 100
  }

  meterageOfDamageMe(damage){
    return damage / this.parameters.maxHealth * 100
  }

  async update(){
    //Проверка существования локации
    if(!this.location || !Game.location.get(this.location))this.location = Game.location.spawn
    

    //Если труп, то дальше не обновлять
    if(this.type == 'corpse'){
      this.send({type: 'msg', id: this.id, content: Bundle[this.language].events.dead})
      this.send({type: 'status', id: this.id, send: false, view: false})
      return
    }


    //par => параметры, s => доля секунды (В зависимости от частоты обновлений меняем долю)
    const par = this.parameters, s = parseInt(Setting.path().all.updateTime) / 1000; this.#timer += s


    //Проверка на игрока
    if(Game.users.has(this.id) && !this.player){this.player = true; this.type = 'player'}
    if(this.player && this._type == 'enemy')this.type = 'player'
    if(this.player)Game.nickname.get(this.id)[this.id] = Bundle[this.language].names.enemy.default
    this.online = (this.player && Game.users.has(this.id))
    

    //Для действий раз в секунду
    if(this.#timer >= 1){
      this.#timer = 0


      //Действия только если этот игрок онлайн или это не игрок
      if(!this.player || this.online){
        //Уменьшение параметров со временем
        par.maxHealth /= 1.0000001
        par.regeneration /= 1.00000000000001
        par.regenerationInterval *= 1.00000000000001
        par.damage /= 1.000001
        par.attackInterval *= 1.00001
      }
    }


    //Проверка на смерть
    if(par.health <= 0 || typeof par.health != 'number'){
      this.type = 'corpse'
      this.status = {send: false, view: true}
      Game.message('autoLanguage;location:' + this.location + ';noId:' + this.id, (l)=>f.s(Bundle[l].events.deadSee, this.id))
    }

    //Регенерация и откат времени атаки
    if(par.health > par.maxHealth)par.health -= (par.regeneration > par.health - par.maxHealth ? par.health - par.maxHealth : par.regeneration)

    par.regenerationTime += s
    if(par.regenerationTime >= par.regenerationInterval){
      if(par.health < par.maxHealth)par.health += (par.regeneration > par.maxHealth - par.health ? par.maxHealth - par.health : par.regeneration)
      par.regenerationTime = 0
    }

    if(par.attackTime > 0)par.attackTime -= s
    if(par.attackTime < 0)par.attackTime = 0
  }
}

class Event{
  #timer = 0
  #time
  #func
  #endCode
  get timer(){
    return this.#timer
  }
  get time(){
    return this.#time
  }
  constructor(func = (code) => console.log("HELLO WORLD"), time = 0, parameters = {endCode}, startFunc){
    for(let i in parameters)this[i] = parameters[i]
    this.#endCode = parameters.endCode ?? 0
    while(Game.events.has(this.i) || !this.i)this.i = String(Math.floor(Math.random() * 100))
    if(this.one){
      Game.events.forEach(event => {
        let y = true
        for(let i in this)
          if(this[i] != event[i] && i != 'i'){
            y = false
            break
          }
        if(y)throw Error('Duplicate event')
      });
    }
    Game.events.set(this.i, this)
    this.#time = time
    this.#func = func
    this.t = setInterval(() => {
      this.#timer++
    }, 100);

    if(startFunc)startFunc()
    this.#start()
  }
  async #start(){
    setTimeout(() => {
      if(Game.events.has(this.i))this.end(this.#endCode)
    }, this.#time)
  }
  async end(code){
    clearInterval(this.t)
    if(!Game.events.has(this.i))return new Error("This event does not exist")
    Game.events.delete(this.i)
    return this.#func(...arguments)
  }
}

module.exports = {
  Location,
  Enemy,
  Event
}