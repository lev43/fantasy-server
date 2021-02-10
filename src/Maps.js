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
    this.set('spawn', this.get(id))
  }
  get spawn(){
    return this.get('spawn')?.id
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
}

module.exports = {
  LocationMap,
  EnemyMap
}