import defaultFlights from "../../../features/flights/data/mockFlights.json" with { type: "json" };

export function getMockFlights() {
  const today = new Date().toISOString().slice(0, 10);

  return (defaultFlights || []).map((flight) => ({
    id: flight.id || `mock-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    flightNumber: String(flight.flightNumber || "").trim().toUpperCase(),
    registration: String(flight.aircraftRegistration || "").trim().toUpperCase(),
    aircraftType: String(flight.aircraftType || "").trim(),
    origin: String(flight.origin || "").trim(),
    destination: String(flight.destination || "").trim(),
    scheduledTime: normalizeTime(flight.scheduledTime || ""),
    actualTime: normalizeTime(flight.actualTime || ""),
    status: String(flight.status || "Scheduled").trim(),
    terminal: String(flight.terminal || "").trim().toUpperCase(),
    gate: String(flight.gate || "").trim().toUpperCase(),
    stand: String(flight.stand || "").trim().toUpperCase(),
    direction: normalizeDirection(flight.movement || flight.type || ""),
    source: "MOCK",
    timestamp: new Date().toISOString(),
    date: today,
  }));
}

function normalizeDirection(value) {
  const v = String(value || "").toLowerCase();
  if (v.startsWith("arr") || v.startsWith("land")) return "Arrival";
  if (v.startsWith("dep") || v.startsWith("take")) return "Departure";
  return "Departure";
}

function normalizeTime(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";

  const iso = raw.match(/T(\d{2}):(\d{2})/);
  if (iso) return `${iso[1]}:${iso[2]}`;

  const twelve = raw.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (twelve) {
    let h = Number(twelve[1]);
    const m = Number(twelve[2]);
    const p = twelve[3].toUpperCase();
    if (h === 12) h = 0;
    if (p === "PM") h += 12;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }

  const twentyFour = raw.match(/^(\d{1,2}):(\d{2})$/);
  if (twentyFour) {
    return `${String(Number(twentyFour[1])).padStart(2, "0")}:${String(Number(twentyFour[2])).padStart(2, "0")}`;
  }

  return raw;
}
