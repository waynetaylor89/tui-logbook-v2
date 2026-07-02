import { getCache, getValidCache, isOffline, setCache } from "../cacheService.js";

const BASE_URL = "https://api.aviationstack.com/v1/flights";
const AIRPORT = "MAN";
const CACHE_KEY_DEPARTURES = `departures:${AIRPORT}`;
const CACHE_KEY_ARRIVALS = `arrivals:${AIRPORT}`;

export class FlightProviderInterface {
  async getTodayFlights() {
    throw new Error("Provider must implement getTodayFlights().");
  }

  async getDepartures() {
    throw new Error("Provider must implement getDepartures().");
  }

  async getArrivals() {
    throw new Error("Provider must implement getArrivals().");
  }

  async refreshFlights() {
    throw new Error("Provider must implement refreshFlights().");
  }
}

export class AviationStackProvider extends FlightProviderInterface {
  constructor() {
    super();
    this.apiKey = String(import.meta.env.VITE_AVIATIONSTACK_API_KEY || "").trim();
  }

  async getDepartures() {
    return this.fetchByScope({
      cacheKey: CACHE_KEY_DEPARTURES,
      requestParams: {
        dep_iata: AIRPORT,
        flight_date: today(),
      },
      arrivalDeparture: "Departure",
    });
  }

  async getArrivals() {
    return this.fetchByScope({
      cacheKey: CACHE_KEY_ARRIVALS,
      requestParams: {
        arr_iata: AIRPORT,
        flight_date: today(),
      },
      arrivalDeparture: "Arrival",
    });
  }

  async getTodayFlights() {
    const [departures, arrivals] = await Promise.all([
      this.getDepartures(),
      this.getArrivals(),
    ]);

    const combined = dedupeFlights([...(departures.data || []), ...(arrivals.data || [])]);

    return {
      loading: false,
      error: [departures.error, arrivals.error].filter(Boolean).join(" | "),
      data: combined,
      fromCache: Boolean(departures.fromCache && arrivals.fromCache),
    };
  }

  async refreshFlights() {
    return this.fetchFreshCombined();
  }

  async fetchFreshCombined() {
    if (!this.apiKey) {
      return this.offlineErrorResult("AviationStack is not configured.");
    }

    try {
      const [depRows, arrRows] = await Promise.all([
        this.requestFlights({ dep_iata: AIRPORT, flight_date: today() }),
        this.requestFlights({ arr_iata: AIRPORT, flight_date: today() }),
      ]);

      const departures = depRows.map((row) => normalizeFlight(row, "Departure")).filter(matchesTuiFilter);
      const arrivals = arrRows.map((row) => normalizeFlight(row, "Arrival")).filter(matchesTuiFilter);

      setCache(CACHE_KEY_DEPARTURES, departures);
      setCache(CACHE_KEY_ARRIVALS, arrivals);

      return {
        loading: false,
        error: "",
        data: dedupeFlights([...departures, ...arrivals]),
        fromCache: false,
      };
    } catch (error) {
      return this.offlineErrorResult(error?.message || "Unable to refresh live flights.");
    }
  }

  async fetchByScope({ cacheKey, requestParams, arrivalDeparture }) {
    if (!this.apiKey) {
      return this.offlineErrorResult("AviationStack is not configured.", cacheKey);
    }

    const validCache = getValidCache(cacheKey);
    if (validCache) {
      return {
        loading: false,
        error: "",
        data: validCache.data || [],
        fromCache: true,
      };
    }

    if (isOffline()) {
      return this.offlineErrorResult("You are offline.", cacheKey);
    }

    try {
      const rows = await this.requestFlights(requestParams);
      const normalized = rows
        .map((row) => normalizeFlight(row, arrivalDeparture))
        .filter(matchesTuiFilter);

      setCache(cacheKey, normalized);

      return {
        loading: false,
        error: "",
        data: normalized,
        fromCache: false,
      };
    } catch (error) {
      return this.offlineErrorResult(error?.message || "Failed to fetch live flights.", cacheKey);
    }
  }

