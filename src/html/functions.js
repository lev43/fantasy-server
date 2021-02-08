const host = 'localhost:6852'
//const host = 'smokeofanarchy.duckdns.org:6852'


function hash(data){
  return CryptoJS.MD5(data).toString()
}

close = `
<body>
  <form id='close-message' style="position: fixed; right: 60%; top: 32%; margin: auto; width: max-content; height: max-content;"> 
    <h1 style="position: fixed;">Закрыто</h1> 
    <br><br> 
    <h3 style="position: fixed;"> <a href="http://${host}">Зайти заново</a> </h3> 
  </form>
</body>
`


function jsonToStr(json){
  return JSON.stringify(json)
}
function strToJson(str){
  return JSON.parse(str)
}
var password