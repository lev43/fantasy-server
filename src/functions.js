const fs = require('fs')
const DATA = global.DATA

var date_ = new Date()
function date(){
  return date_.toDateString()
}

function log(data, name, url){
  fs.stat(`${DATA}/<${date()}> logs/`, (err, stat)=>{
    if(err)if(err.code == 'ENOENT')
      fs.mkdirSync(`${DATA}/<${date()}> logs/`)
    else console.log('Some other error: ', err.code);


    fs.stat(`${DATA}/${`/<${date()}> logs/`}${(url?url+'/':'')}${name?name:'last'}_log.txt`, function(err, stat) {
      if(!err) {
        fs.appendFile(`${DATA}/<${date()}> logs/${(url?url+'/':'')}${name?name:'last'}_log.txt`, data+'\n', 'utf-8', (err)=>{if(err)throw err})
      } else if(err.code == 'ENOENT') {
        fs.writeFile(`${DATA}/<${date()}> logs/${(url?url+'/':'')}${name?name:'last'}_log.txt`, data+'\n', (err)=>{if(err)throw err})
      } else {
          console.log('Some other error: ', err.code);
      }
    })
  })
}

global.f = {
  js(json){
    return JSON.stringify(json)
  },
  sj(str){
    return JSON.parse(str)
  },
  log: log,
  con(data, name, url){
    console.log(data)

    log(data, name, url)
  }
}


module.exports = global.f