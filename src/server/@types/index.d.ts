declare global {
	interface VehicleMp {
		onStreamIn(vehicle: VehicleMp): void;
	}
}

export {};
