import { CustomEntityType } from "@shared/constants";

declare global {
	interface ColshapeMp {
		isForCustomEntityType: boolean; // Is the colshape refers to CustomEntityType
		customEntityType: CustomEntityType | undefined; // What custom type owns this colshape.
	}

	interface PlayerMp {
		money: number; // balance on the bank account
		ownVehicles: VehicleMp[]; // vehicles in ownership
	}
  
	interface VehicleMp {
		onStreamIn(vehicle: VehicleMp): void;
	}
}

export {};
