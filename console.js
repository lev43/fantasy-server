const languages = ['ru', 'en']
const fs = require('fs')

const readline=require('readline');
const rl=readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	prompt:'@ ',
});

rl.prompt();
function help(cmds_, name = null){
  console.log(`Commands${name ? ' ' + name : ''}:`)
  cmds_.forEach((fun, cmd) => console.log(cmd) )
}
//У меня есть много комманд которые работают одинаково
function command(line, args, parameters, cmds, name = null){
  const cmd = line.split(' ')[0].trim()
  line = line.slice(cmd.length).trim()
  if(!cmd){
    help(cmds, name)
    return
  }
  const command = cmds.get(cmd)

  if(command){
    args = line.split(";")
    parameters = {}
    args.forEach(arg => {
      arg.trim();
      if(arg.split(':')[1])
        parameters[arg.split(':').shift().split(' ').pop()] = arg.split(':').slice(1).join(':')
    })
    if(Object.keys(parameters).length < 1)parameters = null
    //console.log(line, args, parameters)


    command(line, args.slice(1), parameters, cmds, name);
  } else console.log(`${name ? name + ': ' : ''} Command '${cmd}' where not found`);
}

function setPar(obj, parameters){
  for(let par in parameters){
    if(parseFloat(parameters[par]) + '' != 'NaN')parameters[par] = parseFloat(parameters[par])
    if(par != 'id'){
      try{
        console.log(`${readObj(obj, par)}->${parameters[par]}`)
        setObj(obj, par, parameters[par])
      }catch(err){console.log(err.message)}
    }
  }
}


