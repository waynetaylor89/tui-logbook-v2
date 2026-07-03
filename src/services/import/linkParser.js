export const IMPORT_HISTORY_STORAGE_KEY = "ops-import-history-v2";
export const IMPORT_LAST_STATUS_STORAGE_KEY = "ops-import-last-status-v2";

const PROVIDER_PARSERS = {
  flightradar24: {
    matches: (host) => host.endsWith("flightradar24.com"),
    parse: parseFlightRadar24,
  },
  aviationstack: {
    matches: (host) => host === "api.aviationstack.com" || host.endsWith("aviationstack.com"),
    parse: parseAviationStack,
  },
};

export function parseFlightImportLink(input) {
  const raw = String(input || "").trim();
  if (!raw) {
    return unsupported("Paste a flight link to continue.", { reason: "empty" });
  }

  let url;
  try {
    url = new URL(raw);
  } catch {
    return unsupported("That does not look like a valid URL.", { reason: "invalid-url", originalUrl: raw });
  }

  const protocol = String(url.protocol || "").toLowerCase();
  if (protocol !== "https:" && protocol !== "http:") {
    return unsupported("Unsupported protocol. Use an HTTPS link.", {
      reason: "invalid-protocol",
      originalUrl: raw,
      protocol,
    });
  }

  const host = normalizeHost(url.hostname);
  const parser = Object.values(PROVIDER_PARSERS).find((provider) => provider.matches(host));

  if (!parser) {
    return unsupported("Unsupported link. Use FlightRadar24 or AviationStack URLs.", {
      reason: "unsupported-host",
      host,
      originalUrl: raw,
    });
  }

  return parser.parse(url, raw);
}

export function readImportHistory() {
  if (!hasStorage()) return [];
  try {
    const raw = window.localStorage.getItem(IMPORT_HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, 20) : [];
  } catch {
    return [];
  }
}

export function addImportHistory(item, maxItems = 20) {
  const existing = readImportHistory();
  const entry = {
    id: item?.id || `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    importedAt: item?.importedAt || new Date().toISOString(),
    ...item,
  };

  const deduped = [
    entry,
    ...existing.filter((row) => {
      return !(
        row.url === entry.url &&
        row.provider === entry.provider &&
        row.kind === entry.kind
      );
    }),
  ].slice(0, maxItems);

  saveImportHistory(deduped);
  return deduped;
}

export function deleteImportHistory(id) {
  const next = readImportHistory().filter((item) => item.id !== id);
  saveImportHistory(next);
  return next;
}

export function clearImportHistory() {
  if (!hasStorage()) return [];
  window.localStorage.removeItem(IMPORT_HISTORY_STORAGE_KEY);
  return [];
}

export function readLastImportStatus() {
  if (!hasStorage()) return null;
  try {
    const raw = window.localStorage.getItem(IMPORT_LAST_STATUS_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function writeLastImportStatus(status) {
  if (!hasStorage()) return;
  window.localStorage.setItem(IMPORT_LAST_STATUS_STORAGE_KEY, JSON.stringify(status || null));
}

function parseFlightRadar24(url, originalUrl) {
  const queryParameters = Object.fromEntries(url.searchParams.entries());
  const pathSegments = url.pathname
    .split("/")
    .filter(Boolean)
    .map((segment) => decodeURIComponent(segment));

  const airport = findAirport(pathSegments, queryParameters) || "Unknown";
  const date = normalizeDate(findDate(pathSegments, queryParameters)) || "Unknown";
  const type = normalizeType(findType(pathSegments, queryParameters));

  return {
    ok: true,
    provider: "flightradar24",
    kind: "airport-history",
    originalUrl,
    normalizedUrl: url.toString(),
    parsed: {
      airport,
      date,
      type,
      queryParameters,
      pathSegments,
    },
    preview: {
      title: "FlightRadar24 Link",
      airport,
      date,
      type,
      originalUrl,
      queryParameters,
    },
  };
}

function parseAviationStack(url, originalUrl) {
  const queryParameters = Object.fromEntries(url.searchParams.entries());
  const endpoint = url.pathname || "/";
  const host = normalizeHost(url.hostname);

  return {
    ok: true,
    provider: "aviationstack",
    kind: "endpoint",
    originalUrl,
    normalizedUrl: url.toString(),
    parsed: {
      host,
      endpoint,
      queryParameters,
    },
    preview: {
      title: "AviationStack Endpoint Preview",
      endpoint,
      originalUrl,
      queryParameters,
    },
  };
}

function unsupported(error, extra = {}) {
  return {
    ok: false,
    provider: "unknown",
    kind: "unsupported",
    originalUrl: String(extra?.originalUrl || ""),
    normalizedUrl: "",
    error,
    parsed: { ...extra },
    preview: null,
  };
}

function normalizeHost(host) {
  return String(host || "").replace(/^www\./i, "").toLowerCase();
}

function hasStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function saveImportHistory(items) {
  if (!hasStorage()) return;
  window.localStorage.setItem(IMPORT_HISTORY_STORAGE_KEY, JSON.stringify((items || []).slice(0, 20)));
}

function findAirport(pathSegments, queryParameters) {
  const fromQuery = firstNonEmpty(
    queryParameters.airport,
    queryParameters.airportCode,
    queryParameters.airportcode,
    queryParameters.iata,
    queryParameters.icao
  );

  if (fromQuery) return String(fromQuery).toUpperCase();

  const airportIndex = pathSegments.findIndex((segment) => segment.toLowerCase() === "airport");
  if (airportIndex >= 0 && pathSegments[airportIndex + 1]) {
    return String(pathSegments[airportIndex + 1]).toUpperCase();
  }

  const token = pathSegments.find((segment) => /^[a-z]{3,4}$/i.test(segment));
  return token ? String(token).toUpperCase() : "";
}

function findDate(pathSegments, queryParameters) {
  const fromQuery = firstNonEmpty(
    queryParameters.date,
    queryParameters.day,
    queryParameters.from,
    queryParameters.to,
    queryParameters.fromDate,
    queryParameters.toDate
  );
  if (fromQuery) return fromQuery;

  return firstNonEmpty(
    pathSegments.find((segment) => /^\d{4}-\d{2}-\d{2}$/.test(segment)),
    pathSegments.find((segment) => /^\d{8}$/.test(segment))
  );
}

function findType(pathSegments, queryParameters) {
  return firstNonEmpty(
    queryParameters.type,
    queryParameters.mode,
    queryParameters.flightType,
    pathSegments.find((segment) => /takeoff|landing|departure|arrival/i.test(segment))
  );
}

function normalizeType(value) {
  const text = String(value || "").toLowerCase();
  if (/takeoff|departure/.test(text)) return "takeoffs";
  if (/landing|arrival/.test(text)) return "landings";
  return "unknown";
}

function normalizeDate(value) {
  const text = String(value || "").trim();
  if (!text) return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  if (/^\d{8}$/.test(text)) {
    return `${text.slice(0, 4)}-${text.slice(4, 6)}-${text.slice(6, 8)}`;
  }

  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
}

function firstNonEmpty(...values) {
  for (const value of values) {
    const text = String(value || "").trim();
    if (text) return text;
  }
  return "";
}
