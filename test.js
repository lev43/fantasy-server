const { writeFileSync, readFileSync } = require("fs")

class Location{
  name
  id
  constructor(par = {name, id}){
    for(let i in par){
      if(par[i])this[i] = par[i]
    }
    if(!this.id)this.id = Math.random()
  }
}

writeFileSync('t.json', JSON.stringify(new Location({name: 'test'})))

console.log(readFileSync('t.json', 'utf8'))
console.log(new Location(JSON.parse(readFileSync('t.json'))))