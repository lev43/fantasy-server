const { Location } = require("./objects");

class LocationMap extends Map{
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
}

module.exports = {
  LocationMap: LocationMap
}