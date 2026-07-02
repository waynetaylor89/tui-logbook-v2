import { AviationStackProvider } from "./providers/aviationStackProvider.js";

let activeProvider = new AviationStackProvider();

export function setFlightProvider(provider) {
  if (!provider) {
    throw new Error("Invalid flight provider.");
  }

  const requiredMethods = [
    "getTodayFlights",
    "getDepartures",
    "getArrivals",
    "refreshFlights",
  ];

  for (const methodName of requiredMethods) {
    if (typeof provider[methodName] !== "function") {
      throw new Error(`Flight provider must implement ${methodName}().`);
    }
  }

  activeProvider = provider;
}

export function getFlightProvider() {
  return activeProvider;
}

export async function getDepartures() {
  return activeProvider.getDepartures();
}

export async function getArrivals() {
  return activeProvider.getArrivals();
}

export async function getTodayFlights() {
  return activeProvider.getTodayFlights();
}

export async function refreshFlights() {
  return activeProvider.refreshFlights();
}
