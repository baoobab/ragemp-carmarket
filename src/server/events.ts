import { CustomEntityType, SPAWNPOINTS } from '@shared/constants';
import CarMarket from './car-market';
import { carMarketsPool } from './custom-pools'


mp.events.add('playerReady', (player) => {
	if (!player || !mp.players.exists(player)) return;
	// Set the custom variables defined in @types

	player.ownVehicles = []; // or restore from DB/etc

	// start balance on the bank account
	player.money = 1000; // or restore from DB/etc
});

mp.events.add('playerDeath', (player) => {
	const randomSpawnPoint = new mp.Vector3(
		SPAWNPOINTS.SpawnPoints[Math.floor(Math.random() * SPAWNPOINTS.SpawnPoints.length)])

		player.outputChatBox(`spawnpoint: ${randomSpawnPoint}`)
		player.spawn(randomSpawnPoint);
		player.health = 100;
});

mp.events.add('playerEnterColshape', (player: PlayerMp, colshape: ColshapeMp) => {	
	if (!colshape.isForCustomEntityType) {
		return player.outputChatBox(`You entered the colshape#${colshape.id} zone`);
	}

	switch (colshape.customEntityType) {
		case CustomEntityType.CAR_MARKET: {
			mp.events.call(`playerEnter${colshape.customEntityType}`, player, carMarketsPool.filter((market) => market.colshape.id === colshape.id)[0])
			return;
		}
	}
});

mp.events.add('playerExitColshape', (player, colshape) => {
	if (!colshape.isForCustomEntityType) {
		return player.outputChatBox(`You leaved the colshape#${colshape.id} zone`);
	}

	switch (colshape.customEntityType) {
		case CustomEntityType.CAR_MARKET: {
			mp.events.call(`playerExit${colshape.customEntityType}`, player, carMarketsPool.filter((market) => market.colshape.id === colshape.id)[0])
			return;
		}
	}
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