const cmds = new Map([
  ['test', () => {
    console.log(...arguments)
  }],

  ['!', () => {}], //Для заметок/сообщений в консоли

  ['reload-html', () => {
    readFiles('/', html, './src/html')
  }],

  ['send', (line, args) => {
    Game.message('id:' + args[0], args[1])
  }],

  ['send-all', (line, args) => {
    Game.message('all', args[0])
  }],

  ['send-local', (line, args) => {
    Game.message(`location:${args[0]}`, args[1])
  }],

  ['add', (line, args, parameters) => {
    console.log(parameters)
    const cmds = new Map([
      ['location', (line, args, parameters) => {
        let names = {}
        languages.forEach(lan => {
          names[lan] = parameters?.['name-' + lan]
        })

        Game.location.add({
          name: names
        })
        console.log(`Successfully`)
      }],
      ['road', (line, args, parameters) => {
        const {id1, id2, mode} = parameters
        if(!id1 || !id2){
          console.log(`add road {!id1, !id2, mode}`)
          return
        }
        if(Game.location.addRoad(id1, id2, mode))
          console.log(`Successfully`)
        else console.log(`Not successfully, one or two location is not defined`)
      }],
      ['entity', (line, args, parameters) => {
        Game.entity.add({
          id: parameters?.id
        })
        console.log(`Successfully`)
      }]
    ])
    command(line, args, parameters, cmds, 'add')
  }],

  ['delete', (line, args, parameters) => {
    const cmds = new Map([
      ['location', (line, args, parameters) => {
        if(!parameters?.id){
          console.log(`delete location {id}`)
          return
        }
        if(Game.location.delete(parameters.id))
             console.log(`Successfully`)
        else console.log(`No successfully`)
      }],
      ['road', (line, args, parameters) => {
        const {id1, id2, mode} = parameters
        if(!id1 || !id2){
          console.log(`delete road {id1, id2 [mode]}`)
          return
        }
        if(Game.location.deleteRoad(id1, id2, mode))
             console.log(`Successfully`)
        else console.log(`No successfully`)
      }],
      ['entity', (line, args, parameters) => {
        if(!parameters?.id){
          console.log(`delete entity {!d}`)
          return
        }
        if(Game.entity.delete(parameters.id))
             console.log(`Successfully`)
        else console.log(`No successfully`)
      }]
    ])
    command(line, args, parameters, cmds, 'delete')
  }],

  ['edit', (line, args, parameters) => {
    console.log(parameters)
    const cmds = new Map([
      ['location', (line, args, parameters) => {
        const {id} = parameters
        if(!id){
          console.log(`edit location {id, params...}`)
          return
        }
        if(Game.location.has(id)){
          let location = Game.location.get(id)
          setPar(location, parameters)
        }
      }],
      ['entity', (line, args, parameters) => {
        const {id, loc} = parameters
        if(!id){
          console.log(`edit entity {id, ...}`)
          return
        }
        if(Game.entity.has(id)){
          let entity = Game.entity.get(id)
          setPar(entity, parameters)
        }else console.log(`No entity ${id}`)
      }]
    ])
    command(line, args, parameters, cmds, 'edit')
  }],

  ['find', (line, args, parameters) => {
    if(parameters)console.log(parameters)
    const cmds = new Map([
      ['location', (line, args) => {
        if(line.search('spawn') != -1){
          console.log(Game.location.spawn)
          return
        }

        let l = false

        if(Object.keys(parameters ?? {}).length > 0)[...Game.location.values()].filter(location => {
          for(let par in parameters){
            try{
              if(readObj(location, par) + '' != parameters[par])return false
            }catch(err){
              if(err.message.split(' ').slice(0, 2).join(' ') != 'Not element')throw err; else console.log(err.message)
              return false
            }
          }
          l = true
          return true
        }).forEach(location => console.log(Object.entries(location)))

        if(Object.keys(parameters ?? {}).length > 0 && !l)console.log(`No location that parameters\n{\n  ${Object.entries(parameters).join('\n  ').split(',').join(': ')}\n}`)
        if(l || Object.keys(parameters ?? {}).length > 0)return
        Game.location.forEach((location, id) => {
          console.log(Object.entries(location))
        })
      }],
      ['entity', (line, args) => {
        let e = false

        if(Object.keys(parameters ?? {}).length > 0)[...Game.entity.values()].filter(entity => {
          for(let par in parameters){
            try{
              if(readObj(entity, par) + '' != parameters[par])return false
            }catch(err){
              if(err.message.split(' ').slice(0, 2).join(' ') != 'Not element')throw err
              return false
            }
          }
          e = true
          return true
        }).forEach(entity => console.log(Object.entries(entity)))

        if(Object.keys(parameters ?? {}).length > 0 && !e)console.log(`No entity that parameters\n{\n  ${Object.entries(parameters).join('\n  ').split(',').join(': ')}\n}`)
        if(e || Object.keys(parameters ?? {}).length > 0)return

        Game.entity.forEach((entity, id) => {
          console.log(Object.entries(entity))
        })
      }],
      ['log', (line, args, parameters) => {
        if(!parameters?.path){
          console.log('find log {path}')
          return
        }
        const {path} = parameters
        let log;
        try {
          log = fs.readFileSync(`./src/DATA/logs/<${date()}>/` + path + '_log.txt', 'utf8')
        } catch(err) {
          if(err.code == 'ENOENT'){
            try{
              console.log(`./src/DATA/logs/<${date()}>/` + path, console.log(fs.readdirSync(`./src/DATA/logs/<${date()}>/` + path)) ?? '')
              return
            }catch(err){
              if(err.code == 'ENOENT'){
                console.log('No log to path ' + err.path + '_log.txt')
              }
            }
          } else console.log(err)
          return
        }
    
        let until = parameters?.until?.split(':') ?? 0,
            after = parameters?.after?.split(':') ?? log.length


        // console.log(until, after)
        let i = 0
        while(typeof until == 'object' && i < 10000){
          let until_ = `<${(until[0] < 10 ? '0' + until[0] : '' + until[0]) + ':' + (until[1] < 10 ? '0' + until[1] : '' + until[1]) + ':' + (until[2] < 10 ? '0' + until[2] : '' + until[2])}>`
          if(log.indexOf(until_) != -1){
            until = log.search(until_)
            break
          } else {
            until[2]++
            if(until[2] > 59){
              until[2] = 0
              until[1]++
              if(until[1] > 59){
                until[1] = 0
                until[0]++
                if(until[0] > 23){
                  console.log("No time until " + parameters.until)
                  return
                }
              }
            }
          }
          i++
        }


        i = 0
        while(typeof after == 'object' && i < 10000){
          let after_ = `<${(after[0] < 10 ? '0' + after[0] : '' + after[0]) + ':' + (after[1] < 10 ? '0' + after[1] : '' + after[1]) + ':' + (after[2] < 10 ? '0' + after[2] : '' + after[2])}>`
          if(log.lastIndexOf(after_) != -1){
            after = log.search(after_)
            break
          } else {
            after[2]--
            if(after[2] < 0){
              after[2] = 59
              after[1]--
              if(after[1] < 0){
                after[1] = 59
                after[0]--
                if(after[0] < 0){
                  console.log("No time after " + parameters.after)
                  return
                }
              }
            }
          }
          i++
        }

        // console.log(until, typeof until)
        // console.log(after, typeof after)

        if(typeof until == 'object')until = 0
        if(typeof after == 'object')after = log.length
        
        // find log path:connections/sockets; until:17:00:00; after:17:20:00
        log = log.slice(until, after)
    
        console.log('./src/DATA/logs/<' + date() + '>/' + path + '_log.txt' + '\n' + log)
      }]
    ])
    command(line, args, parameters, cmds, 'find')
  }],

  ['error', (line) => {
    throw Error(line)
  }],

  ['exit', () => {
    // console.log(Game.entity.getByParameters({training: '!'}))
    process.exit()
  }]
])

rl.on('line', line => {
	line = line.trim();
	command(line, [], null, cmds)

	rl.prompt();
})