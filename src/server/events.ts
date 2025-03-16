import { SPAWNPOINTS } from '@shared/constants';
import CarMarket from './car-market';
import { carMarketsPool } from './custom-pools'


mp.events.add('playerReady', (player) => {
	// Set the custom variables defined in @types
	
	player.ownVehicles = []; // or get from DB/etc
});

mp.events.add('playerDeath', (player) => {
	const randomSpawnPoint = new mp.Vector3(
		SPAWNPOINTS.SpawnPoints[Math.floor(Math.random() * SPAWNPOINTS.SpawnPoints.length)])

		player.outputChatBox(`spawnpoint: ${randomSpawnPoint}`)
		player.spawn(randomSpawnPoint);
		player.health = 100;
});

mp.events.add('playerEnterColshape', (player: PlayerMp, colshape: ColshapeMp) => {	
	player.outputChatBox(`You entered the CUBOID zone`);

  // TODO: need thinking - mb colshape.getVariable("isCarMarket") === true (bad: abstraction will depends on details???)		
	mp.events.call("playerEnterCarMarket", player, carMarketsPool.filter((market) => market.colshape.id === colshape.id)[0])
});

mp.events.add('playerExitColshape', (player, colshape) => {
	// TODO: need thinking - mb colshape.getVariable("isCarMarket") === true (bad: abstraction will depends on details???)		
	mp.events.call("playerExitCarMarket", player, carMarketsPool.filter((market) => market.colshape.id === colshape.id)[0])

	player.outputChatBox(`You leaved the CUBOID zone`);
});

mp.events.add('playerEnterCarMarket', (player: PlayerMp, carMarket: CarMarket) => {	
	if (!carMarket) return;	

	player.outputChatBox(`You entered the CARMARKET zone`);
  carMarket.enter(player)
});

mp.events.add('playerExitCarMarket', (player: PlayerMp, carMarket: CarMarket) => {
	if (!carMarket) return;

  carMarket.exit(player)
	player.outputChatBox(`You leaved the CARMARKET zone`);
});

// Event which will be called from client when the vehicle streams in
mp.events.add('server::vehicleStreamIn', async (_player, remoteid) => {
	const vehicle = mp.vehicles.at(remoteid);

	if (!vehicle || !mp.vehicles.exists(vehicle)) return;
	if (!vehicle.onStreamIn || typeof vehicle.onStreamIn === 'undefined') return;
	vehicle.onStreamIn.constructor.name === 'AsyncFunction' ? await vehicle.onStreamIn(vehicle) : vehicle.onStreamIn(vehicle);
});