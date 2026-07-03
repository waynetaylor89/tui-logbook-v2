/**
 * FlightRadar24 provider for the TUI Flight Feed Service.
 *
 * Reuses the existing FlightRadar24 import infrastructure to read
 * previously imported FR24 flight data from the store.
 *
 * The store's `flights` array contains flights imported via the
 * FlightRadar24 file upload workflow.  This provider filters for
 * flights that have `imported: true` and normalises them into the
 * canonical flight feed shape.
 */

export function getFr24ImportedFlights(allFlights = []) {
  if (!Array.isArray(allFlights) || allFlights.length === 0) return null;

  const today = new Date().toISOString().slice(0, 10);

  const imported = allFlights
    .filter((f) => Boolean(f.imported))
    .filter((f) => (f.date || today) === today)
    .filter((f) => isTuiFlight(f));

  if (imported.length === 0) return null;

  return imported.map((flight) => normalizeFr24Flight(flight));
}

function normalizeFr24Flight(flight) {
  const direction = normalizeDirection(flight.movement || flight.type || flight.arrivalDeparture || "");
  const scheduledTime = normalizeTime(flight.scheduledTime || flight.time || "");
  const actualTime = normalizeTime(flight.actualTime || "");
  const registration = String(
    flight.registration || flight.aircraftRegistration || ""
  )
    .trim()
    .toUpperCase();

  return {
    id: flight.id || `fr24-imported-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    flightNumber: String(flight.flightNumber || "").trim().toUpperCase(),
    registration,
    aircraftType: String(flight.aircraftType || flight.aircraft || "").trim(),
    origin: String(flight.origin || "").trim().toUpperCase(),
    destination: String(flight.destination || "").trim().toUpperCase(),
    scheduledTime,
    actualTime,
    status: String(flight.status || "Scheduled").trim(),
    terminal: String(flight.terminal || "").trim().toUpperCase(),
    gate: String(flight.gate || "").trim().toUpperCase(),
    stand: String(flight.stand || "").trim().toUpperCase(),
    direction,
    source: "FR24 IMPORT",
    timestamp: new Date().toISOString(),
  };
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
    return `${String(Number(twentyFour[1])).padStart(2, "0")}:${String(
      Number(twentyFour[2])
    ).padStart(2, "0")}`;
  }

  return raw;
}

function isTuiFlight(flight) {
  const airline = String(flight.airline || "").toUpperCase();
  const flightNumber = String(flight.flightNumber || "").toUpperCase();
  return airline.includes("TUI") || flightNumber.startsWith("BY");
}
