
export interface SellItemCreation<TEntityMp extends EntityMp> {
  readonly item: TEntityMp;
  readonly price: number;
  readonly seller: PlayerMp;
  readonly spawnPosition?: Vector3;
}

// Class that describes who and what was placed for a sale
// If an instance exists - item on sale, of not - item was bought
export default class SellItem<TEntityMp extends EntityMp> {
  private readonly _item: TEntityMp;
  private readonly _price: number;
  private readonly _seller: PlayerMp;
  private readonly _spawnPosition: Vector3; // Position where item is being spawned after purchase

  constructor(creationAttrs: SellItemCreation<TEntityMp>) {
    this._item = creationAttrs.item
    this._price = creationAttrs.price
    this._seller = creationAttrs.seller
    this._spawnPosition = creationAttrs.spawnPosition ? creationAttrs.spawnPosition : creationAttrs.item.position
  }

  
  public get item() : TEntityMp {
    return this._item;
  }
  
  public get price() : number {
    return this._price;
  }

  public get seller() : PlayerMp {
    return this._seller;
  }

  public get spawnPosition() : Vector3 {
    return this._spawnPosition;
  }
}