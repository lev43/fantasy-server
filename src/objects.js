class MyObject{
  id
  constructor(par = {id}){
    for(let i in par){
      if(par[i])this[i] = par[i]
    }
    if(!this.id)this.id = global.Game.generateID()
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
    if(!par.location)this.location = global.Game.location.spawn
    else this.location = par.location
  }
}

module.exports = {
  Location,
  Enemy
}