import { Dimensions } from '@shared/constants';
import { CarMarketCreation } from "../modules/car-market";
import { carMarketsPool } from '../pools/car-market.pool'
import { SellPointState } from '../modules/sell-point';
import { isDriver, teleportToDriverDoor } from '../utils';


/**
 * Command to spawn a vehicle.
 * 
 * @param player The player who invoked the command.
 * @param carName The name of the vehicle to spawn.
 */
mp.events.addCommand("spawncar", (player: PlayerMp, carNameString = "") => {  
  if (!player || !mp.players.exists(player)) return;
  const carNameHash = mp.joaat(carNameString)

  player.spawnCar(carNameHash)
})

/**
 * Command to spawn an own vehicle. That vehicle has being stored into the player.ownVehicles
 * 
 * @param player The player who invoked the command.
 * @param carName The name of the vehicle to spawn.
 */
mp.events.addCommand("spawnowncar", (player: PlayerMp, carNameString = "") => {  
  if (!player || !mp.players.exists(player)) return;
  const carNameHash = mp.joaat(carNameString)

  const vehicle = player.spawnCar(carNameHash)
  if (vehicle) player.ownVehicles.push(vehicle);
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
 * @param price the price. Positive Integer
 */
mp.events.addCommand("sellcar", (player: PlayerMp, fullText) => {  
  // Checks
  if (!fullText || isNaN(Number(fullText))) {
    return player.outputChatBox(`Bad price`)
  }  

  const price = Number(fullText);
  if (price <= 0) {
    return player.outputChatBox(`Price must be a positive number`)
  }
  if (!Number.isInteger(price)) {
    return player.outputChatBox(`Price must be an integer`)
  }
  if (!player.vehicle) {
    return player.outputChatBox(`You must be in vehicle`)
  }
  if (!isDriver(player)) {
    return player.outputChatBox(`You must be a driver`)
  }

  const ownVehicle = player.ownVehicles.find((veh) => veh.id === player.vehicle.id)
  if (!ownVehicle) {
    return player.outputChatBox(`You can sell only vehicle in ownership`)
  }
  
  // logics

  // Car Market id updates on every leave/entry event, try take it
  const targetCarMarketId = player.getVariable<number>("currentCarMarketColshapeId")
  if (targetCarMarketId === null) {
    return player.outputChatBox(`You can sell vehicle only in the car market zone`)
  }

  // Car Market instance
  const targetCarMarket = carMarketsPool.filter((market) => market.colshape.id === targetCarMarketId)[0]
  // Sell Point instance from current Car Market
  const sellPoint = targetCarMarket.sellPointByPosition(player.position)

  if (sellPoint == null) {
    return player.outputChatBox(`You should be on the sell point`)
  }

  // If point is ready to sale
  if (sellPoint.state !== SellPointState.EMPTY) {
    return player.outputChatBox(`Sell point is busy, try to find another one`)
  }
  
  // Remove all the players from the vehicle
  ownVehicle.getOccupants().forEach((player) => {
    player.removeFromVehicle()
  })

  // Store important data before object deleting
  const destroyVehicleId = ownVehicle.id
  const destroyVehicleModel = ownVehicle.model

  // Delete vehicle object and remove it from ownVehicles array
  ownVehicle.destroy()
  player.ownVehicles.splice(player.ownVehicles.findIndex(veh => veh.id === destroyVehicleId), 1)

  // Create base vehicle on the SellPoint
  const vehiclePreview = mp.vehicles.new(destroyVehicleModel, sellPoint.marker.position, {
    locked: true,
    heading: sellPoint.heading
  });

  // Make created vehicle looks like a preview (no damage, locked, etc)
  vehiclePreview.onStreamIn = (veh: VehicleMp) => {
	  veh.setVariable("isPreview", true);
    veh.movable = false;
    veh.locked = true;
    
    // Calls client to make vehile-preview
    player.call("client::makeVehiclePreview", [veh.id])

    // Tp driver (seller) into a door
    teleportToDriverDoor(player, veh)

    // Calls Sell Point to make this item for sale, and player - as a seller
    if (sellPoint.placeForSale(vehiclePreview, price, player)) {
      player.outputChatBox(`Success!`)
    } else {
      player.outputChatBox(`Cannot place for sale`)
    }
	}
})

/**
 * Command to buy car from the standing SellPoint.
 * 
 * @param player The player who invoked the command, must have enough money.
 */
mp.events.addCommand("buycar", (player: PlayerMp, _fullText) => {
  // Car Market id updates on every leave/entry event, try take it
  const targetCarMarketId = player.getVariable<number>("currentCarMarketColshapeId")
  if (targetCarMarketId === null) {
    return player.outputChatBox(`You can buy a vehicle only in the car market zone`)
  }

  // Car Market instance
  const targetCarMarket = carMarketsPool.filter((market) => market.colshape.id === targetCarMarketId)[0]
  // Sell Point instance from current Car Market
  const sellPoint = targetCarMarket.sellPointByPosition(player.position)
  if (sellPoint == null) {
    return player.outputChatBox(`You should be on the sell point`)
  }

  // Checks
  
  // If Sell Point doesn't contains any item - we can't by a nothing
  if (!sellPoint.item) {
    return player.outputChatBox(`This sale point is empty`)
  }

  // If Item price is too high
  if (sellPoint.item.price > player.money) {
    return player.outputChatBox(`You don't have enough money`)
  }

  // Logics

  // Calls Sell Point to buy this item
  if (sellPoint.buy(player)) {
    player.outputChatBox(`Success!`)
  } else {
    player.outputChatBox(`Cannot buy`)
  }
})

/**
 * Command to create a new cuboid colshape.
 * 
 * @param player The player who invoked the command.
 * @param dimensions The dimensions of the colshape in the format "width height depth".
 */
mp.events.addCommand("addcolshape", (player: PlayerMp, fullText: string) => {
  // Checks
  if (!fullText || fullText.split(" ").length < 3) {
    return player.outputChatBox(`Bad dimensions`)
  }

  const rawDimensions = fullText.split(" ").map((_) => {
    const num = Number(_);
    return Number.isInteger(num) && num >= 0 ? num : null;
  }).filter(_ => _ !== null);
  if (rawDimensions.length < 3) {
    return player.outputChatBox(`Invalid dimensions (only positive integers allowed)`);
  }

  // Logics

  // Unpack the dimensions
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
  // We create a base colshape - not as part of custom entity
  shape.isForCustomEntityType = false;
})

/**
 * Command to create a new car market.
 * 
 * @param player The player who invoked the command.
 * @param dimensions The dimensions of the colshape in the format "width height depth".
 */
mp.events.addCommand("addcarmarket", (player: PlayerMp, fullText: string) => {
  // Checks
  if (!fullText || fullText.split(" ").length < 3) {
    return player.outputChatBox(`Bad dimensions`)
  }

  const rawDimensions = fullText.split(" ").map((_) => {
    const num = Number(_);
    return Number.isInteger(num) && num >= 0 ? num : null;
  }).filter(_ => _ !== null);
  if (rawDimensions.length < 3) {
    return player.outputChatBox(`Invalid dimensions (only positive integers allowed)`);
  }  
  
  // Logics

  // Unpack the dimensions
  const dimensions: Dimensions.Cuboid = {width: rawDimensions[0], depth: rawDimensions[1], height: rawDimensions[2]}

  // Create Car Market instance
  const marketCreationAttrs: CarMarketCreation = {
    position: player.position,
    dimensions: dimensions, 
    dimension: player.dimension,
    title: `${player.name}'s Car Market`
  }
  
  // Store it in the custom pool
  carMarketsPool.createMarket(marketCreationAttrs)
})

/**
 * Command to remove carmarket by id.
 * 
 * @param player The player who invoked the command.
 * @param carMarketId The id of car market.
 */
mp.events.addCommand("rmcarmarket", (player, fullText) => {
  if (!fullText || isNaN(Number(fullText))) {
    return player.outputChatBox(`Bad input`)
  }

  const marketId = Number(fullText)
  const market = carMarketsPool.filter((market) => market.colshape.id === marketId)[0]

  if (market) {
    carMarketsPool.removeMarket(market)
    return player.outputChatBox(`Car Market ${marketId} destroyed`)
  }

  return player.outputChatBox(`Car Market not found`)
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

  if (amount <= 0) {
    return player.outputChatBox(`Amount must be a positive number`)
  }
  if (!Number.isInteger(amount)) {
    return player.outputChatBox(`Amount must be an integer`)
  }

  player.money = amount
})