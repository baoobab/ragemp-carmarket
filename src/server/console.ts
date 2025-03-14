import readline from 'readline'

// For handling server-console commands
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('line', (input) => {

  if(input.charAt(0) == '/'){
      const [cmdName, ...args] = input.slice(1).split(' ');
      mp.events.call(`console:${cmdName}`, args, ...args); // setting args into the command handler
  }
});

mp.events.add("console:kick", (fulltext, playerId) => {  
  if(!playerId || isNaN(playerId)) return console.log("Bad player ID. Usage: /kick playerID");

  const player = mp.players.at(playerId);
  if(!player) return console.log(`Игрок с id ${playerId} оффлайн`); // Check the player is online

  const reason = fulltext.slice(1).join(' ');
  console.log(`Player kicked ${player.name}. Reason: ${reason}`);
  player.kick(reason);
});

mp.events.add("console:kill", (playerId) => {
  if(!playerId || isNaN(playerId)) return console.log("Bad player ID. Usage: /kill playerID");

  const player = mp.players.at(playerId);
  if(!player) return console.log(`Player ${playerId} is offline`); // Check the player is online

  player.health = 0
  player.notify("You were killed by the admin")

  console.log(`Player ${player.name} was killed`);
});

mp.events.add("console:heal", (playerId) => {
  if(!playerId || isNaN(playerId)) return console.log("Bad player ID. Usage: /heal playerID");

  const player = mp.players.at(playerId);
  if(!player) return console.log(`Player ${playerId} is offline`); // Check the player is online

  player.health = 100
  player.notify("You were healed by the admin")

  console.log(`Player ${player.name} was healed`);
});

mp.events.add("console:players", (args) => {
  let count = 0;
  console.log('Players online:');

  mp.players.forEach((player) => {
      console.log(`${player.name} (ID: ${player.id})`);
      count++;
  });

  console.log(`Players count: ${count}`);
});