/**
 * TUI Flight Feed Service
 *
 * Priority order:
 * 1. Cached flights (from localStorage, 15 min TTL)
 * 2. FlightRadar24 imported flights (from store)
 * 3. Mock schedule (built-in fallback)
 *
 * This service replaces the AviationStack API dependency entirely.
 * It never makes any external network requests.
 */

import { getValidCachedFlights, getCachedFlights, getCacheSource, getCacheTimestamp } from "./cache.js";
import { saveCachedFlights } from "./cache.js";
import { getFr24ImportedFlights } from "./providers/fr24Provider.js";
import { getMockFlights } from "./providers/mockProvider.js";

let _flightsRefreshCache = {
  source: "",
  flights: [],
  refetchedAt: null,
};

/**
 * Get today's TUI flights.
 *
 * Priority: Cache → FR24 imports → Mock
 *
 * @param {object} [options]
 * @param {Array}  [options.storeFlights] - The current flights array from the Zustand store.
 * @param {boolean} [options.forceRefresh] - If true, bypass cache and re-evaluate providers.
 * @returns {{ flights: Array, source: string, timestamp: string }}
 */
export function getTodaysFlights(options = {}) {
  const storeFlights = Array.isArray(options?.storeFlights) ? options.storeFlights : [];
  const forceRefresh = Boolean(options?.forceRefresh);

  // 1. Try valid cache first (unless forced refresh)
  if (!forceRefresh) {
    const cached = getValidCachedFlights();
    if (cached && cached.length > 0) {
      return {
        flights: cached,
        source: getCacheSource() || "CACHE",
        timestamp: getCacheTimestamp(),
        from: "cache",
      };
    }
  }

  // 2. Try FR24 imported flights from store
  const fr24Flights = getFr24ImportedFlights(storeFlights);
  if (fr24Flights && fr24Flights.length > 0) {
    saveCachedFlights(fr24Flights, "FR24 IMPORT");
    return {
      flights: fr24Flights,
      source: "FR24 IMPORT",
      timestamp: Date.now(),
      from: "fr24",
    };
  }

  // 3. Fall back to mock
  const mockFlights = getMockFlights();
  const source = "MOCK";
  saveCachedFlights(mockFlights, source);
  return {
    flights: mockFlights,
    source,
    timestamp: Date.now(),
    from: "mock",
  };
}

/**
 * Refresh flights — evaluate providers (skipping expired cache) and update the store.
 *
 * @param {object}   options
 * @param {Array}    options.storeFlights - The current flights from the Zustand store.
 * @param {Function} options.setFlights   - The store's setFlights function.
 * @param {Function} options.importDailySchedule - The store's importDailySchedule function.
 * @returns {{ ok: boolean, flights: Array, source: string, error?: string }}
 */
export function refreshFlights(options = {}) {
  const storeFlights = Array.isArray(options?.storeFlights) ? options.storeFlights : [];
  const setFlights = typeof options?.setFlights === "function" ? options.setFlights : null;
  const importDailySchedule = typeof options?.importDailySchedule === "function" ? options.importDailySchedule : null;

  // Get fresh flights (bypasses cache)
  const result = getTodaysFlights({ storeFlights, forceRefresh: true });

  if (!result.flights || result.flights.length === 0) {
    return {
      ok: false,
      flights: [],
      source: "",
      error: "No flights available from any source.",
    };
  }

  // Update the Zustand store if we have the import function
  if (importDailySchedule && result.flights.length > 0) {
    try {
      importDailySchedule(result.flights, {
        replaceToday: true,
        summary: {
          flightsImported: result.flights.length,
          arrivals: result.flights.filter((f) => f.direction === "Arrival").length,
          departures: result.flights.filter((f) => f.direction === "Departure").length,
          duplicates: 0,
          errors: 0,
        },
      });
    } catch {
      // If importDailySchedule fails, fall back to setFlights
      if (setFlights) {
        setFlights(result.flights);
      }
    }
  } else if (setFlights && result.flights.length > 0) {
    setFlights(result.flights);
  }

  _flightsRefreshCache = {
    source: result.source,
    flights: result.flights,
    refetchedAt: Date.now(),
  };

  return {
    ok: true,
    flights: result.flights,
    source: result.source,
    timestamp: result.timestamp,
  };
}

export { saveCachedFlights, getCachedFlights, getCacheTimestamp, getCacheSource };
