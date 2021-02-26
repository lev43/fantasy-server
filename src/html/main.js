if ("WebSocket" in window) {
  var ws = new WebSocket(`ws://${host}`);
  var timers = []
  document.getElementById('setting').action = document.location.href

  function sendMessage(msg){
    //console.log(password)
    ws.send(jsonToStr({type: 'player-message', password: password, content: msg, language: params.language}))
  }

  ws.onopen = ()=>{
    console.log("Start ws")
    if(params.password){
      password=hash(params.password);
      ws.send(jsonToStr({type: 'player-key', content: password, language: params.language}))
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
        while(data.content.indexOf('%timer{') != -1){
          let t = parseInt(data.content.slice(data.content.indexOf('%timer{')+7, data.content.indexOf('}%timer')))
          let lastMessage
          if(data.content.indexOf('}%timer%lastMessage{') != -1)
            lastMessage = {
              msg: data.content.slice(data.content.indexOf('}%timer%lastMessage{') + 20, data.content.indexOf('}%timer%lastMessage_')),
              replaceMessage: data.content.slice(0, data.content.search('%timer{')) + `͏X` + data.content.slice(data.content.search('}%timer%lastMessage_') + 20)
            }
          let timer = setInterval(()=>{
            if(t <= 1 || ''+t == 'NaN')clearInterval(timer)
            t--
            let text = document.getElementById("channel").innerText
            document.getElementById("channel").innerText = document.getElementById("channel").innerText.replace(`«${t+1}»`, `${`«${t}»`}`)
            if(t < 1 && lastMessage?.msg){
              document.getElementById("channel").innerText = document.getElementById("channel").innerText.replace(`«${t}»`, 'X')
              document.getElementById("channel").innerText = document.getElementById("channel").innerText.replace(lastMessage.replaceMessage, lastMessage.msg)
            }
          }, 1000)

          data.content = data.content.slice(0, data.content.search('%timer{')) + `͏«${t}»` + ( data.content.indexOf('}%timer%lastMessage_') != -1 ? data.content.slice(data.content.search('}%timer%lastMessage_') + 20) : data.content.slice(data.content.search('}%timer') + 7) )
        }
        document.getElementById('channel').innerText = `${data.content}\n${document.getElementById("channel").innerText}`
        break;
      case 'err':
        alert(data.content)
        document.location.href = 'http://' + document.location.host + '/password.html'
        ws.close()
        break;
    }
  }
}else alert(text5)