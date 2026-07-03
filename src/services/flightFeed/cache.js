const CACHE_KEY = "tui-flight-feed";
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

export function getCachedFlights() {
  if (typeof window === "undefined" || !window.localStorage) return null;

  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    const entry = JSON.parse(raw);
    if (!entry || !Array.isArray(entry.flights)) return null;
    if (!entry.cachedAt) return null;

    return entry;
  } catch {
    return null;
  }
}

export function getValidCachedFlights() {
  const cached = getCachedFlights();
  if (!cached) return null;

  const age = Date.now() - cached.cachedAt;
  if (age > CACHE_TTL_MS) return null;

  return cached.flights;
}

export function saveCachedFlights(flights, source = "") {
  if (typeof window === "undefined" || !window.localStorage) return;

  const entry = {
    cachedAt: Date.now(),
    source: String(source || "").trim() || "import",
    flights: Array.isArray(flights) ? flights : [],
  };

  window.localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
}

export function getCacheAge() {
  const cached = getCachedFlights();
  if (!cached) return null;

  return Date.now() - cached.cachedAt;
}

export function getCacheSource() {
  const cached = getCachedFlights();
  if (!cached) return "";

  return cached.source || "";
}

export function clearCache() {
  if (typeof window === "undefined" || !window.localStorage) return;
  window.localStorage.removeItem(CACHE_KEY);
}

export function getCacheTimestamp() {
  const cached = getCachedFlights();
  if (!cached) return null;
  return cached.cachedAt;
}
