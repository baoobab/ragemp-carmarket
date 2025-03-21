﻿import { CustomEntityType, SPAWNPOINTS } from '@shared/constants';
import CarMarket from '../modules/car-market';
import { carMarketsPool } from '@/pools/car-market.pool';
import SellPoint, { SellPointState } from '../modules/sell-point';

mp.events.add('playerReady', (player) => {
	if (!player || !mp.players.exists(player)) return;
	// Set the custom variables defined in @types

	player.ownVehicles = []; // or restore from DB/etc

	// Start balance on the bank account
	player.money = 1000; // or restore from DB/etc

	// Custom method to spawn a car in player position (just keep in mind - each player is admin for now)
	player.spawnCar = (carName: RageEnums.Hashes.Vehicle) => {
		if (player.vehicle) {
			player.outputChatBox('You need to leave the current vehicle');
			return null;
		}

		const vehicle = mp.vehicles.new(carName, player.position); // Creating the vehicle

		// Adding a custom method to the vehicle which will handle the stream in (will be called from the client).
		vehicle.onStreamIn = (veh: VehicleMp) => {
			// Supports async as well

			if (!player || !mp.players.exists(player)) return; // If the player is no longer available when this method is called we return here.

			setTimeout(() => {
				player.putIntoVehicle(veh, 0);
			}, 200); // Put the player into the vehicle as soon as the vehicle is streamed in.
		};
		player.position = vehicle.position; // Setting player position to the vehicle position

		return vehicle;
	};

	// Custom method to check - is player a driver now
	player.isDriver = (): boolean => {
		return !!player.vehicle && player.seat === RageEnums.VehicleSeat.DRIVER;
	};

	// Custom methos to tp player to the target vehicle (just keep in mind - each player is admin for now)
	player.teleportToDriverDoor = (vehicle: VehicleMp): void => {
		const offset = vehicle.isRightHandDrive()
			? new mp.Vector3(-1.2, 0, 0) // right offset
			: new mp.Vector3(1.2, 0, 0); // left offset

		player.position = vehicle.position.add(offset);
	};
});

mp.events.add('playerQuit', (player: PlayerMp, _exitReason: string) => {
	const carMarkets = carMarketsPool.filter(_ => true)

	// Iterate through all car markets
	carMarkets.forEach(carMarket => {
		// Iterate through all sell points in the current car market
		carMarket.sellPoints.forEach(sellPoint => {
			if (!sellPoint.item) return;

			// Check if the sell point is in a state where the player is selling an item
			// we can't restore car on the purchasing phase without seller interaction
			// because customer will be confused about it situation
			if (sellPoint.state === SellPointState.FOR_SALE
				&& sellPoint.item.seller.id === player.id) {
				// Check if the selling item is car
				if (mp.vehicles.at(sellPoint.item.item.id)) {
					console.log(`Player ${player.name} quit while selling item
					at sell point ${sellPoint.colshape.id}. Clearing the lot.`);

					// Clear SellPoint and back vehicle to owner
					sellPoint.restore(player);
				}
			}
		});
	});
});

mp.events.add('playerDeath', (player) => {
	const randomSpawnPoint = new mp.Vector3(SPAWNPOINTS.SpawnPoints[Math.floor(Math.random() * SPAWNPOINTS.SpawnPoints.length)]);

	player.outputChatBox(`spawnpoint: ${randomSpawnPoint}`);
	player.spawn(randomSpawnPoint);
	player.health = 100;
});

