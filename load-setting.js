const reader = require('properties-reader');
const fs = require('fs')
Setting = reader('./src/DATA/setting.properties', {writer: { saveSections: true }});
Bundle_ = {
  ru: reader('./src/DATA/bundles/bundle_ru.properties'),
  en: reader('./src/DATA/bundles/bundle_en.properties')
}
Bundle = {}
for(let i in Bundle_){
  Bundle[i] = {}
  Bundle[i].commands = Bundle_[i].path().commands
  Bundle[i].events = Bundle_[i].path().events
  Bundle[i].names = Bundle_[i].path().names
}

Patterns = {}
let files = fs.readdirSync('./src/DATA/patterns', 'utf-8')
files.filter(file => file.split('.').pop() == 'json').forEach(file => {
  const json = JSON.parse(fs.readFileSync('./src/DATA/patterns/' + file))
  Patterns[file.split('.').shift()] = json
})