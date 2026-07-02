import { fetchFlights } from "../api/index.js";
import { offlineCache } from "../cache/index.js";

const FLIGHTS_CACHE_KEY = "flights";

export async function refreshFlights(options = {}) {
  const cache = offlineCache();
  const force = Boolean(options.force);

  if (!force) {
    const cached = cache.get(FLIGHTS_CACHE_KEY);
    if (Array.isArray(cached) && cached.length > 0) {
      return cached;
    }
  }

  const flights = await fetchFlights();
  cache.set(FLIGHTS_CACHE_KEY, flights);
  return flights;
}
