const fs = require('fs')
const DATA = global.DATA

var date_ = new Date()
function date(){
  return date_.toDateString()
}

function log(data, name, url, time=true){
  fs.stat(`${DATA}/logs/<${date()}>/`, (err, stat)=>{
    if(err)if(err.code == 'ENOENT')
      fs.mkdirSync(`${DATA}/logs/<${date()}>/`)
    else console.log('Some other error: ', err.code);


    let url_ = `${DATA}/logs/${`/<${date()}>/`}${(url?url+'/':'')}${name?name:'last'}_log.txt`,
        data_ = `${time?`<${date_.toLocaleTimeString()}>`:''} ${data}\n`
    fs.stat(url_, function(err, stat) {
      if(!err) {
        fs.appendFile(url_, data_, 'utf-8', (err)=>{if(err)throw err})
      } else if(err.code == 'ENOENT') {
        fs.writeFile(url_, data_, (err)=>{if(err)throw err})
      } else {
          console.log('Some other error: ', err.code);
      }
    })
  })
}

if(!global.f)global.f = {
  jsonToStr(json){
    return JSON.stringify(json)
  },
  strToJson(str){
    return JSON.parse(str)
  },
  log: log,
  con(data, name, url){
    console.log(data)

    log(data, name, url)
  },
  mapToArr(map){
    let arr = []
    if(map)map.forEach((value, key) => arr.push([key, value]))
    return arr
  }
}


module.exports = global.f