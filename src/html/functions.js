//const host = 'smokeofanarchy.duckdns.org:6852'
//const host = 'localhost:6852'
const host = '192.168.1.205:6852'
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

  document.location.href = url
}

function sendPassword(form){
  document.location.href = document.location.origin + '/index.html?' + (document.location.href.split('?').slice(1).join('?') ?? '') + '&password=' + form.password.value
}


if(!params.language || ['ru', 'en'].toString().search(params.language) == -1){
  updateSetting({language: {value: 'ru'}})
}

if(!params.line || ['1', '2', '3'].toString().search(params.line) == -1){
  updateSetting({line: {value: '1'}})
}