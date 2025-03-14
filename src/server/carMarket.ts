export default class CarMarket {
  private _colshape: ColshapeMp;
  private _sellPoints: MarkerMp[];

  private _onExit: (player: PlayerMp) => void;
  private _onEnter: (player: PlayerMp) => void;

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

export const carMarkets: CarMarket[] = []