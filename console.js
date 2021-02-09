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

  ['add', (line, args) => {
    const cmds = new Map([
      ['location', (line, args) => {
        if(!args[0]){
          con(`add location <name>`)
          return
        }
        global.Game.location.add({
          name: args[0]
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
        if(global.Game.location.delete(args[0]))
             con(`Успешно`)
        else con(`Не удалось`)
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
        if(global.Game.location.has(args[0])){
          global.Game.location.get(args[0]).name = args[1]
          con(`Успешно`)
        }else con(`Нету локации ${args[0]}`)
      }]
    ])
    command(line, args, cmds, 'edit')
  }],

  ['find', (line, args) => {
    const cmds = new Map([
      ['location', (line, args) => {
        if(args[0]){
          if(global.Game.location.has(args[0]))
            con(global.Game.location.get(args[0]))
          else con(`Нету локации ${args[0]}`)
        }else{
          global.Game.location.forEach((location, id) => {
            con(location)
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
  con('Отключение сервера');
  global.Game.save()
	process.exit(0);
});