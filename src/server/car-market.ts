import { CustomEntityType, Dimensions } from "@shared/constants";
import InfoMarker from "./info-marker";
import SellPoint, { SellPointCreation } from "./sell-point";


export interface CarMarketCreation {
  readonly position: Vector3;
  readonly dimensions: Dimensions.Cuboid;
  readonly dimension: number;
}

// CarMarket manages SellPoints and their visibility on the client
export default class CarMarket {
  private _title: string = "Car Market"; // CarMarket title, shows on enter point
  private _position: Vector3; // Center position
  private _colshape: ColshapeMp; // CarMarket zone
  private _sellPoints: SellPoint<VehicleMp>[] = []; // Points where player can sell/buy a vehicle
  private _enterPoint: InfoMarker; // Enter point to CarMarket, shows info

  // signal, which calls when player exits the CarMarket zone. Default is undefined
  private _onExit: ((player: PlayerMp) => void) | undefined;

  // signal, which calls when player enters the CarMarket zone. Default is undefined
  private _onEnter: ((player: PlayerMp) => void) | undefined;

  private _calculateEnterPointHeading(from: Vector3): number {
    const delta = this._enterPoint.position.subtract(from);
    const angle = Math.atan2(delta.y, delta.x) * (180 / Math.PI);
    
    return (angle + 360 - 90) % 360;
  }

  // Generates default Market zone with Cuboid colshape, SellPoints on the 3 edges, and enterPoint on the last edge
  constructor(creationAttrs: CarMarketCreation) {
    const {position, dimensions, dimension} = creationAttrs;
    this._position = position

    // Placing the enter point to CarMarket (on the last side of rectangle)
    this._enterPoint = new InfoMarker(
      new mp.Vector3(position.x, position.y - dimensions.depth/2, position.z),
      0,
      [0, 255, 255, 150],
      this._title,
      dimension
    )

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
    this._colshape.isForCustomEntityType = true;
    this._colshape.customEntityType = CustomEntityType.CAR_MARKET;
  
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
    let sellPointNumber = 1;

    // from upper left to upper right (with offsets)
    for (let xPos = upperLeft.x + BOUND_OFFSET; 
      xPos < upperLeft.x + dimensions.width - BOUND_OFFSET;
      xPos += STEP
    ) {  
      const pos = new mp.Vector3(xPos, upperLeft.y - BOUND_OFFSET, upperLeft.z)

      this._sellPoints.push(new SellPoint({
        position: pos,
        title: `Empty Slot #${sellPointNumber}`,
        dimension: dimension,
        heading: this._calculateEnterPointHeading(pos)
      } as SellPointCreation));
      sellPointNumber++;
    }
    
    // from upper right to bottom right (with offsets)
    for (let yPos = upperRight.y - dimensions.depth + BOUND_OFFSET; 
      yPos <= upperRight.y - BOUND_OFFSET; 
      yPos += STEP
    ) {
      const pos = new mp.Vector3(upperRight.x - BOUND_OFFSET, yPos, upperRight.z)
      this._sellPoints.push(new SellPoint({
        position: pos,
        title: `Empty Slot #${sellPointNumber}`,
        dimension: dimension,
        heading: this._calculateEnterPointHeading(pos)
      } as SellPointCreation));
      sellPointNumber++;
    }
  
    // from upper left to bottom left (with offsets)
    for (let yPos = upperLeft.y - dimensions.depth + BOUND_OFFSET; 
      yPos < upperLeft.y - BOUND_OFFSET; 
      yPos += STEP
    ) {
      const pos = new mp.Vector3(upperLeft.x + BOUND_OFFSET, yPos, upperLeft.z)
      this._sellPoints.push(new SellPoint({
        position: pos,
        title: `Empty Slot #${sellPointNumber}`,
        dimension: dimension,
        heading: this._calculateEnterPointHeading(pos)
      } as SellPointCreation));
      sellPointNumber++;
    }
  }
  
  public set title(newTitle: string) {
    this._title = newTitle;
  }

  public get title(): string {
    return this._title;
  }

  public get colshape() : ColshapeMp {
    return this._colshape
  }
  
  public get sellPoints() : SellPoint<VehicleMp>[] {
    return this._sellPoints
  }

  public get position() : Vector3 {
    return this._position
  }

  public sellPointByColshapeId(shapeId: number): SellPoint<VehicleMp> | undefined {
    return this._sellPoints.filter((point) => point.colshape.id === shapeId)[0]
  }

  public sellPointByPosition(position: Vector3): SellPoint<VehicleMp> | undefined {
    return this._sellPoints.filter((point) => point.colshape.isPointWithin(position))[0]
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