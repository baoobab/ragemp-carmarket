import { VEHICLE_NAMES, Dimensions, CustomEntityType } from '@shared/constants';
import { CarMarketCreation } from "./car-market";
import { carMarketsPool } from './custom-pools'


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
mp.events.addCommand("addcolshape", (player: PlayerMp, fullText: string) => {
  if (!fullText || fullText.split(" ").length < 3) {
    return player.outputChatBox(`Bad dimensions`)
  }

  const rawDimensions = fullText.split(" ").map((_) => {return Number(_)})
  const dimensions: Dimensions.Cuboid = {width: rawDimensions[0], depth: rawDimensions[1], height: rawDimensions[2]}

  const shape = mp.colshapes.newCuboid(
    player.position.x, // center X-coords
    player.position.y, // center Y-coords
    player.position.z, // center Z-coords
    dimensions.width,
    dimensions.depth,
    dimensions.height,
    player.dimension
  );
  shape.isForCustomEntityType = false;
})

/**
 * Command to create a new car market.
 * 
 * @param player The player who invoked the command.
 * @param dimensions The dimensions of the colshape in the format "width height depth".
 */
mp.events.addCommand("addcarmarket", (player: PlayerMp, fullText: string) => {
  if (!fullText || fullText.split(" ").length < 3) {
    return player.outputChatBox(`Bad dimensions`)
  }

  const rawDimensions = fullText.split(" ").map((_) => {return Number(_)})
  const dimensions: Dimensions.Cuboid = {width: rawDimensions[0], depth: rawDimensions[1], height: rawDimensions[2]}

  const marketCreationAttrs: CarMarketCreation = {
    position: player.position,
    dimensions: dimensions, 
    dimension: player.dimension
  }
  carMarketsPool.createMarket(marketCreationAttrs)
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

/**
 * Command to show player's position
 * 
 * @param player The player who invoked the command.
 */
mp.events.addCommand("pos", (player) => {
  return player.outputChatBox(`x: ${Math.floor(player.position.x)} y: ${Math.floor(player.position.y)} z: ${Math.floor(player.position.z)}`)
})

/**
 * Command to show player's money
 * 
 * @param player The player who invoked the command.
 */
mp.events.addCommand("money", (player) => {
  if (!player || !mp.players.exists(player)) return;

  return player.outputChatBox(`money: ${player.money}`);
})

/**
 * Command to set player's money
 * 
 * @param player The player who invoked the command.
 */
mp.events.addCommand("setmoney", (player, fullText) => {
  if (!player || !mp.players.exists(player)) return;
  if (!fullText || isNaN(Number(fullText))) {
    return player.outputChatBox(`Bad input`);
  }
  const amount = Number(fullText)
  player.money = amount
})