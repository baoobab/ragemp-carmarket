export namespace Dimensions {
  export interface Cuboid {
    width: number;
    depth: number;
    height: number;
  }
}

export enum CustomEntityType {
  // BANK = 'Bank',
  CAR_MARKET = 'CarMarket',
  SELL_POINT = 'SellPoint',
  INFO_MARKER = 'InfoMarker',
  SALE_ITEM = "SaleItem"
}

export const SPAWNPOINTS = {
  "SpawnPoints": [
      { "x": -425.517, "y": 1123.620, "z": 325.854 },
      { "x": -415.777, "y": 1168.791, "z": 325.854 },
      { "x": -432.534, "y": 1157.461, "z": 325.854 },
      { "x": -401.850, "y": 1149.482, "z": 325.854 }
  ]
}