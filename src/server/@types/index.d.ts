declare global {
	interface PlayerMp {
		money: number; // balance on the bank account
		ownVehicles: VehicleMp[]; // vehicles in ownership
	}
  
	interface VehicleMp {
		onStreamIn(vehicle: VehicleMp): void;
	}
}

export {};
