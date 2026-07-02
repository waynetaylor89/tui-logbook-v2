const AVIATIONSTACK_BASE_URL = "https://api.aviationstack.com/v1/flights";
const AIRPORT_IATA = "MAN";
const CACHE_NAMESPACE = "aviationstack";
const CACHE_TTL_MS = 5 * 60 * 1000;

function getApiKey() {
  const apiKey = String(import.meta.env.VITE_AVIATIONSTACK_API_KEY || "").trim();
  if (!apiKey) {
    throw new Error("Missing AviationStack API key. Set VITE_AVIATIONSTACK_API_KEY in your environment.");
  }
  return apiKey;
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function createCacheKey(scope, date = getTodayDate()) {
  return `${CACHE_NAMESPACE}:${scope}:${AIRPORT_IATA}:${date}`;
}

function readCached(scope, date = getTodayDate()) {
  if (typeof window === "undefined" || !window.localStorage) return null;

  const raw = window.localStorage.getItem(createCacheKey(scope, date));
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.data)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCached(scope, data, date = getTodayDate()) {
  if (typeof window === "undefined" || !window.localStorage) return;

  const payload = {
    cachedAt: Date.now(),
    data: Array.isArray(data) ? data : [],
  };

  window.localStorage.setItem(createCacheKey(scope, date), JSON.stringify(payload));
}

function isCacheFresh(entry) {
  if (!entry?.cachedAt) return false;
  return Date.now() - entry.cachedAt <= CACHE_TTL_MS;
}

function normalizeFlight(item) {
  const airlineName = String(item?.airline?.name || item?.airline?.iata || "").trim();
  const flightIata = String(item?.flight?.iata || item?.flight?.number || "").trim().toUpperCase();
  const movement = String(item?.flight_status || "").trim();

  const departure = item?.departure || {};
  const arrival = item?.arrival || {};

  const departureTime = String(departure?.scheduled || "");
  const arrivalTime = String(arrival?.scheduled || "");

  const scheduledTime = departureTime || arrivalTime;
  const estimatedTime = String(departure?.estimated || arrival?.estimated || "");

  return {
    id: String(item?.flight_date || getTodayDate()) + "|" + (flightIata || Math.random().toString(36).slice(2, 9)),
    flightNumber: flightIata,
    airline: airlineName,
    registration: String(item?.aircraft?.registration || "").trim().toUpperCase(),
    aircraftRegistration: String(item?.aircraft?.registration || "").trim().toUpperCase(),
    aircraftType: String(item?.aircraft?.icao24 || item?.aircraft?.iata || item?.aircraft?.icao || "").trim(),
    aircraft: String(item?.aircraft?.icao24 || item?.aircraft?.iata || item?.aircraft?.icao || "").trim(),
    origin: String(departure?.iata || departure?.airport || "").trim().toUpperCase(),
    destination: String(arrival?.iata || arrival?.airport || "").trim().toUpperCase(),
    movement,
    type: movement,
    scheduledTime: toHHMM(scheduledTime),
    estimatedTime: toHHMM(estimatedTime),
    status: movement || "Scheduled",
    terminal: String(departure?.terminal || arrival?.terminal || "").trim(),
    gate: String(departure?.gate || arrival?.gate || "").trim().toUpperCase(),
    stand: "",
    date: String(item?.flight_date || getTodayDate()).slice(0, 10),
    imported: true,
  };
}

function toHHMM(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";

  const iso = raw.match(/T(\d{2}):(\d{2})/);
  if (iso) return `${iso[1]}:${iso[2]}`;

  const hhmm = raw.match(/^(\d{1,2}):(\d{2})$/);
  if (hhmm) {
    return `${String(Number(hhmm[1])).padStart(2, "0")}:${hhmm[2]}`;
  }

  return "";
}

function matchesTuiPolicy(flight) {
  const airline = String(flight?.airline || "").toUpperCase();
  const flightNumber = String(flight?.flightNumber || "").toUpperCase();
  return airline.includes("TUI") || flightNumber.startsWith("BY");
}

function normalizeAndFilter(items) {
  return (items || [])
    .map(normalizeFlight)
    .filter((flight) => matchesTuiPolicy(flight));
}

async function requestFlights(params) {
  const apiKey = getApiKey();
  const url = new URL(AVIATIONSTACK_BASE_URL);

  url.searchParams.set("access_key", apiKey);
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value) !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`AviationStack request failed: ${response.status}`);
  }

  const payload = await response.json();

  if (payload?.error?.info) {
    throw new Error(`AviationStack error: ${payload.error.info}`);
  }

  return Array.isArray(payload?.data) ? payload.data : [];
}

