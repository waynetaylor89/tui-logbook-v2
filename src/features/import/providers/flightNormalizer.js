const HTML_COLUMN_ALIASES = {
  "flight": "flightNumber",
  "flight number": "flightNumber",
  "callsign": "flightNumber",
  "airline": "airline",
  "operator": "airline",
  "registration": "registration",
  "aircraft registration": "registration",
  "tail": "registration",
  "aircraft": "aircraftType",
  "aircraft type": "aircraftType",
  "type": "movement",
  "movement": "movement",
  "arrival/departure": "movement",
  "arrival departure": "movement",
  "from": "origin",
  "origin": "origin",
  "to": "destination",
  "destination": "destination",
  "scheduled": "scheduledTime",
  "scheduled time": "scheduledTime",
  "scheduled departure": "scheduledTime",
  "scheduled arrival": "scheduledTime",
  "estimated": "estimatedTime",
  "estimated time": "estimatedTime",
  "status": "status",
  "terminal": "terminal",
  "gate": "gate",
  "stand": "stand",
  "date": "date",
};

export function normalizeHtmlFlightRows(rows) {
  return (rows || [])
    .map((row) => normalizeRow(row))
    .filter((row) => {
      return Boolean(row.flightNumber || row.origin || row.destination || row.registration || row.scheduledTime);
    });
}

function normalizeRow(rawRow) {
  const normalized = {};

  Object.entries(rawRow || {}).forEach(([header, value]) => {
    const alias = HTML_COLUMN_ALIASES[normalizeToken(header)];
    if (!alias) return;
    normalized[alias] = String(value || "").trim();
  });

  const movement = normalizeMovement(normalized.movement || normalized.status || "");
  const registration = String(normalized.registration || "").trim().toUpperCase();

  return {
    flightNumber: String(normalized.flightNumber || "").trim().toUpperCase(),
    airline: String(normalized.airline || "").trim(),
    registration,
    aircraftRegistration: registration,
    aircraftType: String(normalized.aircraftType || "").trim(),
    aircraft: String(normalized.aircraftType || "").trim(),
    origin: String(normalized.origin || "").trim().toUpperCase(),
    destination: String(normalized.destination || "").trim().toUpperCase(),
    movement,
    type: movement,
    scheduledTime: normalizeTime(normalized.scheduledTime || ""),
    estimatedTime: normalizeTime(normalized.estimatedTime || ""),
    status: String(normalized.status || "Scheduled").trim(),
    terminal: String(normalized.terminal || "").trim().toUpperCase(),
    gate: String(normalized.gate || "").trim().toUpperCase(),
    stand: String(normalized.stand || "").trim().toUpperCase(),
    date: normalizeDate(normalized.date || ""),
  };
}

function normalizeToken(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

function normalizeMovement(value) {
  const input = String(value || "").trim().toLowerCase();
  if (input.startsWith("arr") || input.includes("land")) return "Arrival";
  if (input.startsWith("dep") || input.includes("takeoff")) return "Departure";
  return "Departure";
}

function normalizeTime(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";

  const hhmm = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (hhmm) {
    return `${String(Number(hhmm[1])).padStart(2, "0")}:${String(Number(hhmm[2])).padStart(2, "0")}`;
  }

  const twelve = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (twelve) {
    let hours = Number(twelve[1]);
    const minutes = Number(twelve[2]);
    const period = twelve[3].toUpperCase();
    if (hours === 12) hours = 0;
    if (period === "PM") hours += 12;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }

  const inText = trimmed.match(/(\d{1,2}):(\d{2})/);
  if (inText) {
    return `${String(Number(inText[1])).padStart(2, "0")}:${String(Number(inText[2])).padStart(2, "0")}`;
  }

  return "";
}

function normalizeDate(value) {
  const input = String(value || "").trim();
  if (!input) return new Date().toISOString().slice(0, 10);

  const iso = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return input;

  const uk = input.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (uk) {
    const day = String(Number(uk[1])).padStart(2, "0");
    const month = String(Number(uk[2])).padStart(2, "0");
    return `${uk[3]}-${month}-${day}`;
  }

  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }

  return parsed.toISOString().slice(0, 10);
}
