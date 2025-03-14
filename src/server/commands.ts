import { VEHICLE_NAMES } from '@shared/constants';


mp.events.addCommand("spawncar", (player, carName = "") => {  
  if (!Object.keys(VEHICLE_NAMES).includes(carName)) {
    return player.notify('No such vehicle');
  }

	const vehicle = mp.vehicles.new(mp.joaat(carName), player.position); //Creating the vehicle

	//Adding a custom method to the vehicle which will handle the stream in (will be called from the client).
	vehicle.onStreamIn = (veh: VehicleMp) => { //supports async as well
    
	  if (!player || !mp.players.exists(player)) return; //if the player is no longer available when this method is called we return here.

	  setTimeout(() => {player.putIntoVehicle(veh, 0)}, 200) //we put the player into the vehicle as soon as the vehicle is streamed in.
	}

	player.position = vehicle.position; //setting player position to the vehicle position

})

//Adding a event which will be called from client when the vehicle streams in
mp.events.add('server::vehicleStreamIn', async (_player, remoteid) => {
	const vehicle = mp.vehicles.at(remoteid);

	if (!vehicle || !mp.vehicles.exists(vehicle)) return;
	if (!vehicle.onStreamIn || typeof vehicle.onStreamIn === 'undefined') return;
	vehicle.onStreamIn.constructor.name === 'AsyncFunction' ? await vehicle.onStreamIn(vehicle) : vehicle.onStreamIn(vehicle);
});