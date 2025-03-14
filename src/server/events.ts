import { SPAWNPOINTS } from '@shared/constants';

mp.events.add('playerDeath', (player) => {
	const randomSpawnPoint = new mp.Vector3(
		SPAWNPOINTS.SpawnPoints[Math.floor(Math.random() * SPAWNPOINTS.SpawnPoints.length)])
		player.spawn(randomSpawnPoint);
		player.health = 100;
});