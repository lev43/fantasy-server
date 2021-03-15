console.log('Language:', params.language)
const bundleList = [
  'text1', 
  'text2', 
  'text-submit', 
  'setting_button', 
  'setting_title', 
  'line-select', 
  'text-language', 
  'text-line', 
  'text-line_1', 
  'text-line_2', 
  'text-line_3',
  'background-select',
  'text-background'
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
    bundle['text-submit'].value = 'Принять'

    bundle.setting_button.innerText = 'Настройки'
    bundle.setting_title.innerText = 'Настройки'

    bundle.text5 = 'Ваш браузер не поддерживается!'
    bundle.text6 = 'Соединение закрыто'

    bundle['text-language'].innerText = 'Язык'

    bundle['text-line'].innerText = 'Линии'
    bundle['text-line'].title = 'Как показывать линии между сообщениями'
    bundle['line-select'].title = 'Как показывать линии между сообщениями'
    bundle['text-line_1'].innerText = 'После каждого сообщения'
    bundle['text-line_2'].innerText = 'Когда начинает писать новая сущность'
    bundle['text-line_3'].innerText = 'Без линий'

    bundle['text-background'].innerText = 'Фон'
    break
  case 'en':
    bundle.text1.innerText = 'Enter code of person'
    bundle.text2.innerText = 'Attention! If someone recognizes this code, they can play as your character'
    bundle['text-submit'].value = 'Accept'
    bundle.setting_button.innerText = 'Setting'
    bundle.setting_title.innerText = 'Setting'
    bundle['text-language'].innerText = 'Language'
    bundle['text-line'].innerText = 'Lines'
    bundle['text-line'].title = 'How to Show Lines Between Posts'
    bundle['line-select'].title = 'How to show lines between messages'
    bundle['text-line_1'].innerText = 'After Every Message'
    bundle['text-line_2'].innerText = 'When new entity starts writing'
    bundle['text-line_3'].innerText = 'No lines'

    bundle['text-background'].innerText = 'Background'
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