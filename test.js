a = {
  b: function(){console.log(this.c)},
  c: "HEHEHE"
}

a.b.bind(a)()