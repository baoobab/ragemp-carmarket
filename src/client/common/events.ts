mp.events.add('entityStreamIn', (entity) => {
	if (entity.type === 'vehicle') {
		mp.events.callRemote('server::vehicleStreamIn', entity.remoteId);
	}
});

mp.events.add('client::makeVehiclePreview', (vehicleId: number) => {	
	const vehicle = mp.vehicles.at(vehicleId)
	if (vehicle) {
		vehicle.setInvincible(true)
		vehicle.setCollision(true, false);
		vehicle.setCanBeDamaged(false);
		vehicle.setDoorsLockedForAllPlayers(true)
		mp.game.vehicle.setDoorsLockedForAllPlayers(vehicleId, true)
		mp.game.vehicle.setExtra(vehicleId, 2, false);
		mp.game.vehicle.setCanBreak(vehicleId, false);
		mp.game.vehicle.setDamageModifier(vehicleId, 0);
		mp.game.vehicle.setParkedVehicleDensityMultiplierThisFrame(0);
	}
});