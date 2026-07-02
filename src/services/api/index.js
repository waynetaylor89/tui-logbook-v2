import { MockFlightProvider } from "./MockFlightProvider.js";
export { getDepartures, getArrivals, getTodayFlights, refreshFlights as refreshAviationStackFlights } from "./aviationStackService.js";

let activeProvider = new MockFlightProvider();

export function setFlightProvider(provider) {
  if (!provider || typeof provider.fetchFlights !== "function" || typeof provider.fetchAircraft !== "function") {
    throw new Error("Invalid provider. Expected fetchFlights() and fetchAircraft() methods.");
  }

  activeProvider = provider;
}

export function getFlightProvider() {
  return activeProvider;
}

export async function fetchFlights() {
  return activeProvider.fetchFlights();
}

export async function fetchAircraft() {
  return activeProvider.fetchAircraft();
}
