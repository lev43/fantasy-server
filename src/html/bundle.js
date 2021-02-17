if(!params.language)params.language = 'ru'
console.log('Language:', params.language)
let text1 = document.getElementById('text1')
let text2 = document.getElementById('text2')
let text3 = document.getElementById('text3')
let text4 = document.getElementById('setting-button')
let text7 = document.getElementById('text7')

//console.log(!text1, !text2, !text3, !text4)

switch(params.language){
  default:
  case 'ru':
    if(text1)text1.innerText = 'Введите код персонажа'
    if(text2)text2.innerText = 'Внимание! Если кто-то узнает этот код, он сможет играть за вашего персонажа'
    if(text3)text3.value = 'Принять'
    if(text4)text4.innerText = 'Настройки'
    if(text5)text5 = 'Ваш браузер не поддерживается!'
    if(text6)text6 = 'Соединение закрыто'
    if(text7)text7.innerText = 'Язык'
    break
  case 'en':
    if(text1)text1.innerText = 'Enter code of person'
    if(text2)text2.innerText = 'Attention! If someone recognizes this code, they can play as your character'
    if(text3)text3.value = 'Accept'
    if(text4)text4.innerText = 'Setting'
    if(text7)text7.innerText = 'Language'
    close = `
<body>
  <form id='close-message' style="position: fixed; right: 60%; top: 32%; margin: auto; width: max-content; height: max-content;"> 
    <h1 style="position: fixed;">Close</h1> 
    <br><br> 
    <h3 style="position: fixed;"> <a href="${document.URL}">Login again</a> </h3> 
  </form>
</body>
`
    if(text5)text5 = 'Your browser is not supported!'
    if(text6)text6 = 'Connection closed'
    break
}