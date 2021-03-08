console.log('Language:', params.language)
const bundleList = [
  'text1', 
  'text2', 
  'text3', 
  'setting_button', 
  'setting_title', 
  'line-select', 
  'text7', 
  'text8', 
  'text8_1', 
  'text8_2', 
  'text8_3'
]
var bundle = {}
bundleList.forEach(element => {
  bundle[element] = document.getElementById(element) ?? {}
})

//console.log(!text1, !text2, !text3, !text4)

switch(params.language){
  default:
  case 'ru':
    bundle.text1.innerText = 'Введите код персонажа'
    bundle.text2.innerText = 'Внимание! Если кто-то узнает этот код, он сможет играть за вашего персонажа'
    bundle.text3.value = 'Принять'
    bundle.setting_button.innerText = 'Настройки'
    bundle.setting_title.innerText = 'Настройки'
    bundle.text5 = 'Ваш браузер не поддерживается!'
    bundle.text6 = 'Соединение закрыто'
    bundle.text7.innerText = 'Язык'
    bundle.text8.innerText = 'Линии'
    bundle.text8.title = 'Как показывать линии между сообщениями'
    bundle['line-select'].title = 'Как показывать линии между сообщениями'
    bundle.text8_1.innerText = 'После каждого сообщения'
    bundle.text8_2.innerText = 'Когда начинает писать новая сущность'
    bundle.text8_3.innerText = 'Без линий'
    break
  case 'en':
    bundle.text1.innerText = 'Enter code of person'
    bundle.text2.innerText = 'Attention! If someone recognizes this code, they can play as your character'
    bundle.text3.value = 'Accept'
    bundle.setting_button.innerText = 'Setting'
    bundle.setting_title.innerText = 'Setting'
    bundle.text7.innerText = 'Language'
    bundle.text8.innerText = 'Lines'
    bundle.text8.title = 'How to Show Lines Between Posts'
    bundle ['line-select']. title = 'How to show lines between messages'
    bundle.text8_1.innerText = 'After Every Message'
    bundle.text8_2.innerText = 'When new entity starts writing'
    bundle.text8_3.innerText = 'No lines'
    close = `
<body>
  <form id='close-message' style="position: fixed; right: 60%; top: 32%; margin: auto; width: max-content; height: max-content;"> 
    <h1 style="position: fixed;">Close</h1> 
    <br><br> 
    <h3 style="position: fixed;"> <a href="${document.URL}">Login again</a> </h3> 
  </form>
</body>
`
    bundle.text5 = 'Your browser is not supported!'
    bundle.text6 = 'Connection closed'
    break
}