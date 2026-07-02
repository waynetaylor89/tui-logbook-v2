const DEFAULT_AIRLINES = [
  "TUI Airways",
  "Jet2",
  "easyJet",
  "Ryanair",
  "British Airways",
  "Virgin Atlantic",
];

const PREFIX_TO_AIRLINE = {
  TOM: "TUI Airways",
  BY: "TUI Airways",
  EXS: "Jet2",
  LS: "Jet2",
  EZY: "easyJet",
  U2: "easyJet",
  RYR: "Ryanair",
  FR: "Ryanair",
  BAW: "British Airways",
  BA: "British Airways",
  VIR: "Virgin Atlantic",
  VS: "Virgin Atlantic",
};

function normalizeFlightNumber(flight) {
  return String(flight?.flightNumber || "").trim().toUpperCase();
}

function normalizeAirlineText(flight) {
  const directAirline = String(flight?.airline || "").trim();
  const nestedAirlineName = String(flight?.airline?.name || "").trim();
  const airlineName = String(flight?.airlineName || "").trim();
  return `${directAirline} ${nestedAirlineName} ${airlineName}`.trim().toUpperCase();
}

export function isTuiFlight(flight) {
  const flightNumber = normalizeFlightNumber(flight);
  const airlineText = normalizeAirlineText(flight);
  return flightNumber.startsWith("BY") || airlineText.includes("TUI");
}

export function detectAirlineFromFlight(flight) {
  const explicit = String(flight?.airline || "").trim();
  if (explicit) {
    if (String(explicit).toUpperCase().includes("TUI")) {
      return "TUI Airways";
    }
    return explicit;
  }

  const flightNumber = normalizeFlightNumber(flight);
  const prefix = flightNumber.replace(/[^A-Z]/g, "").slice(0, 3);
  if (prefix && PREFIX_TO_AIRLINE[prefix]) {
    return PREFIX_TO_AIRLINE[prefix];
  }

  const shortPrefix = flightNumber.replace(/[^A-Z]/g, "").slice(0, 2);
  if (shortPrefix && PREFIX_TO_AIRLINE[shortPrefix]) {
    return PREFIX_TO_AIRLINE[shortPrefix];
  }

  return "";
}

export function getDetectedAirlines(flights = []) {
  const detected = new Set(DEFAULT_AIRLINES);

  (flights || []).forEach((flight) => {
    const airline = detectAirlineFromFlight(flight);
    if (airline) detected.add(airline);
  });

  return Array.from(detected).sort((a, b) => a.localeCompare(b));
}

export function matchAirline(flight, selectedAirline) {
  if (!selectedAirline || selectedAirline === "All Airlines") return true;
  if (selectedAirline === "TUI Airways") return isTuiFlight(flight);
  return detectAirlineFromFlight(flight) === selectedAirline;
}

export function withDetectedAirline(flight) {
  return {
    ...flight,
    airline: detectAirlineFromFlight(flight),
  };
}
