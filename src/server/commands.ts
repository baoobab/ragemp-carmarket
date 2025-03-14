import { VEHICLE_NAMES } from '@shared/constants';
import CarMarket, { carMarkets } from "./carMarket";


/**
 * Command to spawn a vehicle.
 * 
 * @param player The player who invoked the command.
 * @param carName The name of the vehicle to spawn. One of: VEHICLE_NAMES
 */
mp.events.addCommand("spawncar", (player: PlayerMp, carName = "") => {  
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

/**
 * Command to create a new cuboid colshape.
 * 
 * @param player The player who invoked the command.
 * @param dimensions The dimensions of the colshape in the format "width height depth".
 */
mp.events.addCommand("addcolshape", (player: PlayerMp, dimensions: string) => {
  if (!dimensions || dimensions.split(" ").length < 3) {
    return player.outputChatBox(`Bad dimensions`)
  }
  const [width, height, depth] = dimensions.split(" ").map((_) => {return Number(_)})

  mp.colshapes.newCuboid(
    player.position.x, // center X-coords
    player.position.y, // center Y-coords
    player.position.z, // center Z-coords
    depth,
    width,
    height,
    player.dimension
  );
})

/**
 * Command to create a new car market.
 * 
 * @param player The player who invoked the command.
 * @param dimensions The dimensions of the colshape in the format "width height depth".
 */
mp.events.addCommand("addcarmarket", (player: PlayerMp, dimensions: string) => {
  if (!dimensions || dimensions.split(" ").length < 3) {
    return player.outputChatBox(`Bad dimensions`)
  }
  const [width, height, depth] = dimensions.split(" ").map((_) => {return Number(_)})

  const shape = mp.colshapes.newCuboid(
    player.position.x, // center X-coords
    player.position.y, // center Y-coords
    player.position.z, // center Z-coords
    depth,
    width,
    height,
    player.dimension
  );

  const carMarket = new CarMarket(shape, [
    mp.markers.new(
      1, 
      new mp.Vector3(player.position.x, player.position.y, player.position.z), 
      1, 
      {
      color: [255, 0, 0, 100], // Red color
      visible: false // Default hidden
    }),
    mp.markers.new(
      1, 
      new mp.Vector3(player.position.x -1, player.position.y -1, player.position.z), 
      1, 
      {
      color: [0, 0, 255, 100], // Blue color
      visible: false // Default hidden
    }),
    mp.markers.new(
      1, 
      new mp.Vector3(player.position.x +1, player.position.y +1, player.position.z), 
      1, 
      {
      color: [0, 255, 0, 100], // Green color
      visible: false // Default hidden
    })
  ])
  
  carMarkets.push(carMarket)
})

/**
 * Command to remove colshape by id.
 * 
 * @param player The player who invoked the command.
 * @param shapeId The id of shape.
 */
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