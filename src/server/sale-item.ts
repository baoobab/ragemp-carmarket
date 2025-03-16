// Class that describes who and what was placed for a sale
// If an instance exists - item on sale, of not - item was bought
export default class SellItem<TEntityMp extends EntityMp> {
  // status?

  constructor(
    private readonly _item: TEntityMp,
    private readonly _price: number,
    private readonly _seller: PlayerMp,
  ) {}

  
  public get item() : TEntityMp {
    return this._item;
  }
  
  public get price() : number {
    return this._price;
  }

  public get seller() : PlayerMp {
    return this._seller;
  }
}