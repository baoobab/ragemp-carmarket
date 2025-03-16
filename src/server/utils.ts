export const isRightHandDrive = (vehicle: VehicleMp): boolean => {
  const model = vehicle.model;
  
  const RHD_MODELS = new Set([
    mp.joaat(''),
    // or any right-hand car
  ]);

  return RHD_MODELS.has(model);
};

export const teleportToDriverDoor = (player: PlayerMp, vehicle: VehicleMp): void => {
  const offset = isRightHandDrive(vehicle) 
    ? new mp.Vector3(-1.2, 0, 0) // right offset
    : new mp.Vector3(1.2, 0, 0); // left offset

  const position = vehicle.position.add(
    offset
  );

  player.position = position;
}

export const isDriver = (player: PlayerMp): boolean => {
  return !!player.vehicle && player.seat === RageEnums.VehicleSeat.DRIVER;
}