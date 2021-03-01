class MyObject{
  id
  constructor(par = {id}){
    for(let i in par){
      if(par[i])this[i] = par[i]
    }
    if(!this.id)this.id = Game.generateID()
  }
}

class Location extends MyObject{
  name
  roads = new Set()
  roads_save = []
  constructor(par = {name, id, roads_save}){
    super(par)
    this.name = par.name
    if(par.roads_save)this.roads = new Set(par.roads_save)
    
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
    Game.emit('local-message', this.id, id, msg)
  }
}

class Enemy extends MyObject{
  location
  language = 'ru'
  save_par = {}
  _type = 'enemy'
  status = {send: true, view: true}
  get healthStat(){
    const {health, maxHealth} = this.parameters
    let s
    if(health > maxHealth)     s = 0
    if(health == maxHealth)    s = 1
    if(health < maxHealth)     s = 2
    if(health <= maxHealth / 2)s = 3
    if(health <= maxHealth / 4)s = 4
    if(health <= maxHealth / 8)s = 5
    return s
  }
  get type(){
    return this._type
  }
  set type(value){
    this.save_par[this._type] = Object.assign({}, this.parameters)
    this._type = value


    if(this.save_par[value])this.parameters = Object.assign({}, this.save_par[this._type])
    else this.parameters = Object.assign(this.parameters ?? {}, Patterns[value])
  }

  constructor(par = {id, location, language, parameters}){
    super(par)
    if(!par.location)this.location = Game.location.spawn
    else this.location = par.location


    this.player = Game.users.has(this.id)
    if(this.player)this.type = 'player'


    if(par.parameters)this.parameters = par.parameters
    else this.parameters = Object.assign(this.parameters ?? {}, Patterns[this.type])


    Game.nickname.set(this.id, {})
    Game.nickname.get(this.id)[this.id] = Bundle[this.language].names.enemy.default
  }

  async send(msg){
    Game.users.get(this.id)?.send(msg)
  }

  async bury(){
    if(this.type != 'corpse')return false
    Game.enemy.delete(this.id)
    Game.id.forEach((id, i) => {
      if(id == this.id)Game.id.delete(i)
    })
    Game.nickname.delete(this.id)
    this.send({type: 'err', content: Bundle[this.language].events.youBury})
    return true
  }

  async attack(id){
    try{
      Game.emit('attack', this.id, id)
    }catch(err){
      if(err.message == 'location of attacking is not defender location')return false
      else throw err
    }
  }

  async damage(damage){
    this.parameters.health -= damage
    return damage
  }

  async update(){
    if(this.type == 'corpse'){
      this.send({type: 'msg', content: Bundle[this.language].events.dead})
      this.send({type: 'status', send: false, view: false})
      return
    }
    const par = this.parameters
    if(Game.users.has(this.id))this.player = true
    if(this.player)this.type = 'player'

    if(par.health <= 0){
      this.type = 'corpse'
      this.status = {send: false, view: true};
      [...Game.enemy.values()].filter(enemy => enemy.location === this.location ?? enemy.id != this.id)
        .forEach(enemy => enemy.send({type: 'msg', content: f.s(Bundle[enemy.language].events.deadSee, this.id)}))
    }
    if(par.health < par.maxHealth)par.health += par.regeneration
    if(par.health >= par.maxHealth)par.health = par.maxHealth
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