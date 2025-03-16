import { CustomEntityType, SPAWNPOINTS } from '@shared/constants';
import CarMarket from './car-market';
import { carMarketsPool } from './custom-pools'
import SellPoint from './sell-point';


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
		return player.outputChatBox(`You entered the colshape#${colshape.id}`);
	}

	const args: any[] = []
	switch (colshape.customEntityType) {
		case CustomEntityType.CAR_MARKET: {
			const targetMarket = carMarketsPool.filter((market) => market.colshape.id === colshape.id)[0] // What if >1 markets on position?
			player.setVariable("currentCarMarketColshapeId", targetMarket.colshape.id)

			args.push(targetMarket)
			break;
		}
		case CustomEntityType.SELL_POINT: {			
			const marketColshapeId = player.getVariable<number>("currentCarMarketColshapeId") // base case: SellPoints only used in CarMarkets			
			if (marketColshapeId === null) break;
			
			const currentCarMarket = carMarketsPool.filter((market) => market.colshape.id === marketColshapeId)[0]			
			const targetSellPoint = currentCarMarket.sellPointByColshapeId(colshape.id)

			player.setVariable("currentSellPointColshapeId", targetSellPoint?.colshape.id)
			args.push(targetSellPoint)
			break;
		}
	}
	mp.events.call(`playerEnter${colshape.customEntityType}`, player, ...args)
});

mp.events.add('playerExitColshape', (player, colshape) => {
	if (!colshape.isForCustomEntityType) {
		return player.outputChatBox(`You leaved the colshape#${colshape.id}`);
	}

	const args: any[] = []
	switch (colshape.customEntityType) {
		case CustomEntityType.CAR_MARKET: {
			const marketId = player.getVariable<number>("currentCarMarketColshapeId")
			if (marketId === null) break;

			const targetMarket = carMarketsPool.filter((market) => market.colshape.id === marketId)[0]

			player.setVariable("currentCarMarketColshapeId", null)
			args.push(targetMarket)
			break;
		}
		case CustomEntityType.SELL_POINT: {
			const sellPointColshapeId = player.getVariable<number>("currentSellPointColshapeId")
			if (sellPointColshapeId === null) break;

			const targetCarMarket = carMarketsPool.filter((market) => !!market.sellPointByColshapeId(sellPointColshapeId))[0]
			const targetSellPoint = targetCarMarket.sellPointByColshapeId(sellPointColshapeId)

			player.setVariable("currentSellPointColshapeId", null)
			args.push(targetSellPoint)
			break;
		}
	}
	mp.events.call(`playerExit${colshape.customEntityType}`, player, ...args)
});

mp.events.add('playerEnterSellPoint', (player: PlayerMp, sellPoint: SellPoint<VehicleMp>) => {	
	if (sellPoint === null) return;	

	player.outputChatBox(`You entered the SELLPOINT ${sellPoint.marker?.label || ""}`);
	sellPoint.enter(player)
});

mp.events.add('playerExitSellPoint', (player: PlayerMp, sellPoint: SellPoint<VehicleMp>) => {	
	if (sellPoint === null) return;	

	player.outputChatBox(`You leaved the SELLPOINT ${sellPoint.marker?.label || ""}`);
	sellPoint.leave(player)
});


mp.events.add('playerEnterCarMarket', (player: PlayerMp, carMarket: CarMarket) => {	
	if (carMarket === null) return;	

	player.outputChatBox(`You entered the CARMARKET ${carMarket.title}`);
  carMarket.enter(player)
});

mp.events.add('playerExitCarMarket', (player: PlayerMp, carMarket: CarMarket) => {
	if (!carMarket) return;

  carMarket.exit(player)
	player.outputChatBox(`You leaved the CARMARKET ${carMarket.title}`);
});

// Event which will be called from client when the vehicle streams in
mp.events.add('server::vehicleStreamIn', async (_player, remoteid) => {
	const vehicle = mp.vehicles.at(remoteid);

	if (!vehicle || !mp.vehicles.exists(vehicle)) return;
	if (!vehicle.onStreamIn || typeof vehicle.onStreamIn === 'undefined') return;
	vehicle.onStreamIn.constructor.name === 'AsyncFunction' ? await vehicle.onStreamIn(vehicle) : vehicle.onStreamIn(vehicle);
});