  async requestFlights(params) {
    const url = new URL(BASE_URL);
    url.searchParams.set("access_key", this.apiKey);

    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value) !== "") {
        url.searchParams.set(key, String(value));
      }
    });

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Live flights request failed (${response.status}).`);
    }

    const payload = await response.json();
    if (payload?.error?.info) {
      throw new Error(payload.error.info);
    }

    return Array.isArray(payload?.data) ? payload.data : [];
  }

  offlineErrorResult(reason, cacheKey) {
    const cache = cacheKey ? getCache(cacheKey) : null;
    if (cache?.data?.length) {
      return {
        loading: false,
        error: `Live data unavailable. Showing cached flights. ${reason}`,
        data: cache.data,
        fromCache: true,
      };
    }

    return {
      loading: false,
      error: "Live flight data is currently unavailable. Please try again later.",
      data: [],
      fromCache: false,
    };
  }
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function normalizeFlight(item, arrivalDeparture) {
  const departure = item?.departure || {};
  const arrival = item?.arrival || {};

  const flightNumber = String(item?.flight?.iata || item?.flight?.number || "")
    .trim()
    .toUpperCase();

  const registration = String(item?.aircraft?.registration || "")
    .trim()
    .toUpperCase();

  return {
    id: [
      String(item?.flight_date || today()),
      flightNumber || Math.random().toString(36).slice(2, 8),
      arrivalDeparture,
      registration,
    ].join("|"),
    flightNumber,
    airline: String(item?.airline?.name || item?.airline?.iata || "").trim(),
    registration,
    aircraftType: String(item?.aircraft?.iata || item?.aircraft?.icao || "").trim(),
    arrivalDeparture,
    origin: String(departure?.iata || departure?.airport || "").trim().toUpperCase(),
    destination: String(arrival?.iata || arrival?.airport || "").trim().toUpperCase(),
    scheduledTime: toHHMM(arrivalDeparture === "Departure" ? departure?.scheduled : arrival?.scheduled),
    estimatedTime: toHHMM(arrivalDeparture === "Departure" ? departure?.estimated : arrival?.estimated),
    actualTime: toHHMM(arrivalDeparture === "Departure" ? departure?.actual : arrival?.actual),
    terminal: String(
      arrivalDeparture === "Departure" ? departure?.terminal || "" : arrival?.terminal || ""
    ).trim(),
    gate: String(arrivalDeparture === "Departure" ? departure?.gate || "" : arrival?.gate || "")
      .trim()
      .toUpperCase(),
    status: String(item?.flight_status || "Scheduled").trim(),
    importedAt: new Date().toISOString(),
  };
}

function toHHMM(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";

  const iso = raw.match(/T(\d{2}):(\d{2})/);
  if (iso) {
    return `${iso[1]}:${iso[2]}`;
  }

  const hhmm = raw.match(/^(\d{1,2}):(\d{2})$/);
  if (hhmm) {
    return `${String(Number(hhmm[1])).padStart(2, "0")}:${hhmm[2]}`;
  }

  return "";
}

function matchesTuiFilter(flight) {
  const airline = String(flight?.airline || "").toUpperCase();
  const flightNumber = String(flight?.flightNumber || "").toUpperCase();
  return airline.includes("TUI") || flightNumber.startsWith("BY");
}

function dedupeFlights(flights) {
  const map = new Map();

  for (const flight of flights || []) {
    const key = [
      flight.flightNumber,
      flight.arrivalDeparture,
      flight.scheduledTime,
      flight.registration,
    ]
      .map((value) => String(value || "").trim().toLowerCase())
      .join("|");

    if (!map.has(key)) {
      map.set(key, flight);
    }
  }

  return Array.from(map.values());
}
