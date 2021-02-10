class Object{
  id
  constructor(par = {id}){
    for(let i in par){
      if(par[i])this[i] = par[i]
    }
    if(!this.id)this.id = global.Game.generateID()
  }
}

class Location extends Object{
  name
  constructor(par = {name, id}){
    super(par)
    this.name = par.name
  }
}

class Enemy extends Object{
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