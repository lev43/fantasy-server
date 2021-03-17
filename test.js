const fs = require('fs')

html = {}

function readFiles(path, obj){
  const rootPath = './src/html'
  fs.readdirSync(rootPath + path).forEach(file => {
    let pathFile = path + file
    try{
      obj[pathFile] = fs.readFileSync(rootPath + pathFile)
    }catch(err){
      if(err.code == 'EISDIR')readFiles(pathFile + '/', obj)
      else if(err.code == 'ENOENT')console.log("Not file " + file, pathFile)
      else throw err
    }
  })
}

readFiles('/', html)
console.log(Object.keys(html))