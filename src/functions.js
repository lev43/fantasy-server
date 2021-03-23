const fs = require('fs')

var date_ = new Date()
setInterval(()=>date_ = new Date(), 1000)
var d = new Date().getSeconds()
date = function(){
  let d = date_.toLocaleDateString()
  if(d.split('/'))d = d.split('/').join('.')
  return d
}

readObj = function(obj, path){
  if(Object.keys(obj).join(';').search(path) != -1)return obj[path]
  for(let i of path.split('.'))
    if(obj[i])obj = obj[i]
    else throw Error('Not element ' + i)
  return obj
}

setObj = function(obj, path, value){
  path = path.split('.')
  if(!obj[path])for(let i of path.slice(0, path.length - 1)){
    i = (parseInt(i) + '' == 'NaN' ? i : parseInt(i))
    if(obj[i])obj = obj[i]
    else throw Error('Not element ' + i)
  }
  try{
    value = JSON.parse(value)
  }catch(err){}
  obj[path.pop()] = value
  return obj
}

readFiles = function(path, obj, rootPath = './src'){
  fs.readdirSync(rootPath + path).forEach(file => {
    let pathFile = path + file
    //console.log(pathFile)
    try{
      obj[pathFile] = fs.readFileSync(rootPath + pathFile)
    }catch(err){
      if(err.code == 'EISDIR')readFiles(pathFile + '/', obj, rootPath)
      else if(err.code == 'EACCES'){}
      else if(err.code == 'ENOENT')console.log("Not file " + file, pathFile)
      else throw err
    }
  })
}

log = function(data, name, url, time = true){
  fs.stat(`${DATA}/logs/<${date()}>/`, (err, stat)=>{
    if(err)if(err.code == 'ENOENT')
      fs.mkdirSync(`${DATA}/logs/<${date()}>/`)
    else console.log('Some other error: ', err.code);


    const url_ = `${DATA}/logs/<${date()}>/${(url?url + '/':'')}`,
          data_ = `${time?`<${date_.toLocaleTimeString()}>`:''} ${data}\n`,
          file = `${name?name:'last'}_log.txt`
    fs.stat(url_, function(err, stat) {
      //console.log(url_)
      if(err)if(err.code == 'ENOENT') {
        try{
          fs.mkdirSync(url_)
        }catch(err){if(err.code != 'EEXIST')throw err}
      } else {
        console.log('Some other error: ', err.code);
      }
      fs.appendFile(url_ + file, data_, 'utf-8', (err)=>{
        if(err)if(err.code == 'ENOENT')fs.writeFile(url_ + file, data_, (err)=>{if(err)throw err})
        else throw err
      })
    })
  })
}

con = function(data, name, url){
  console.log(data)

  log(data, name, url)
}

f = {
  jsonToStr(json){
    return JSON.stringify(json)
  },
  strToJson(str){
    return JSON.parse(str)
  },
  mapToArr(map){
    let arr = []
    if(map)map.forEach((value, key) => arr.push([key, value]))
    return arr
  },
  s(text, ...args){
    for(let i=0; i<args.length; i++)text = text.replace('%s', args[i])
    text = text.replaceAll('\\n', '\n')
    return text
  }
}


module.exports = f