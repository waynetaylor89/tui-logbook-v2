import {
  analyzeFlightRadarRows,
  normalizeFlightRadarRows,
} from "../../providers/flightRadarProvider.js";

export function mapFlightRadarRows(rows, fileName = "") {
  const analysis = analyzeFlightRadarRows(rows, fileName);
  const flights = normalizeFlightRadarRows(rows);

  return {
    ...analysis,
    provider: analysis.detected ? "FlightRadar24" : "Generic",
    flights,
  };
}

export function filterFlightRadarPreview(flights, filters) {
  const query = String(filters?.query || "").trim().toLowerCase();
  const airlineMode = String(filters?.airlineMode || "TUIOnly");
  const movement = String(filters?.movement || "All");
  const status = String(filters?.status || "All");
  const sortByTime = Boolean(filters?.sortByTime);

  const filtered = (flights || []).filter((flight) => {
    const matchesMovement = movement === "All" || String(flight.type || flight.movement) === movement;
    const matchesStatus = status === "All" || String(flight.status || "") === status;
    const airline = String(flight.airline || "").toLowerCase();
    const flightNumber = String(flight.flightNumber || "").toLowerCase();
    const matchesAirline = airlineMode === "All"
      ? true
      : airline.includes("tui") || flightNumber.startsWith("by");
    const searchable = `${flight.flightNumber || ""} ${flight.airline || ""} ${flight.registration || ""} ${flight.aircraftType || ""} ${flight.origin || ""} ${flight.destination || ""}`.toLowerCase();
    const matchesSearch = query.length === 0 || searchable.includes(query);
    return matchesMovement && matchesStatus && matchesSearch && matchesAirline;
  });

  if (!sortByTime) {
    return filtered;
  }

  return [...filtered].sort((a, b) => toMinutes(a.scheduledTime) - toMinutes(b.scheduledTime));
}

function toMinutes(value) {
  const raw = String(value || "").trim();
  const parts = raw.match(/^(\d{1,2}):(\d{2})$/);
  if (!parts) return Number.MAX_SAFE_INTEGER;
  return Number(parts[1]) * 60 + Number(parts[2]);
}
