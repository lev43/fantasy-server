a = new Map()

a.set('a', 'b')

console.log([...a.values()].find('c'))