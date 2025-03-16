﻿import { VEHICLE_NAMES, Dimensions, CustomEntityType } from '@shared/constants';
import { CarMarketCreation } from "./car-market";
import { carMarketsPool } from './custom-pools'
import { SellPointState } from './sell-point';


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
 * Command to spawn an own vehicle. That vehicle has being stored into the player.ownVehicles
 * 
 * @param player The player who invoked the command.
 * @param carName The name of the vehicle to spawn. One of: VEHICLE_NAMES
 */
mp.events.addCommand("spawnowncar", (player: PlayerMp, carName = "") => {  
  if (!Object.keys(VEHICLE_NAMES).includes(carName)) {
    return player.outputChatBox('No such vehicle');
  }

	const vehicle = mp.vehicles.new(mp.joaat(carName), player.position); //Creating the vehicle
  player.ownVehicles.push(vehicle) // Store the own vehicle info

	// Adding a custom method to the vehicle which will handle the stream in (will be called from the client).
	vehicle.onStreamIn = (veh: VehicleMp) => { //supports async as well
    
	  if (!player || !mp.players.exists(player)) return; //if the player is no longer available when this method is called we return here.

	  setTimeout(() => {player.putIntoVehicle(veh, 0)}, 200) //we put the player into the vehicle as soon as the vehicle is streamed in.
	}

	player.position = vehicle.position; //setting player position to the vehicle position

})

/**
 * Command to show vehicles in ownership. Vehicles from the player.ownVehicles
 * 
 * @param player The player who invoked the command.
 */
mp.events.addCommand("owncars", (player: PlayerMp) => {  
  player.outputChatBox(`own cars count: ${player.ownVehicles.length}\nmodels: ${player.ownVehicles.map((veh) => {return veh.model})}`)
})

/**
 * Command to sell the current vehicle.
 * 
 * @param player The player who invoked the command, he must owns this vehicle.
 * @param price the price.
 */
mp.events.addCommand("sellcar", (player: PlayerMp, fullText) => {  
  if (!fullText || isNaN(Number(fullText))) {
    return player.outputChatBox(`Bad price`)
  }  

  if (!player.vehicle) {
    return player.outputChatBox(`You must be in vehicle`)
  }

  const ownVehicle = player.ownVehicles.find((veh) => veh.id === player.vehicle.id)
  if (!ownVehicle) {
    return player.outputChatBox(`You can sell only vehicle in ownership`)
  }
  
  const targetCarMarketId = player.getVariable<number>("currentCarMarketColshapeId")
  if (targetCarMarketId === null) {
    return player.outputChatBox(`You can sell vehicle only in the car market zone`)
  }
  const targetCarMarket = carMarketsPool.filter((market) => market.colshape.id === targetCarMarketId)[0]

  const sellPoint = targetCarMarket.sellPointByPosition(player.position)

  if (sellPoint == null) {
    return player.outputChatBox(`You should be on the sell point`)
  }

  if (sellPoint.state !== SellPointState.EMPTY) {
    return player.outputChatBox(`Sell point is buzy, try to find another one`)
  }

  const price = Number(fullText);

  ownVehicle.getOccupants().forEach((player) => {
    player.removeFromVehicle()
  })
  const destroyVehicleId = ownVehicle.id
  const destroyVehicleModel = ownVehicle.model

  ownVehicle.destroy()
  // TODO: handle on entityDestroyed
  player.ownVehicles = player.ownVehicles.filter((veh) => {veh.id != destroyVehicleId})

  const vehiclePreview = mp.vehicles.new(destroyVehicleModel, sellPoint.marker.position, {
    locked: true,
    heading: sellPoint.heading
  });

  vehiclePreview.onStreamIn = (veh: VehicleMp) => { // supports async as well    
	  veh.setVariable("isPreview", true);
    veh.movable = false;
    veh.locked = true;
    
    player.call("client::makeVehiclePreview", [veh.id])

    teleportToDriverDoor(player, veh)
	}
  
  // player.call("showVehicleSellConfirmation", [player.vehicle, price, sellPoint]);
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