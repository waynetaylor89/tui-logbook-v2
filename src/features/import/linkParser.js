const SUPPORTED_HOSTS = ["flightradar24.com", "aviationstack.com"];

export function parseFlightImportLink(input) {
  const raw = String(input || "").trim();
  if (!raw) {
    return {
      ok: false,
      error: "Paste a flight link to continue.",
      provider: "unknown",
      kind: "unsupported",
      metadata: {},
      normalizedUrl: "",
    };
  }

  let url;
  try {
    url = new URL(raw);
  } catch {
    return {
      ok: false,
      error: "That does not look like a valid URL.",
      provider: "unknown",
      kind: "unsupported",
      metadata: {},
      normalizedUrl: "",
    };
  }

  const hostname = url.hostname.replace(/^www\./i, "").toLowerCase();
  const normalizedUrl = url.toString();

  if (!SUPPORTED_HOSTS.some((host) => hostname.endsWith(host))) {
    return {
      ok: false,
      error: "Unsupported link. Use a FlightRadar24 or AviationStack URL.",
      provider: "unknown",
      kind: "unsupported",
      metadata: { hostname },
      normalizedUrl,
    };
  }

  if (hostname.endsWith("flightradar24.com")) {
    return parseFlightRadar24(url);
  }

  return {
    ok: true,
    error: "",
    provider: "aviationstack",
    kind: "aviationstack-link",
    metadata: {
      hostname,
      path: url.pathname,
      query: Object.fromEntries(url.searchParams.entries()),
    },
    normalizedUrl,
    preview: {
      title: "AviationStack link",
      description: "Link accepted. Provider-ready metadata extracted.",
      details: [
        `Host: ${hostname}`,
        `Path: ${url.pathname || "/"}`,
      ],
    },
  };
}

function parseFlightRadar24(url) {
  const hostname = url.hostname.replace(/^www\./i, "").toLowerCase();
  const segments = url.pathname.split("/").filter(Boolean);
  const query = Object.fromEntries(url.searchParams.entries());

  const airport = firstNonEmpty(
    query.airport,
    query.airportCode,
    query.iata,
    segments.find((part) => /^[a-z]{3,4}$/i.test(part))
  );

  const date = normalizeDate(
    query.date || query.day || query.fromDate || query.toDate || ""
  );

  const type = normalizeType(
    query.type || query.mode || query.flightType || segments.join("/")
  );

  const isAirportHistory = looksLikeAirportHistory({ segments, query, airport, type });

  if (!isAirportHistory) {
    return {
      ok: false,
      error: "Unsupported FlightRadar24 URL. Paste an airport history link (takeoffs/landings).",
      provider: "flightradar24",
      kind: "unsupported-fr24",
      metadata: { hostname, segments, query },
      normalizedUrl: url.toString(),
    };
  }

  return {
    ok: true,
    error: "",
    provider: "flightradar24",
    kind: "airport-history",
    metadata: {
      hostname,
      airport: airport ? airport.toUpperCase() : "Unknown",
      date: date || "Unknown",
      type,
      path: url.pathname,
      query,
    },
    normalizedUrl: url.toString(),
    preview: {
      title: "FlightRadar24 airport history",
      description: "Parsed link preview (no scraping/download performed).",
      details: [
        `Airport: ${(airport || "Unknown").toUpperCase()}`,
        `Date: ${date || "Unknown"}`,
        `Type: ${type}`,
      ],
    },
  };
}

function looksLikeAirportHistory({ segments, query, airport, type }) {
  const segmentText = segments.join("/").toLowerCase();
  const queryText = Object.entries(query)
    .map(([k, v]) => `${k}=${v}`)
    .join("&")
    .toLowerCase();

  const hasHistoryHint =
    /airport|history|arrivals|departures|landings|takeoffs/.test(segmentText) ||
    /airport|history|arrivals|departures|landings|takeoffs/.test(queryText);

  const hasData = Boolean(airport) || type !== "unknown";
  return hasHistoryHint || hasData;
}

function normalizeType(value) {
  const text = String(value || "").toLowerCase();
  if (/takeoff|departure|departures/.test(text)) return "takeoffs";
  if (/landing|arrival|arrivals/.test(text)) return "landings";
  return "unknown";
}

function normalizeDate(value) {
  const text = String(value || "").trim();
  if (!text) return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  if (/^\d{8}$/.test(text)) return `${text.slice(0, 4)}-${text.slice(4, 6)}-${text.slice(6, 8)}`;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(text)) {
    const [d, m, y] = text.split("/");
    return `${y}-${m}-${d}`;
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