mp.events.add('playerEnterColshape', (player: PlayerMp, colshape: ColshapeMp) => {
	if (!colshape.isForCustomEntityType) {
		return player.outputChatBox(`You entered the colshape#${colshape.id}`);
	}

	const args: any[] = [];
	switch (colshape.customEntityType) {
		case CustomEntityType.CAR_MARKET: {
			const targetMarket = carMarketsPool.filter((market) => market.colshape.id === colshape.id)[0]; // What if >1 markets on position?
			player.setVariable('currentCarMarketColshapeId', targetMarket.colshape.id);

			args.push(targetMarket);
			break;
		}
		case CustomEntityType.SELL_POINT: {
			const marketColshapeId = player.getVariable<number>('currentCarMarketColshapeId'); // base case: SellPoints only used in CarMarkets
			if (marketColshapeId === null) break;

			const currentCarMarket = carMarketsPool.filter((market) => market.colshape.id === marketColshapeId)[0];
			const targetSellPoint = currentCarMarket.sellPointByColshapeId(colshape.id);

			player.setVariable('currentSellPointColshapeId', targetSellPoint?.colshape.id);
			args.push(targetSellPoint);
			break;
		}
	}
	mp.events.call(`playerEnter${colshape.customEntityType}`, player, ...args);
});

mp.events.add('playerExitColshape', (player, colshape) => {
	if (!colshape.isForCustomEntityType) {
		return player.outputChatBox(`You leaved the colshape#${colshape.id}`);
	}

	const args: any[] = [];
	switch (colshape.customEntityType) {
		case CustomEntityType.CAR_MARKET: {
			const marketId = player.getVariable<number>('currentCarMarketColshapeId');
			if (marketId === null) break;

			const targetMarket = carMarketsPool.filter((market) => market.colshape.id === marketId)[0];

			player.setVariable('currentCarMarketColshapeId', null);
			args.push(targetMarket);
			break;
		}
		case CustomEntityType.SELL_POINT: {
			const sellPointColshapeId = player.getVariable<number>('currentSellPointColshapeId');
			if (sellPointColshapeId === null) break;

			const targetCarMarket = carMarketsPool.filter((market) => !!market.sellPointByColshapeId(sellPointColshapeId))[0];
			const targetSellPoint = targetCarMarket.sellPointByColshapeId(sellPointColshapeId);

			player.setVariable('currentSellPointColshapeId', null);
			args.push(targetSellPoint);
			break;
		}
	}
	mp.events.call(`playerExit${colshape.customEntityType}`, player, ...args);
});

mp.events.add('playerEnterSellPoint', (player: PlayerMp, sellPoint: SellPoint<VehicleMp>) => {
	if (sellPoint === null) return;

	player.outputChatBox(`You entered the SELLPOINT ${sellPoint.marker?.label || ''}`);
	sellPoint.enter(player);
});

mp.events.add('playerExitSellPoint', (player: PlayerMp, sellPoint: SellPoint<VehicleMp>) => {
	if (sellPoint === null) return;

	player.outputChatBox(`You leaved the SELLPOINT ${sellPoint.marker?.label || ''}`);
	sellPoint.leave(player);
});

mp.events.add('playerEnterCarMarket', (player: PlayerMp, carMarket: CarMarket) => {
	if (carMarket === null) return;

	player.outputChatBox(`You entered the CARMARKET#${carMarket.colshape.id}: ${carMarket.title}`);
	carMarket.enter(player);
});

mp.events.add('playerExitCarMarket', (player: PlayerMp, carMarket: CarMarket) => {
	if (!carMarket) return;

	carMarket.exit(player);
	player.outputChatBox(`You leaved the CARMARKET#${carMarket.colshape.id}: ${carMarket.title}`);
});

// Event which will be called from client when the vehicle streams in
mp.events.add('server::vehicleStreamIn', async (_player, remoteid) => {
	const vehicle = mp.vehicles.at(remoteid);

	if (!vehicle || !mp.vehicles.exists(vehicle)) return;
	if (!vehicle.onStreamIn || typeof vehicle.onStreamIn === 'undefined') return;

	// Custom method to check vehicle steering-hand type
	vehicle.isRightHandDrive = (): boolean => {
		const model = vehicle.model;

		const RHD_MODELS = new Set([
			mp.joaat('')
			// or any right-hand car
		]);

		return RHD_MODELS.has(model);
	};

	vehicle.onStreamIn.constructor.name === 'AsyncFunction' ? await vehicle.onStreamIn(vehicle) : vehicle.onStreamIn(vehicle);
});
