const { Location, Enemy } = require("./objects");
const events = require('events');

class LocationMap extends Map{
  #spawn
  constructor(arr){
    if(arr)arr.forEach(loc => {
      loc[1] = new Location(loc[1])
    })
    super(arr)
  }
  add(par = {name, id}){
    let loc = new Location(par)
    return super.set(loc.id, loc)
  }
  set spawn(id){
    if(this.has(id))this.set('spawn', id)
  }
  get spawn(){
    return this.get('spawn')?.id ?? this.get('spawn')
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
  getByParameters(parameters){
    return new Map([...this].filter(location => {
      let y = true
      for(let i in parameters)
        if(i.split('_').pop() != 'not')
          if(parameters[i+'_not'])
            (location[1][i] == parameters[i] ? y = false : null)
          else
            (location[1][i] != parameters[i] ? y = false : null)
      return y
    }))
  }
}

class EnemyMap extends Map{
  constructor(arr){
    if(arr)arr.forEach(enm => {
      enm[1] = new Enemy(enm[1])
    })
    super(arr)
  }
  add(par = {id, location}){
    let enemy = new Enemy(par)
    return super.set(enemy.id, enemy)
  }
  getByParameters(parameters){
    return new Map([...this].filter(enemy => {
      let y = true
      for(let i in parameters)
        if(i.split('_').pop() != 'not')
          if(parameters[i+'_not'])
            (enemy[1][i] == parameters[i] ? y = false : null)
          else
            (enemy[1][i] != parameters[i] ? y = false : null)
      return y
    }))
  }
}

module.exports = {
  LocationMap,
  EnemyMap
}