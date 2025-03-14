import { SPAWNPOINTS } from '@shared/constants';
import CarMarket, { carMarkets } from './carMarket';

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
	mp.events.call("playerEnterCarMarket", player, carMarkets.filter((market) => market.colshape.id === colshape.id)[0])
});

mp.events.add('playerExitColshape', (player, colshape) => {
	// TODO: need thinking - mb colshape.getVariable("isCarMarket") === true (bad: abstraction will depends on details???)		
	mp.events.call("playerExitCarMarket", player, carMarkets.filter((market) => market.colshape.id === colshape.id)[0])

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