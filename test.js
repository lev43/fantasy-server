const { mapToArr } = require("./src/functions")

let m = new Map([['a', 'b'], ['b', 'c']]), arr = []

console.log(m.get('a'), m.get('b'), m.get('c'))

m.forEach((value, key)=>{
  arr.push([key, value])
})

m = new Map(arr)
m.set('c', 'a')

console.log(m.get('a'), m.get('b'), m.get('c'))

console.log(JSON.stringify(arr))