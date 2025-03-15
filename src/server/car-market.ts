import { Dimensions } from "@shared/constants";
import InfoMarker from "./info-marker";

export default class CarMarket {
  private _colshape: ColshapeMp; // CarMarket zone
  private _sellPoints: MarkerMp[] = []; // Points where player can sell/buy a vehicle
  private _enterPoint: InfoMarker; // Enter point to CarMarket, shows info

  // signal, which calls when player exits the CarMarket zone. Default is undefined
  private _onExit: ((player: PlayerMp) => void) | undefined;

  // signal, which calls when player enters the CarMarket zone. Default is undefined
  private _onEnter: ((player: PlayerMp) => void) | undefined;


  // Generates default Market zone with Cuboid colshape, SellPoints on the 3 edges, and enterPoint on the last edge
  constructor(position: Vector3, dimensions: Dimensions.Cuboid, dimension: number = 1) {
    // Paddings for sell points
    const BOUND_OFFSET = 5;
    const STEP = 5;

    // CarMarket zone (where all the interactions began)
    this._colshape = mp.colshapes.newCuboid(
      position.x, // center X-coords
      position.y, // center Y-coords
      position.z, // center Z-coords
      dimensions.width,
      dimensions.depth,
      dimensions.height,
      dimension,
    );
  
    // CarMarket zone corners
    const upperLeft = new mp.Vector3(
      position.x - dimensions.width/2,
      position.y + dimensions.depth/2,
      position.z
    )
    const upperRight = new mp.Vector3(
      position.x + dimensions.width/2,
      position.y + dimensions.depth/2,
      position.z
    )
  
  
    // Placing the sell points on the perimeter

    // from upper left to upper right (with offsets)
    for (let xPos = upperLeft.x + BOUND_OFFSET; 
      xPos < upperLeft.x + dimensions.width - BOUND_OFFSET;
      xPos += STEP) {
      this._sellPoints.push(mp.markers.new(
        1,
        new mp.Vector3(xPos, upperLeft.y - BOUND_OFFSET, upperLeft.z),
        1,
        { color: [255, 0, 0, 150], dimension: dimension }
      ));
    }
    
    // from upper right to bottom right (with offsets)
    for (let yPos = upperRight.y - dimensions.depth + BOUND_OFFSET; yPos <= upperRight.y - BOUND_OFFSET; yPos += STEP) {
      this._sellPoints.push(mp.markers.new(
        1,
        new mp.Vector3(upperRight.x - BOUND_OFFSET, yPos, upperRight.z),
        1,
        { color: [0, 255, 0, 150], dimension: dimension }
      ));
    }
  
    // from upper left to bottom left (with offsets)
    for (let yPos = upperLeft.y - dimensions.depth + BOUND_OFFSET; yPos < upperLeft.y - BOUND_OFFSET; yPos += STEP) {
      this._sellPoints.push(mp.markers.new(
        1,
        new mp.Vector3(upperLeft.x + BOUND_OFFSET, yPos, upperLeft.z),
        1,
        { color: [0, 0, 255, 150], dimension: dimension }
      ));
    }

    // Placing the enter point to CarMarket (on the last side of rectangle)
    this._enterPoint = new InfoMarker(
      new mp.Vector3(position.x, position.y - dimensions.depth/2, position.z),
      0,
      [0, 255, 255, 150],
      `Car Market`,
      dimension
    )
    this._enterPoint.label = "bebra"
  }
  
  public get colshape() : ColshapeMp {
    return this._colshape
  }
  
  public get sellPoints() : MarkerMp[] {
    return this._sellPoints
  }

  // Signal onEnter - when player enters into Market _colshape
  public onEnter(callback: (player: PlayerMp) => void) {
    this._onEnter = callback;
  }

  // Signal onEnter - when player leaves Market _colshape
  public onExit(callback: (player: PlayerMp) => void) {
    this._onExit = callback;
  }

  // Tells the class that the player is ready to interact with it
  public enter(player: PlayerMp) {
    this._sellPoints.forEach((point) => {
      point.showFor(player)
    })

    if (this._onEnter) {
      this._onEnter(player);
    }
  }

  // Tells the class that the player has finished interacting with it
  public exit(player: PlayerMp) {
    this._sellPoints.forEach((point) => {
      point.hideFor(player)
    })

    if (this._onExit) {
      this._onExit(player);
    }
  }

  // Destructor
  public destroy() {
    this._colshape.destroy()
    
    while (this._sellPoints.length > 0) {
      this._sellPoints[0].destroy()
    }
  }
}