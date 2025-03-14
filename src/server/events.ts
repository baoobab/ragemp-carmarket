import { SPAWNPOINTS } from '@shared/constants';

mp.events.add('playerDeath', (player) => {
	const randomSpawnPoint = new mp.Vector3(
		SPAWNPOINTS.SpawnPoints[Math.floor(Math.random() * SPAWNPOINTS.SpawnPoints.length)])

		player.outputChatBox(`spawnpoint: ${randomSpawnPoint}`)
		player.spawn(randomSpawnPoint);
		player.health = 100;
});

mp.events.add('playerEnterColshape', (player, colshape) => {
  if (colshape.shapeType === RageEnums.ColshapeType.CUBOID) {
    player.outputChatBox(`You entered the CUBOID zone`);
  }
});

mp.events.add('playerExitColshape', (player, colshape) => {
  if (colshape.shapeType === RageEnums.ColshapeType.CUBOID) {
    player.outputChatBox(`You leaved the CUBOID zone`);
  }
});