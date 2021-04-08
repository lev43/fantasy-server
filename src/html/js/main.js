var send = true, view = true
var messageHistory = [], messageHistoryI = 0
if ("WebSocket" in window) {
  var ws = new WebSocket(`ws://${host}`);
  var i = 1
  const genI = function*(){
    var i = 1
    while(1)yield i++
  }()
  const genIT = function*(){
    var i = 1
    while(1)yield i++
  }()
  document.getElementById('setting').action = document.location.href

  function sendMessage(msg){
    if(messageHistory[messageHistoryI - 1] != msg){
      messageHistoryI = messageHistory.length
      messageHistory[messageHistoryI] = msg
      messageHistoryI++
    }
    if(send)ws.send(jsonToStr({type: 'player-message', password: password, content: msg, language: params.language}))
  }

  var historyF = function(k){
    //console.log("DOWN", k.key, k.code)
    //console.log(messageHistoryI)
    let update = true
    switch(k.code){
      case 'ArrowUp':
        if(messageHistoryI > 0)messageHistoryI--
        break
      case 'ArrowDown':
        messageHistoryI++
        break
      case 'Enter':
        if(this.value){
          sendMessage(this.value)
          this.value = ''
        }
        messageHistoryI = messageHistory.length
        break;
      default: update = false
    }
    if(update){
      this.value = (messageHistory[messageHistoryI] ?? '')
      this.selectionStart = this.value.length
    }
    if(messageHistoryI < 0)messageHistoryI = 0
    if(messageHistoryI > messageHistory.length)messageHistoryI = messageHistory.length
  }.bind(document.getElementById('message'))

  document.getElementById('message').onkeyup = historyF

  ws.onopen = ()=>{
    console.log("Start ws")
    password = hash(params.password);
    ws.send(jsonToStr({type: 'player-key', content: password, language: params.language}))
  }

  ws.onclose = ()=>{
    console.log("WebSocket close")
    document.getElementById('all').hidden = true
    document.getElementById('close').hidden = false
  }

  ws.onerror = (err) => { 
    throw err
  }

  ws.onmessage = (message)=>{
    data = strToJson(message.data)

    let newMessage = document.createElement('code')
    const line = document.createElement('hr')
    line.noShade = true
    line.className = 'line'
    newMessage.className = 'message'


    let mid = (data.content?.indexOf('%mid') ?? -1) != -1 ? data.content.slice(data.content.indexOf('%mid') + 4) : null
    if(mid)data.content = data.content.slice(0, data.content.indexOf('%mid'))


    newMessage.id = 'message-' + (mid ?? genI.next().value)


    switch(data.type){
      case 'msg-edit':
        if(document.getElementById(`message-${data.mid}`))document.getElementById(`message-${data.mid}`).innerText = data.content + '\n'
        break
      case 'msg-delete':
        let m = document.getElementById(`message-${data.mid}`)
        m.parentNode.removeChild(m)
        break
      case 'msg':
        var timers = []
        while(data.content.indexOf('%timer{') != -1){
          let t = parseInt(
            data.content.slice(
              data.content.indexOf('%timer{') + 7, 
              data.content.indexOf('}%timer')
            )
          )

          let timerID = 'timer-' + genIT.next().value

          let interval = setInterval(()=>{
            if(t < 1 || String(t) == 'NaN')clearInterval(interval)
            t--
            let timer = document.getElementById(timerID)
            if(!timer)clearInterval(interval)
            else {
              timer.innerText = timer.innerText.replace(`${t + 1}`, `${`${t}`}`)
              if(t < 0 || String(t) == 'NaN')timer.innerHTML = timer.innerText.replace(`${t}`, '-')
            }
          }, 1000)

          const timer = `<span id="${timerID}" class="timer">${t}</span>`
          timers.push(timer)
          data.content = data.content.slice(0, data.content.search('%timer{')) + '%s_timer' + data.content.slice(data.content.search('}%timer') + 7 )
        }
        newMessage.innerText = data.content + '\n'
        timers.forEach(timer => newMessage.innerHTML = newMessage.innerHTML.replace('%s_timer', timer))
        if(view){
          const lastMessages = document.getElementById('channel').childNodes[0]
          if(lastMessages?.id == data.id){
            lastMessages.prepend(newMessage)
            if(params.line == '1')lastMessages.prepend(line)
          } else {
            const newMessages = document.createElement('code')
            newMessages.className = 'messages'
            newMessages.id = data.id
            if(params.line == '2')newMessages.prepend(line)
            newMessages.prepend(newMessage)
            if(params.line == '1')newMessages.prepend(line)
            document.getElementById('channel').prepend(newMessages)
          }
        }
        break;
      case 'status':
        send = data.send ?? send
        view = data.view ?? view
        document.getElementById('message').hidden = !send
        break
      case 'err':
        alert(data.content)
        ws.close()
        document.location.href = `/html/${params.language}/password.html`
        break;
    }
  }
}else alert("ERROR\nYour browser is not supported!")