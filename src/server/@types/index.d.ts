declare global {
	interface PlayerMp {
		ownVehicles: VehicleMp[]; // vehicles in ownership
	}
  
	interface VehicleMp {
		onStreamIn(vehicle: VehicleMp): void;
	}
}

export {};
