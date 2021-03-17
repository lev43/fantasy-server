var send = true, view = true
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
    if(send)ws.send(jsonToStr({type: 'player-message', password: password, content: msg, language: params.language}))
  }

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
          let t = parseInt(//Получаем как долго должен работать таймер
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
          if(params.line == '1')newMessage.prepend(line)
          const lastMessages = document.getElementById('channel').childNodes[0]
          if(lastMessages?.id == data.id){
            lastMessages.prepend(newMessage)
          } else {
            const newMessages = document.createElement('code')
            newMessages.className = 'messages'
            newMessages.id = data.id
            if(params.line == '2')newMessages.prepend(line)
            newMessages.prepend(newMessage)
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
        document.location.href = `/html/%{params.language}/password.html`
        break;
    }
  }
}else alert("ERROR\nYour browser is not supported!")