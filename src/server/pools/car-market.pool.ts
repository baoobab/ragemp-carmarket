import CarMarket, { CarMarketCreation } from '../modules/car-market';

// Singleton repo (analog for Entity Pool)
export class CarMarketRepository {
	private static _instance: CarMarketRepository;
	private _markets: CarMarket[] = [];

	private constructor() {}

	public static instance(): CarMarketRepository {
		if (!CarMarketRepository._instance) {
			CarMarketRepository._instance = new CarMarketRepository();
		}
		return CarMarketRepository._instance;
	}

	public createMarket(creationAttrs: CarMarketCreation): CarMarket {
		const market = new CarMarket(creationAttrs);
		this.addMarket(market);
		return market;
	}

	public addMarket(market: CarMarket): void {
		this._markets.push(market);
	}

	public removeMarket(market: CarMarket): void {
		const index = this._markets.indexOf(market);
		if (index !== -1) {
			this._markets[index].destroy();
			this._markets.splice(index, 1);
		}
	}

	public filter(predicate: (market: CarMarket) => boolean): CarMarket[] {
		return this._markets.filter(predicate);
	}
}

// CarMarket's Pool
export const carMarketsPool: CarMarketRepository = CarMarketRepository.instance();
