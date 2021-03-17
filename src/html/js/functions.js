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



if(!params.password && document.location.pathname != '/password.html')document.location.href = './password.html'


function updateSetting(form){
  if(form.line)
    document.cookie = 'line=' + form.line.value + cookieTime
    
  if(form.background)
    document.cookie = 'background=' + form.background.value + cookieTime

  if(form.language){
    document.cookie = 'language=' + form.language.value + cookieTime
    document.location.href = '/' + form.language.value + '-' + document.location.pathname.split('-').pop()
  }else document.location.reload()
}

function sendPassword(form){
  document.cookie = 'password=' + form.password.value + cookieTime
  document.location.href = `./${params.language}-index.html`
}


if(!params.language || params.language == "undefined" || Object.keys(languages).toString().search(params.language) == -1){
  updateSetting({language: {value: 'ru'}})
}

if(!params.line || params.line == "undefined" || parseInt(params.line) > 3 || parseInt(params.line) < 1){
  updateSetting({line: {value: '1'}})
}

if(!params.background || params.background == "undefined" || parseInt(params.background) > 3 || parseInt(params.background) < 1){
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
  try{
    for(let i = lines; i > 0; i--){
      let line = document.getElementById('line-select').options[i - 1]
      line.id = 'text-line_' + i
      line.value = i
    }
  }catch(err){}
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
}catch(err){if(err.message != "Cannot read property 'prepend' of null")throw err}



//Background
document.body.style.backgroundImage = `url(./Background-${params.background}.jpeg)`
//document.getElementById('setting').style.backgroundImage = `url(./Background-${params.background}.jpeg)`