async function fetchWithCache(scope, requestParams, date = getTodayDate()) {
  const result = {
    loading: true,
    error: "",
    data: [],
    fromCache: false,
    cachedAt: null,
  };

  const cached = readCached(scope, date);

  try {
    if (typeof navigator !== "undefined" && !navigator.onLine && cached) {
      return {
        loading: false,
        error: "",
        data: cached.data,
        fromCache: true,
        cachedAt: cached.cachedAt,
      };
    }

    if (cached && isCacheFresh(cached)) {
      return {
        loading: false,
        error: "",
        data: cached.data,
        fromCache: true,
        cachedAt: cached.cachedAt,
      };
    }

    const rows = await requestFlights(requestParams);
    const filtered = normalizeAndFilter(rows);
    writeCached(scope, filtered, date);

    return {
      loading: false,
      error: "",
      data: filtered,
      fromCache: false,
      cachedAt: Date.now(),
    };
  } catch (error) {
    if (cached) {
      return {
        loading: false,
        error: `Live data unavailable. Showing cached flights. ${error?.message || ""}`.trim(),
        data: cached.data,
        fromCache: true,
        cachedAt: cached.cachedAt,
      };
    }

    return {
      ...result,
      loading: false,
      error: error?.message || "Failed to load AviationStack flights.",
      data: [],
    };
  }
}

export async function getDepartures() {
  return fetchWithCache("departures", {
    dep_iata: AIRPORT_IATA,
    flight_date: getTodayDate(),
  });
}

export async function getArrivals() {
  return fetchWithCache("arrivals", {
    arr_iata: AIRPORT_IATA,
    flight_date: getTodayDate(),
  });
}

export async function getTodayFlights() {
  const [departuresResult, arrivalsResult] = await Promise.all([
    getDepartures(),
    getArrivals(),
  ]);

  const merged = [...(departuresResult.data || []), ...(arrivalsResult.data || [])];
  const deduped = dedupeFlights(merged);

  return {
    loading: Boolean(departuresResult.loading || arrivalsResult.loading),
    error: [departuresResult.error, arrivalsResult.error].filter(Boolean).join(" | "),
    data: deduped,
    fromCache: Boolean(departuresResult.fromCache && arrivalsResult.fromCache),
    cachedAt: Math.max(Number(departuresResult.cachedAt || 0), Number(arrivalsResult.cachedAt || 0)) || null,
  };
}

export async function refreshFlights() {
  const date = getTodayDate();
  const [depRows, arrRows] = await Promise.all([
    requestFlights({ dep_iata: AIRPORT_IATA, flight_date: date }),
    requestFlights({ arr_iata: AIRPORT_IATA, flight_date: date }),
  ]);

  const depFlights = normalizeAndFilter(depRows);
  const arrFlights = normalizeAndFilter(arrRows);

  writeCached("departures", depFlights, date);
  writeCached("arrivals", arrFlights, date);

  return {
    loading: false,
    error: "",
    data: dedupeFlights([...depFlights, ...arrFlights]),
    fromCache: false,
    cachedAt: Date.now(),
  };
}

function dedupeFlights(flights) {
  const map = new Map();
  for (const flight of flights || []) {
    const key = [
      flight.flightNumber,
      flight.scheduledTime,
      flight.origin,
      flight.destination,
      flight.date,
    ]
      .map((value) => String(value || "").trim().toLowerCase())
      .join("|");

    if (!map.has(key)) {
      map.set(key, flight);
    }
  }
  return Array.from(map.values());
}
