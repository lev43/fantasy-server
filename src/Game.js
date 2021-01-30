const fs = require('fs')
const {js, sj, log} = global.f

class id_manager{
  id = {}
  get(hash){
    if(hash)return this.id[hash]
    else    return this.id
  }
  has(id){
    for(let i in this.id)
      if(id==this.id[i])return true
    return false
  }
  generate(hash){
    let id;
    while(this.has(id) || !id){
      id = Math.floor(Math.random()*1000000000)
    }
    if(hash)this.id[hash] = id
    else this.id[id] = id
    return id
  }
  del(i){
    delete this.id[i]
  }
}

class user_manager{
  users = {}
  get(id){
    if(id)return this.users[id]
    else  return this.users
  }
  has(id){
    for(let i in this.users)
      if(id==i)return true
    return false
  }
  new(id, ws){
    this.users[id] = ws
  }
  del(id){
    delete this.users[id]
  }
}

class Game{
  users = new user_manager
  id = new id_manager
  constructor(){
  }
  load(){

  }
  save(){

  }
  update(users){
    this.users.users = users
  }
  player(hash, message){
    let id = this.id.get(hash)
    if(!id)return

    for(let user in this.users.get()){
      this.users.get(user).send(js({type: 'msg', content: `${id}: ${message}`}))
    }
    log(`Message<${id}>: ${message}`, 'messages')
  }
}


global.Game = new Game()
module.exports = global.Game