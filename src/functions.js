const fs = require('fs')

var date_ = new Date()
function date(){
  let d = date_.toLocaleDateString()
  if(d.split('/'))d = d.split('/').join('.')
  return d
}

function log(data, name, url, time=true){
  fs.stat(`${DATA}/logs/<${date()}>/`, (err, stat)=>{
    if(err)if(err.code == 'ENOENT')
      fs.mkdirSync(`${DATA}/logs/<${date()}>/`)
    else console.log('Some other error: ', err.code);


    const url_ = `${DATA}/logs/${`/<${date()}>/`}${(url?url+'/':'')}${name?name:'last'}_log.txt`,
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

f = {
  jsonToStr(json){
    return JSON.stringify(json)
  },
  strToJson(str){
    return JSON.parse(str)
  },
  log: log, //Требовалось использование log в других функциях, при попытке создать ее тут, возникали проблемы
  con(data, name, url){
    console.log(data)

    log(data, name, url)
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