a = {
  a(){
    return 'a'
  },
  b(){
    console.log(this.a())
  }
}

a.b()