const fs = require('fs')
process.on('uncaughtException', (err, origin) => {
  //console.log(err)
  fs.appendFile('test.txt', `code: ${err.code}\nmessage: ${err.message}\nstack: ${err.stack}\n`, () => {})
});

setTimeout(() => {
  console.log('This will still run.');
}, 500);

// Intentionally cause an exception, but don't catch it.
throw Error('Hello!')
console.log('This will not run.');