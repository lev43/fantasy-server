class Location{
  name
  id
  constructor(par = {name, id}){
    for(let i in par){
      if(par[i])this[i] = par[i]
    }
    if(!this.id)this.id = global.Game.generateID()
  }
}

module.exports = {
  Location: Location
}