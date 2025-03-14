export default class CarMarket {
  private _colshape: ColshapeMp;
  private _sellPoints: MarkerMp[];

  constructor(colshape: ColshapeMp, sellPoints: MarkerMp[]) {
    this._colshape = colshape
    this._sellPoints = sellPoints
  }

  
  public get colshape() : ColshapeMp {
    return this._colshape
  }
  
  public get sellPoints() : MarkerMp[] {
    return this._sellPoints
  }

  enter(player: PlayerMp) {
    this._sellPoints.forEach((point) => {
      point.showFor(player)
    })
  }

  leave(player: PlayerMp) {
    this._sellPoints.forEach((point) => {
      point.hideFor(player)
    })
  }
  destroy() {
    this._colshape.destroy()
    
    while (this._sellPoints.length > 0) {
      this._sellPoints[0].destroy()
    }
  }
}

export const carMarkets: CarMarket[] = []