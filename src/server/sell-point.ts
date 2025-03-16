import InfoMarker from "./info-marker";
import SaleItem from "./sale-item";


export enum SellPointState {
  CLOSED, // When SellPoint closed by the admin/etc
  EMPTY, // (default state) When SellPoint is ready to store selling an item
  FOR_SALE, // When SellPoint contains an item
  PURCHASING, // When customer interacts (purchasing in process)
}

// SellPoint is place where a customer (player) can buy item, which this point is selling now
// and a seller can create this point and put any item for sale on that
export default class SellPoint<TEntityMp extends EntityMp> {
  private _colshape: ColshapeMp; // Area where sell/buy operations affords
  private _marker: InfoMarker; // Only visual, for players
  private _item: SaleItem <TEntityMp>| undefined; // Vehicle for sale. Default is undefined
  private _state: SellPointState = SellPointState.EMPTY; // Current state

  // Get color by current state
  private _stateColor(): Array4d {
    switch (this._state) {
      case SellPointState.CLOSED: {
        return [255, 0, 0, 150] // Red
      }
      case SellPointState.FOR_SALE: {
        return [0, 255, 0, 150] // Green
      }
      case SellPointState.PURCHASING: {
        return [0, 0, 255, 150] // Blue
      }
      default: {
        return [255, 255, 255, 150] // Default is White
      }
    }
  }

  constructor(
    position: Vector3, 
    title: string, 
    dimension: number = 1,
  ) {
    this._colshape = mp.colshapes.newTube(
      position.x,
      position.y,
      position.z,
      1,
      2, // purchase radius
      dimension
    )
    this._marker = new InfoMarker(
      new mp.Vector3(position.x, position.y, position.z),
      1,
      this._stateColor(), // Current state color
      title,
      dimension
    )
  }

  public placeForSale(itemForSale: TEntityMp, price: number, seller: PlayerMp) {
    this._item = new SaleItem<TEntityMp>(itemForSale, price, seller);
  }

  // public buy(customer: PlayerMp) {
    
  // }
  
  public showFor(player: PlayerMp) {
    this._marker.showFor(player)
  }

  public hideFor(player: PlayerMp) {
    this._marker.hideFor(player)
  }

  // Destructor
  public destroy() {
    this._colshape.destroy()
    this._marker.destroy()
    if (this._item) delete this._item;
    this._item = undefined;

    this._state = SellPointState.CLOSED
  }

  // TODO: remove from selling (clear the point only if state: FOR_SALE)
  // TODO: replace selling item (only if state: EMPTY)
  // TODO: event - enterSellPoint
  // TODO: event - exitSellPoint
}