//const host = 'smokeofanarchy.duckdns.org:6852'
//const host = 'localhost:6852'
const host = '192.168.1.205:6852'

const cookieTime = "; max-age=31622400"

const lines = 3, backgrounds = 3, languages = {ru: 'Русский', en: 'English'}

if(document.location.search.split('?').length > 2)document.location.href = document.location.origin + document.location.pathname + '?' + document.location.href.split('?')[1]

function hash(data){
  return CryptoJS.MD5(data).toString()
}


let text5 = '404', text6 = '404'

function jsonToStr(json){
  return JSON.stringify(json)
}
function strToJson(str){
  return JSON.parse(str)
}
var password,
    urlParams = document.cookie.split('; '),
    params = {};

urlParams.forEach((p) => {
  let par, key
  [par, key] = [p.split('=').pop(), p.split('=').shift()]
  params[key] = par;
});
console.log(params)

if(!params.password && document.location.pathname != '/password.html')document.location.href = './password.html'


function updateSetting(form){
  var url = document.location.href
  if(form.language)
    document.cookie = 'language=' + form.language.value + cookieTime

  if(form.line)
    document.cookie = 'line=' + form.line.value + cookieTime
    
  if(form.background)
    document.cookie = 'background=' + form.background.value + cookieTime
}

function sendPassword(form){
  document.cookie = 'password=' + form.password.value + cookieTime
  document.location.href = './index.html'
}


if(!params.language || Object.keys(languages).toString().search(params.language) == -1){
  updateSetting({language: {value: 'ru'}})
}

if(!params.line || parseInt(params.line) > 3 || parseInt(params.line) < 1){
  updateSetting({line: {value: '1'}})
}

if(!params.background || parseInt(params.background) > 3 || parseInt(params.background) < 1){
  updateSetting({background: {value: '1'}})
  console.log('!!!')
}

try{
  for(let i in languages){
    let lan = document.createElement('option')
    lan.value = i
    lan.id = 'language-' + i
    lan.innerText = languages[i]
    document.getElementById('language-select').prepend(lan)
  }

  for(let i = lines; i > 0; i--){
    let line = document.createElement('option')
    line.value = i
    line.id = 'text-line_' + i
    document.getElementById('line-select').prepend(line)
  }

  for(let i = backgrounds; i > 0; i--){
    let bg = document.createElement('option')
    bg.value = i
    bg.id = 'text-background_' + i
    bg.innerText = i + ')'
    document.getElementById('background-select').prepend(bg)
  }
  document.getElementById('language-' + params.language).selected = true
  document.getElementById('text-line_' + params.line).selected = true
  document.getElementById('text-background_' + params.background).selected = true
}catch(err){console.log(err)}



//Background
document.body.style.backgroundImage = `url(./Background-${params.background}.jpeg)`
//document.getElementById('setting').style.backgroundImage = `url(./Background-${params.background}.jpeg)`