const { Location, Entity } = require("./objects");
const events = require('events');

class ContentMap extends Map{
  #type = ContentMap
  constructor(arr, type){
    if(arr)arr.forEach(p => {
      p[1] = new type(p[1])
    })
    super(arr)
    this.type = type
  }
  add(par = {}){
    let obj = new this.type(par)
    return super.set(obj.id, obj)
  }
  delete(id){
    if(super.delete(id)){
      Game.id.delete([...Game.id.entries()].find(i => i[1] == id)?.[0])
      return true
    }else return false
  }
  getByParameters(parameters){
    return new this.constructor([...this].filter(obj => {
      let y = true
      for(let i in parameters){
        if(i.split('_').pop() != 'not'){
          if(parameters[i + '_not'])
            (readObj(obj[1], i) + '' == parameters[i] + '' ? y = false : null)
          else
            (readObj(obj[1], i) + '' != parameters[i] + '' ? y = false : null)
        }
      }
      return y
    }), this.type)
  }
}

class LocationMap extends ContentMap{
  #spawn
  #type = LocationMap
  constructor(arr){super(arr, Location)}
  spawn(type = 'null'){
    var spawns = this.getByParameters({"spawn.type": type})
    return [...spawns.values()][Math.floor(Math.random() * spawns.size)]?.id
  }
  delete(id){
    this.get(id)?.roads_save.forEach( loc => {
      this.get(loc)?.roads.delete(id)
    })
    return super.delete(id)
  }
  hasRoad(id1, id2){
    return this.get(id1)?.roads.has(id2)
  }
  addRoad(id1, id2, mod = 0){
    if(this.has(id1) && this.has(id2)){
      let a = 0
      a += this.get(id1).roads.add(id2) ?? 0
      if(mod)a += this.get(id2).roads.add(id1) ?? 0
      return a
    }else return false
  }
  deleteRoad(id1, id2, mod = 0){
    if(this.has(id1)){
      if(mod){
        let a = 0
        a += this.get(id1)?.roads.delete(id2) ?? 0
        a += this.get(id2)?.roads.delete(id1) ?? 0
        return a
      }else return this.get(id1).roads.delete(id2)
    }else return false
  }
}

class EntityMap extends ContentMap{
  #type = EntityMap
  constructor(arr){super(arr, Entity)}
  add(parameters){
    if(parameters.training){
      setTimeout(()=>Game.training(parameters.id), 1)
    }
    super.add(parameters)
  }
  delete(id){
    Game.nickname.delete(id)
    return super.delete(id)
  }
}

module.exports = {
  ContentMap,
  LocationMap,
  EntityMap
}