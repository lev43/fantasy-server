class A{
  i = 0
  new(){
    this.i++
    return new this.constructor
  }
}

var a = new A

console.log(a.i, a.new().new().new(), a.new(), a.i)