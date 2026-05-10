import { initialFleet } from "../fleetData.js";

export const createFleetSlice = (set, get) => ({
  fleet: initialFleet,
  setFleet: (fleet) => set({ fleet }),
  addAircraftToFleet: (newReg, newType) => {
    const newAircraft = `${newReg.toUpperCase()} - ${newType}`;
    const fleet = get().fleet;
    if (!fleet.includes(newAircraft)) {
      set({ fleet: [...fleet, newAircraft].sort() });
    }
  },
  resetFleet: () => set({ fleet: initialFleet }),
});
