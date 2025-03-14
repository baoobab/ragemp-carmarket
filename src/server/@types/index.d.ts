declare global {
	interface PlayerMp {
		customProperty: number;

		customMethod(): void;
	}

	interface VehicleMp {
		onStreamIn(vehicle: VehicleMp): void;
	}
}

export {};
