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
  constructor(par = {id, location, language}){
    super(par)
    if(!par.location)this.location = Game.location.spawn
    else this.location = par.location
    this.player = Game.users.has(this.id)
    Game.nickname.set(this.id, {})
    Game.nickname.get(this.id)[this.id] = Bundle[this.language].names.enemy.default
  }
  send(msg){
    Game.users.get(this.id)?.send(msg)
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