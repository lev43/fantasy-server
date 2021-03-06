let d = new Date().getSeconds(), d_ = d
function time(){
  const t = ( new Date().getSeconds() - d )
  d = d_
  d_ = new Date().getSeconds()
  return t
}
console.log(time())
let i1 = setInterval( () => console.log(time()), 1000)
let i2// = setInterval( () => console.log(time()), 2000)
setTimeout( () => {clearInterval(i1); clearInterval(i2)}, 5000)