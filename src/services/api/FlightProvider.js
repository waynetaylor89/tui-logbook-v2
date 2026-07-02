export class FlightProvider {
  async fetchFlights() {
    throw new Error("fetchFlights() must be implemented by the active provider.");
  }

  async fetchAircraft() {
    throw new Error("fetchAircraft() must be implemented by the active provider.");
  }
}
