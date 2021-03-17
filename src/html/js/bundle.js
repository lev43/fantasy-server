console.log('Language:', params.language)
const bundleList = [
  'text1', 
  'text2'
]
var bundle = {}
bundleList.forEach(element => {
  bundle[element] = document.getElementById(element) ?? {}
})

//console.log(!text1, !text2, !text3, !text4)

switch(params.language){
  default:
  case 'ru':
    bundle.text1.innerText = ''
    bundle.text2.innerText = ''
    break
  case 'en':
    bundle.text1.innerText = ''
    bundle.text2.innerText = ''
    break
}