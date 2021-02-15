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
    this.p = new Proxy(loc.roads, {
      get: function(){
        loc.roads_save = [...loc.roads]
        return loc.roads
      }
    })
    Object.defineProperty(this, 'roads', {
      enumerable: false
    })
  }
}

class Enemy extends MyObject{
  location
  constructor(par = {id, location}){
    super(par)
    if(!par.location)this.location = Game.location.spawn
    else this.location = par.location
  }
  send(msg){
    Game.users.get(this.id)?.send(msg)
  }
}

module.exports = {
  Location,
  Enemy
}