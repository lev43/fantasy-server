const { con, log } = require('./src/functions.js')

const readline=require('readline');
const rl=readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	prompt:'@ ',
});

rl.prompt();
//У меня есть много подкомманд которые работают одинаково
function help(cmds_, name = null){
  con(`Комманды${name ? ' ' + name : ''}:`)
  cmds_.forEach((fun, cmd) => con(cmd) )
}
function command(line, args, cmds, name = null){
  if(!args[0]){
    help(cmds, name)
    return
  }
  const command = cmds.get(args[0]);

  log(line)

  if(command)command(line, args.slice(1));
  else con(`${name ? name + ': ' : ''}Не найдена комманда '${args[0]}'`);
}


const cmds = new Map([
  ['!', () => {}],

  ['send-all', (line, args) => {
    Game.emit('server-message', args.join(' '))
  }],

  ['add', (line, args) => {
    const cmds = new Map([
      ['location', (line, args) => {
        if(!args[0]){
          con(`add location <name>`)
          return
        }
        Game.location.add({
          name: args[0]
        })
        con(`Successfully`)
      }],
      ['road', (line, args) => {
        if(args.length < 2){
          con(`add location-road <id1> <id2> [mod]\nДобавить в id1 путь до id2`)
          return
        }
        if(Game.location.addRoad(args[0], args[1], args[2]))
          con(`Successfully`)
        else con(`Not successfully, one or two location is not defined`)
      }],
      ['enemy', (line, args) => {
        Game.enemy.add({
          id: args[0]
        })
        con(`Successfully`)
      }]
    ])
    command(line, args, cmds, 'add')
  }],

  ['delete', (line, args) => {
    const cmds = new Map([
      ['location', (line, args) => {
        if(!args[0]){
          con(`delete location <id>`)
          return
        }
        if(Game.location.delete(args[0]))
             con(`Successfully`)
        else con(`No successfully`)
      }],
      ['road', (line, args) => {
        if(args.length < 2){
          con(`delete location-road <id1> <id2> [mod]\nУдалить путь до id2 из путей id1`)
          return
        }
        if(Game.location.deleteRoad(args[0], args[1], args[2]))
             con(`Successfully`)
        else con(`No successfully`)
      }],
      ['enemy', (line, args) => {
        if(!args[0]){
          con(`delete enemy <id>`)
          return
        }
        if(Game.enemy.delete(args[0]))
             con(`Successfully`)
        else con(`No successfully`)
      }]
    ])
    command(line, args, cmds, 'delete')
  }],

  ['edit', (line, args) => {
    const cmds = new Map([
      ['location', (line, args) => {
        if(args.length < 2){
          con(`edit location <id> <name>`)
          return
        }
        if(Game.location.has(args[0])){
          Game.location.get(args[0]).name = args[1]
          con(`Successfully`)
        }else con(`No location ${args[0]}`)
      }],
      ['location-spawn', (line, args) => {
        if(!args[0]){
          con(`edit location-spawn <id>`)
          return
        }
        if(Game.location.has(args[0])){
          Game.location.spawn = args[0]
          con(`successfully`)
        }else con(`No location ${args[0]}`)
      }],
      ['enemy', (line, args) => {
        if(args.length < 2){
          con(`edit location <id> <location-id>`)
          return
        }
        if(Game.enemy.has(args[0]) && Game.location.has(args[1])){
          Game.location.get(args[0]).location = args[1]
          con(`Successfully`)
        }else con(`No location ${args[0]}`)
      }]
    ])
    command(line, args, cmds, 'edit')
  }],

  ['find', (line, args) => {
    const cmds = new Map([
      ['location', (line, args) => {
        if(args[0]){
          if(Game.location.has(args[0]))
            con(Game.location.get(args[0]))
          else con(`No location ${args[0]}`)
        }else{
          con('spawn: ' + Game.location.spawn)
          Game.location.forEach((location, id) => {
            if(id != 'spawn')con(location)
          })
        }
      }],
      ['enemy', (line, args) => {
        if(args[0]){
          if(Game.enemy.has(args[0]))
            con(Game.enemy.get(args[0]))
          else con(`No enemy ${args[0]}`)
        }else{
          Game.enemy.forEach((enemy, id) => {
            con(enemy)
          })
        }
      }]
    ])
    command(line, args, cmds, 'find')
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
  Game.save()
	process.exit(0);
});