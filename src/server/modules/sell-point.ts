﻿import { CustomEntityType } from '@shared/constants';
import InfoMarker from './info-marker';
import SaleItem, { SellItemCreation } from './sale-item';
import Bank from './bank';

export enum SellPointState {
	CLOSED, // When SellPoint closed by the admin/etc
	EMPTY, // (default state) When SellPoint is ready to store selling an item
	FOR_SALE, // When SellPoint contains an item
	PURCHASING // When customer interacts (purchasing in process)
}

export interface SellPointCreation {
	readonly position: Vector3;
	readonly title: string;
	readonly dimension: number;
	readonly heading?: number;
}

// SellPoint is place where a customer (player) can buy item, which this point is selling now
// and a seller can create this point and put any item for sale on that
export default class SellPoint<TEntityMp extends EntityMp> {
	private _colshape: ColshapeMp; // Area where sell/buy operations affords
	private _heading: number; // from 0 to 360, degrees. To set stored item heading
	private _marker: InfoMarker; // Only visual, for players
	private _defaultLabel: string;
	private _item: SaleItem<TEntityMp> | undefined; // Vehicle for sale. Default is undefined
	private _state: SellPointState = SellPointState.EMPTY; // Current state. Default is EMPTY

	// Get color by current state
	private _stateColor(): Array4d {
		switch (this._state) {
			case SellPointState.CLOSED: {
				return [255, 0, 0, 150]; // Red
			}
			case SellPointState.FOR_SALE: {
				return [0, 255, 0, 150]; // Green
			}
			case SellPointState.PURCHASING: {
				return [0, 0, 255, 150]; // Blue
			}
			default: {
				return [255, 255, 255, 150]; // Default is White
			}
		}
	}

	private _changeState(newState: SellPointState): boolean {
		switch (newState) {
			// Can set to CLOSED only by admin
			case SellPointState.CLOSED: {
				return false;
			}
			// Can set to EMPTY from PURCHASING (when customer buy a car)
			// and from FOR_SALE (when seller want to restore item)
			case SellPointState.EMPTY: {
				if (this._state !== SellPointState.PURCHASING) {
					return false;
				}
				this._state = SellPointState.EMPTY;
				break;
			}
			// Can set to FOR_SALE from EMPTY (when seller adds item)
			// and from PURCHASING (when customer leaves the point)
			case SellPointState.FOR_SALE: {
				if (this._state !== SellPointState.EMPTY && this._state !== SellPointState.PURCHASING) {
					return false;
				}
				this._state = SellPointState.FOR_SALE;
				break;
			}
			// Can set to PURCHASING only from FOR_SALE
			case SellPointState.PURCHASING: {
				if (this._state !== SellPointState.FOR_SALE) {
					return false;
				}
				this._state = SellPointState.PURCHASING;
				break;
			}
			default: {
				return false;
			}
		}

		this._marker.color = this._stateColor();
		return true;
	}

	constructor(creationAttrs: SellPointCreation) {
		const { position, title, dimension } = creationAttrs;

		this._colshape = mp.colshapes.newTube(
			position.x,
			position.y,
			position.z,
			1,
			2, // purchase radius
			dimension
		);
		this._colshape.isForCustomEntityType = true;
		this._colshape.customEntityType = CustomEntityType.SELL_POINT;

		this._marker = new InfoMarker(
			new mp.Vector3(position.x, position.y, position.z),
			1,
			this._stateColor(), // Current state color
			title,
			dimension
		);

		this._defaultLabel = title;
		this._heading = creationAttrs.heading || 0;
	}

	public get colshape(): ColshapeMp {
		return this._colshape;
	}

	public get marker(): InfoMarker {
		return this._marker;
	}

	public get item(): SaleItem<TEntityMp> | undefined {
		return this._item;
	}

	public get state(): SellPointState {
		return this._state;
	}

	public get heading(): number {
		return this._heading;
	}

