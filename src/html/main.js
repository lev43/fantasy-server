if ("WebSocket" in window) {
  var ws = new WebSocket(`ws://${host}`);

  function sendPassword(pas){
    password=hash(pas);
    ws.send(jsonToStr({type: 'player-key', content: hash(pas)}))
    document.getElementById('password').hidden=true
    document.getElementById('channel-p').hidden=false
  }
  function sendMessage(msg){
    //console.log(password)
    ws.send(jsonToStr({type: 'player-message', password: password, content: msg}))
  }
  ws.onopen = ()=>{
    console.log("Start ws")
    document.getElementById("password").hidden=false
  }

  ws.onclose = ()=>{
    console.log("WebSocket close")
    alert("Соединение закрыто")
    document.body.innerHTML = close
  }

  ws.onmessage = (message)=>{
    console.log(message.data)
    data = strToJson(message.data)
    switch(data.type){
      case 'msg':
        document.getElementById('channel').innerText = `${data.content}\n${document.getElementById("channel").innerText}`
        break;
      case 'err':
        alert(data.content)
        ws.close()
        break;
    }
  }
}else alert("Ваш браузер не поддерживается!")