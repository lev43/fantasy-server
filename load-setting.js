const reader = require('properties-reader');
Setting = reader('./src/DATA/setting.properties', {writer: { saveSections: true }});
Bundle_ = {
  ru: reader('./src/DATA/bundles/bundle_ru.properties'),
  en: reader('./src/DATA/bundles/bundle_en.properties')
}
Bundle = {}
for(let i in Bundle_){
  Bundle[i] = {}
  Bundle[i].commands = Bundle_[i].path().commands
}
console.log(Bundle)