if ("WebSocket" in window) {
  var ws = new WebSocket(`ws://${host}`);
  document.getElementById('setting').action = document.location.href

  function sendMessage(msg){
    //console.log(password)
    ws.send(jsonToStr({type: 'player-message', password: password, content: msg, language: params.language}))
  }

  ws.onopen = ()=>{
    console.log("Start ws")
    if(params.password){
      password=hash(params.password);
      ws.send(jsonToStr({type: 'player-key', content: password}))
    }else document.location.href = document.location.origin + '/password.html' + '?' + (document.location.href.split('?').slice(1).join('?') ?? '')
  }

  ws.onclose = ()=>{
    console.log("WebSocket close")
    alert(text6)
    document.body.innerHTML = close
  }

  ws.onerror = (err) => { 
    console.log(err)
  }

  ws.onmessage = (message)=>{
    //console.log(message.data)
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
}else alert(text5)