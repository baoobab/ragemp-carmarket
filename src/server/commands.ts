import { VEHICLE_NAMES } from '@shared/constants';
import CarMarket, { carMarkets } from "./carMarket";

mp.events.addCommand("spawncar", (player, carName = "") => {  
  if (!Object.keys(VEHICLE_NAMES).includes(carName)) {
    return player.outputChatBox('No such vehicle');
  }

	const vehicle = mp.vehicles.new(mp.joaat(carName), player.position); //Creating the vehicle

	// Adding a custom method to the vehicle which will handle the stream in (will be called from the client).
	vehicle.onStreamIn = (veh: VehicleMp) => { //supports async as well
    
	  if (!player || !mp.players.exists(player)) return; //if the player is no longer available when this method is called we return here.

	  setTimeout(() => {player.putIntoVehicle(veh, 0)}, 200) //we put the player into the vehicle as soon as the vehicle is streamed in.
	}

	player.position = vehicle.position; //setting player position to the vehicle position

})

mp.events.addCommand("addcolshape", (player, dimensions: string) => {
  if (!dimensions || dimensions.split(" ").length < 3) {
    return player.outputChatBox(`Bad dimensions`)
  }
  const [width, height, depth] = dimensions.split(" ").map((_) => {return Number(_)})

  mp.colshapes.newCuboid(
    player.position.x, // X-Координаты центра
    player.position.y, // Y-Координаты центра
    player.position.z, // Z-Координаты центра
    depth,  // Длина
    width,  // Ширина
    height, // Высота
    player.dimension
  );
})

mp.events.addCommand("addcarmarket", (player, dimensions: string) => {
  if (!dimensions || dimensions.split(" ").length < 3) {
    return player.outputChatBox(`Bad dimensions`)
  }
  const [width, height, depth] = dimensions.split(" ").map((_) => {return Number(_)})

  const shape = mp.colshapes.newCuboid(
    player.position.x, // X-Координаты центра
    player.position.y, // Y-Координаты центра
    player.position.z, // Z-Координаты центра
    depth,  // Длина
    width,  // Ширина
    height, // Высота
    player.dimension
  );

  const carMarket = new CarMarket(shape, [
    mp.markers.new(
      1, 
      new mp.Vector3(player.position.x, player.position.y, player.position.z), 
      1, 
      {
      color: [255, 0, 0, 100], // Красный цвет
      visible: false // Скрыт по умолчанию
    }),
    mp.markers.new(
      1, 
      new mp.Vector3(player.position.x -1, player.position.y -1, player.position.z), 
      1, 
      {
      color: [0, 0, 255, 100], // Красный цвет
      visible: false // Скрыт по умолчанию
    }),
    mp.markers.new(
      1, 
      new mp.Vector3(player.position.x +1, player.position.y +1, player.position.z), 
      1, 
      {
      color: [0, 255, 0, 100], // Красный цвет
      visible: false // Скрыт по умолчанию
    })
  ])
  
  carMarkets.push(carMarket)
})

mp.events.addCommand("rmcolshape", (player, fullText) => {
  if (!fullText || isNaN(Number(fullText))) {
    return player.outputChatBox(`Bad input`)
  }
  const shapeId = Number(fullText)
  let isDestroyed = false

  mp.colshapes.forEach((shape) => {
    if (shape.id === shapeId) {
      shape.destroy()
      isDestroyed = true
      return
    }
  })
  
  if (isDestroyed) {
    return player.outputChatBox(`Colshape ${shapeId} destroyed`)
  }

  return player.outputChatBox(`Colshape not found`)
})

// Adding a event which will be called from client when the vehicle streams in
mp.events.add('server::vehicleStreamIn', async (_player, remoteid) => {
	const vehicle = mp.vehicles.at(remoteid);

	if (!vehicle || !mp.vehicles.exists(vehicle)) return;
	if (!vehicle.onStreamIn || typeof vehicle.onStreamIn === 'undefined') return;
	vehicle.onStreamIn.constructor.name === 'AsyncFunction' ? await vehicle.onStreamIn(vehicle) : vehicle.onStreamIn(vehicle);
});