	// When Seller place item for sale
	public placeForSale(itemForSale: TEntityMp, price: number, seller: PlayerMp): boolean {
		if (price <= 0) {
			seller.outputChatBox(`Price must be a positive number`);
			return false;
		}
		if (!Number.isInteger(price)) {
			seller.outputChatBox(`Price must be an integer`);
			return false;
		}

		if (this._state !== SellPointState.EMPTY) return false;
		if (!this._changeState(SellPointState.FOR_SALE)) return false;

		this._item = new SaleItem<TEntityMp>({
			item: itemForSale,
			price: price,
			seller: seller
		} as SellItemCreation<TEntityMp>);
		this._marker.label = `Seller: ${seller.name}, price: ${price}`;
		return true;
	}

	// When Customer start purchase process
	public buy(customer: PlayerMp): boolean {
		// If Sell Point doesn't contain any item - we can't buy a nothing
		if (!this._item) {
			customer.outputChatBox(`This sale point is empty`);
			return false;
		}
		// If Item price is too high
		if (this._item.price > customer.money) {
			customer.outputChatBox(`You don't have enough money`);
			return false;
		}

		if (this._state !== SellPointState.PURCHASING) return false;
		if (!Bank.transfer(customer, this._item.seller, this._item.price)) return false;

		if (mp.vehicles.at(this._item.item.id)) {
			const purchasedVehicle = mp.vehicles.new(this._item.item.model, this._item.spawnPosition, {
				heading: this._heading
			});
			customer.ownVehicles.push(purchasedVehicle);

			this._item.destroy();
			this._item = undefined;
			this._marker.label = this._defaultLabel;
			return this._changeState(SellPointState.EMPTY);
		}

		return false;
	}

	// When Seller wants to restore item, placed on sell before
	public restore(seller: PlayerMp): boolean {
		// If Sell Point doesn't contain any item - we can't buy a nothing
		if (!this._item) {
			seller.outputChatBox(`This sale point is empty`);
			return false;
		}
		// If player who wasn't the seller tries to restore
		if (this._item.seller.id !== seller.id) {
			seller.outputChatBox(`You are not seller for this Sell Point!`);
			return false;
		}

		if (
			// Item owner (seller) can restore item from any phase
			(this._state !== SellPointState.PURCHASING
				&& this._state !== SellPointState.FOR_SALE)) return false;

		if (mp.vehicles.at(this._item.item.id)) {
			const restoredVehicle = mp.vehicles.new(this._item.item.model, this._item.spawnPosition, {
				heading: this._heading
			});
			seller.ownVehicles.push(restoredVehicle);

			this._item.destroy();
			this._item = undefined;
			this._marker.label = this._defaultLabel;
			return this._changeState(SellPointState.EMPTY);
		}

		return false;
	}

	public showFor(player: PlayerMp) {
		this._marker.showFor(player);
	}

	public hideFor(player: PlayerMp) {
		this._marker.hideFor(player);
	}

	// Tells the class that the player is ready to interact with it
	public enter(wouldBeCustomer: PlayerMp) {
		// If player who entered - is the seller of this point
		if (this._item?.seller && wouldBeCustomer.id === this._item.seller.id) {
			if (process.env.CAN_OWNER_BUY_HIS_OWN === 'true') {
				wouldBeCustomer.outputChatBox(`You are the owner of this point and can buy the own car.`); // /restorecar - remove it from sale
			} else {
				wouldBeCustomer.outputChatBox(`You are the owner of this point and canNOT buy the own car.`); // /restorecar - remove it from sale
				return; // Seller cannot buy own car
			}
		}

		// Lock the point until first-entered player stays on it
		if (this._state !== SellPointState.FOR_SALE) return;
		if (this._changeState(SellPointState.PURCHASING)) {
			this._marker.label = `--BUSY-- Seller: ${this._item?.seller.name}, price: ${this._item?.price} --BUSY--`;
		}
	}

	// Tells the class that the player has finished interacting with it
	public leave(_wouldBeCustomer: PlayerMp) {
		// If first-entered player leaves the point - it can again be able to purchase
		if (this._state !== SellPointState.PURCHASING) return;
		if (this._changeState(SellPointState.FOR_SALE)) {
			this._marker.label = `Seller: ${this._item?.seller.name}, price: ${this._item?.price}`;
		}
	}

	// Destructor
	public destroy() {
		this._colshape.destroy();
		this._marker.destroy();
		if (this._item) delete this._item;
		this._item = undefined;

		this._state = SellPointState.CLOSED;
	}
}
