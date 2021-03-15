//const host = 'smokeofanarchy.duckdns.org:6852'
//const host = 'localhost:6852'
const host = '192.168.1.205:6852'

const lines = 3, backgrounds = 3, languages = {ru: 'Русский', en: 'English'}

if(document.location.search.split('?').length > 2)document.location.href = document.location.origin + document.location.pathname + '?' + document.location.href.split('?')[1]

function hash(data){
  return CryptoJS.MD5(data).toString()
}
close = `
<body>
  <form id='close-message' style="position: fixed; right: 60%; top: 32%; margin: auto; width: max-content; height: max-content;"> 
    <h1 style="position: fixed;">Закрыто</h1> 
    <br><br> 
    <h3 style="position: fixed;"> <a href="${document.URL}">Зайти заново</a> </h3> 
  </form>
</body>
`
let text5 = '404', text6 = '404'

function jsonToStr(json){
  return JSON.stringify(json)
}
function strToJson(str){
  return JSON.parse(str)
}
var password
urlParams = new URLSearchParams(window.location.search);
params = {};

urlParams.forEach((p, key) => {
  params[key] = p;
});

if(!params.password && document.location.pathname != '/password.html')document.location.href = document.location.origin + '/password.html' + '?' + (document.location.href.split('?').slice(1).join('?') ?? '')


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


function updateSetting(form){
  var url = document.location.href
  if(form.language)
    if(!params.language || url.search('language=' + params.language) == -1)
      url += (url.split('?')[1] ? '&' : (url.indexOf('?') != -1 ? '' : '?')) + 'language=' + form.language.value
    else
      url = url.replace('language=' + params.language, 'language=' + form.language.value)

  if(form.line)
    if(!params.line || url.search('line=' + params.line) == -1)
      url += (url.split('?')[1] ? '&' : (url.indexOf('?') != -1 ? '' : '?')) + 'line=' + form.line.value
    else
      url = url.replace('line=' + params.line, 'line=' + form.line.value)
    
  if(form.background)
    if(!params.background || url.search('background=' + params.background) == -1)
      url += (url.split('?')[1] ? '&' : (url.indexOf('?') != -1 ? '' : '?')) + 'background=' + form.background.value
    else
      url = url.replace('background=' + params.background, 'background=' + form.background.value)

  document.location.href = url
}

function sendPassword(form){
  document.location.href = document.location.origin + '/index.html?' + (document.location.href.split('?').slice(1).join('?') ?? '') + '&password=' + form.password.value
}


if(!params.language || Object.keys(languages).toString().search(params.language) == -1){
  updateSetting({language: {value: 'ru'}})
}
document.getElementById('language-' + params.language).selected = true

if(!params.line || parseInt(params.line) > 3 || parseInt(params.line) < 1){
  updateSetting({line: {value: '1'}})
}
document.getElementById('text-line_' + params.line).selected = true

if(!params.background || parseInt(params.background) > 3 || parseInt(params.background) < 1){
  updateSetting({background: {value: '1'}})
}
document.getElementById('text-background_' + params.background).selected = true



//Background
document.body.style.backgroundImage = `url(./Background-${params.background}.jpeg)`
//document.getElementById('setting').style.backgroundImage = `url(./Background-${params.background}.jpeg)`