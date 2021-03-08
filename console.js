const { con, log } = require('./src/functions.js')
const languages = ['ru', 'en']
const fs = require('fs')

const readline=require('readline');
const rl=readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	prompt:'@ ',
});

rl.prompt();
//У меня есть много подкомманд которые работают одинаково
function help(cmds_, name = null){
  con(`Commands${name ? ' ' + name : ''}:`)
  cmds_.forEach((fun, cmd) => con(cmd) )
}
function command(line, args, cmds, parameters, name = null){
  if(!args[0]){
    help(cmds, name)
    return
  }
  const command = cmds.get(args[0]);
  if(!parameters){
    parameters = {}
    args.forEach(arg => {if(arg.split(':')[1])parameters[arg.split(':').shift()] = arg.split(':')[1]})
    if(Object.keys(parameters).length < 1)parameters = null
  }
  //console.log(parameters)

  log(line)

  if(command)command(line, args.slice(1), parameters);
  else con(`${name ? name + ': ' : ''} Command '${args[0]}' where not found`);
}


const cmds = new Map([
  ['!', () => {}],

  ['get-html-files', () => {
    console.log(Object.keys(html))
  }],

  ['reload-html-files', () => {
    fs.readdirSync('./src/html').forEach(file => {
      html[file] = fs.readFileSync('./src/html/' + file)
    })
  }],

  ['send-all', (line, args) => {
    Game.emit('server-message', args.join(' '))
  }],

  ['send-local', (line, args) => {
    Game.emit('local-message', args[0], args.slice(1).join(' '))
  }],

  ['add', (line, args, parameters) => {
    const cmds = new Map([
      ['location', (line, args, parameters) => {
        let names = {}
        languages.forEach(lan => {
          names[lan] = parameters?.['name-' + lan]
        })

        Game.location.add({
          name: names
        })
        con(`Successfully`)
      }],
      ['road', (line, args, parameters) => {
        const {id1, id2, mode} = parameters
        if(!id1 || !id2){
          con(`add road {!id1, !id2, mode}`)
          return
        }
        if(Game.location.addRoad(id1, id2, mode))
          con(`Successfully`)
        else con(`Not successfully, one or two location is not defined`)
      }],
      ['enemy', (line, args, parameters) => {
        Game.enemy.add({
          id: parameters?.id
        })
        con(`Successfully`)
      }]
    ])
    command(line, args, cmds, parameters, 'add')
  }],

  ['delete', (line, args, parameters) => {
    const cmds = new Map([
      ['location', (line, args, parameters) => {
        if(!parameters.id){
          con(`delete location {!id}`)
          return
        }
        if(Game.location.delete(parameters.id))
             con(`Successfully`)
        else con(`No successfully`)
      }],
      ['road', (line, args, parameters) => {
        const {id1, id2, mode} = parameters
        if(!id1 || !id2){
          con(`delete road {!id1, !id2 mode}`)
          return
        }
        if(Game.location.deleteRoad(id1, id2, mode))
             con(`Successfully`)
        else con(`No successfully`)
      }],
      ['enemy', (line, args, parameters) => {
        if(!parameters.id){
          con(`delete enemy {!id}`)
          return
        }
        if(Game.enemy.delete(parameters.id))
             con(`Successfully`)
        else con(`No successfully`)
      }]
    ])
    command(line, args, cmds, parameters, 'delete')
  }],

  ['edit', (line, args, parameters) => {
    const cmds = new Map([
      ['location', (line, args, parameters) => {
        const {id} = parameters
        if(!id){
          con(`edit location {!id, name}`)
          return
        }
        if(Game.location.has(id)){
          let location = Game.location.get(id)
          for(let par in parameters){
            if(par != 'id'){
              con(`${location[par]}->${parameters[par]}`)
              location[par] = parameters[par]
            }
          }
        }
      }],
      ['location-spawn', (line, args, parameters) => {
        if(!parameters?.id){
          con(`edit location-spawn {!id}`)
          return
        }
        if(Game.location.has(parameters.id)){
          Game.location.spawn = parameters.id
          con(`successfully`)
        }else con(`No location ${parameters.id}`)
      }],
      ['enemy', (line, args, parameters) => {
        const {id, loc} = parameters
        if(!id){
          con(`edit enemy {!id, loc}`)
          return
        }
        if(Game.enemy.has(id)){
          let enemy = Game.enemy.get(id)
          for(let par in parameters){
            if(par != 'id'){
              con(`${enemy[par]}->${parameters[par]}`)
              enemy[par] = parameters[par]
            }
          }
        }else con(`No enemy ${id}`)
      }]
    ])
    command(line, args, cmds, parameters, 'edit')
  }],

  ['find', (line, args, parameters) => {
    const cmds = new Map([
      ['location', (line, args) => {
        let l = false

        if(args[0])[...Game.location].filter(loc => {
          let y = true
          for(par in parameters)if(loc[1][par] != parameters[par])y = false
          if(y)l=true
          return y
        }).forEach(loc => con(loc[1]))

        if(args[0] && !l)con(`No location that parameters\n{\n  ${Object.entries(parameters).join('\n  ').split(',').join(': ')}\n}`)
        if(l || args[0])return

        con('spawn: ' + Game.location.spawn)
        Game.location.forEach((location, id) => {
          if(id != 'spawn')con(location)
        })
      }],
      ['enemy', (line, args) => {
        let e = false

        if(args[0])[...Game.enemy].filter(enemy => {
          let y = true
          for(par in parameters)if(enemy[1][par] != parameters[par])y = false
          if(y)e = true
          return y
        }).forEach(enemy => con(enemy[1]))

        if(args[0] && !e)con(`No enemy that parameters\n{\n  ${Object.entries(parameters).join('\n  ').split(',').join(': ')}\n}`)
        if(e || args[0])return

        Game.enemy.forEach((enemy, id) => {
          con(enemy)
        })
      }]
    ])
    command(line, args, cmds, {}, 'find')
  }],

  ['exit', () => {
    rl.emit('close')
  }]
])

rl.on('line', line => {
	line = line.trim();

	let args = line.split(" ");
	command(line, args, cmds)

	rl.prompt();
}).on('close', ()=>{
  con('Close server');
  //Game.save()
	process.exit(0);
});