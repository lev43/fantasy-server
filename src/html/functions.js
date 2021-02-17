//const host = 'smokeofanarchy.duckdns.org:6852'
const host = 'localhost:6852'


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

function updateSetting(form){
  if(document.location.href.search('&language=' + params.language) == -1)
    document.location.href += '&language=' + form.language.value
  else
    document.location.href = document.location.href.replace('&language=' + params.language, '&language=' + form.language.value)
}

function sendPassword(form){
  document.location.href = document.location.origin + '/index.html' + '?' + (document.location.href.split('?').slice(1).join('?') ?? '') + '&password=' + form.password.value
}