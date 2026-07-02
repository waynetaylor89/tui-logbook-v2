const REQUIRED_FIELDS = [
  "flightNumber",
  "origin",
  "destination",
  "scheduledTime",
];

const FR24_COLUMN_ALIASES = {
  "flight": "flightNumber",
  "flight number": "flightNumber",
  "flightnumber": "flightNumber",
  "callsign": "flightNumber",
  "airline": "airline",
  "operator": "airline",
  "airline name": "airline",
  "registration": "registration",
  "reg": "registration",
  "tail": "registration",
  "aircraft registration": "registration",
  "aircraft": "aircraftType",
  "aircraft type": "aircraftType",
  "aircrafttype": "aircraftType",
  "from": "origin",
  "origin": "origin",
  "departure airport": "origin",
  "to": "destination",
  "destination": "destination",
  "arrival airport": "destination",
  "scheduled": "scheduledTime",
  "scheduled time": "scheduledTime",
  "scheduled departure": "scheduledTime",
  "scheduled arrival": "scheduledTime",
  "estimated": "estimatedTime",
  "estimated time": "estimatedTime",
  "estimated departure": "estimatedTime",
  "estimated arrival": "estimatedTime",
  "actual": "actualTime",
  "actual time": "actualTime",
  "actual departure": "actualTime",
  "actual arrival": "actualTime",
  "status": "status",
  "state": "status",
  "terminal": "terminal",
  "gate": "gate",
  "stand": "stand",
  "date": "date",
  "departurearrival": "movement",
  "movement": "movement",
  "type": "movement",
};

const SUPPORTED_FR24_HINTS = [
  "flight number",
  "callsign",
  "aircraft type",
  "registration",
  "scheduled departure",
  "estimated departure",
  "actual departure",
  "status",
  "terminal",
  "gate",
  "stand",
  "date",
  "origin",
  "destination",
  "from",
  "to",
  "flightradar",
  "fr24",
];

export function analyzeFlightRadarRows(rows, fileName = "") {
  const headers = extractHeaders(rows);
  const headerTokens = headers.map(normalizeHeaderToken);
  const mappedColumns = buildMappedColumns(headers);

  const hitCount = headerTokens.filter((token) => SUPPORTED_FR24_HINTS.some((hint) => token.includes(hint))).length;
  const confidence = headers.length > 0 ? Math.min(1, hitCount / Math.max(4, headers.length * 0.6)) : 0;
  const fromName = /flightradar|fr24/i.test(String(fileName || ""));
  const detected = confidence >= 0.35 || fromName;

  return {
    detected,
    confidence,
    mappedColumns,
    headers,
  };
}

export function normalizeFlightRadarRows(rows) {
  return (rows || []).map((raw, index) => normalizeSingleRow(raw, index + 1));
}

export function validateMappedFlights(rows, existingFlights, createImportKey) {
  const existingKeys = new Set((existingFlights || []).map((flight) => createImportKey(flight)));
  const incomingKeys = new Set();

  const importedFlights = [];
  const duplicates = [];
  const errors = [];
  const rejectedRows = [];

  (rows || []).forEach((row, index) => {
    const rowNumber = index + 1;
    const rowErrors = validateNormalizedRow(row);

    if (rowErrors.length > 0) {
      errors.push({ row: rowNumber, messages: rowErrors });
      rejectedRows.push({ row: rowNumber, reason: rowErrors.join("; "), data: row });
      return;
    }

    const key = createImportKey(row);

    if (incomingKeys.has(key)) {
      duplicates.push({ row: rowNumber, source: "import", key, flight: row });
      rejectedRows.push({ row: rowNumber, reason: "Duplicate within import file", data: row });
      return;
    }

    incomingKeys.add(key);

    if (existingKeys.has(key)) {
      duplicates.push({ row: rowNumber, source: "existing", key, flight: row });
      return;
    }

    importedFlights.push(row);
  });

  return {
    importedFlights,
    duplicates,
    errors,
    rejectedRows,
  };
}

function normalizeSingleRow(rawRow, rowNumber) {
  const normalized = {};

  Object.entries(rawRow || {}).forEach(([rawKey, rawValue]) => {
    const token = normalizeHeaderToken(rawKey);
    const mapped = FR24_COLUMN_ALIASES[token];
    if (!mapped) return;
    normalized[mapped] = String(rawValue ?? "").trim();
  });

  const movement = normalizeMovement(
    normalized.movement ||
      normalized.status ||
      deriveMovementFromRoute(normalized.origin, normalized.destination)
  );

  const flightNumber = String(normalized.flightNumber || "").trim().toUpperCase();
  const registration = String(normalized.registration || "").trim().toUpperCase();

  return {
    id: `fr24-${Date.now()}-${rowNumber}-${Math.random().toString(36).slice(2, 7)}`,
    flightNumber,
    airline: String(normalized.airline || "").trim(),
    registration,
    aircraftRegistration: registration,
    aircraftType: String(normalized.aircraftType || "").trim(),
    aircraft: String(normalized.aircraftType || "").trim(),
    origin: String(normalized.origin || "").trim().toUpperCase(),
    destination: String(normalized.destination || "").trim().toUpperCase(),
    scheduledTime: normalizeTime(normalized.scheduledTime || ""),
    estimatedTime: normalizeTime(normalized.estimatedTime || ""),
    actualTime: normalizeTime(normalized.actualTime || ""),
    status: String(normalized.status || "Scheduled").trim(),
    terminal: String(normalized.terminal || "").trim().toUpperCase(),
    gate: String(normalized.gate || "").trim().toUpperCase(),
    stand: String(normalized.stand || "").trim().toUpperCase(),
    movement,
    type: movement,
    date: normalizeDate(normalized.date || ""),
    imported: true,
    completed: false,
    claimed: false,
  };
}

function validateNormalizedRow(row) {
  const messages = [];

  REQUIRED_FIELDS.forEach((field) => {
    if (!String(row[field] || "").trim()) {
      messages.push(`Missing ${field}`);
    }
  });

  if (row.scheduledTime && !/^([01]\d|2[0-3]):[0-5]\d$/.test(row.scheduledTime)) {
    messages.push("scheduledTime must be HH:mm");
  }

  if (row.estimatedTime && !/^([01]\d|2[0-3]):[0-5]\d$/.test(row.estimatedTime)) {
    messages.push("estimatedTime must be HH:mm");
  }

  if (row.actualTime && !/^([01]\d|2[0-3]):[0-5]\d$/.test(row.actualTime)) {
    messages.push("actualTime must be HH:mm");
  }

  return messages;
}

function buildMappedColumns(headers) {
  return headers
    .map((header) => {
      const token = normalizeHeaderToken(header);
      const mapped = FR24_COLUMN_ALIASES[token];
      if (!mapped) return null;
      return { source: header, target: mapped };
    })
    .filter(Boolean);
}

function extractHeaders(rows) {
  const first = rows?.[0];
  if (!first || typeof first !== "object") return [];
  return Object.keys(first);
}

function normalizeHeaderToken(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

function normalizeMovement(value) {
  const input = String(value || "").trim().toLowerCase();
  if (input.startsWith("arr")) return "Arrival";
  if (input.startsWith("dep")) return "Departure";
  if (input.includes("land")) return "Arrival";
  if (input.includes("depart") || input.includes("takeoff")) return "Departure";
  return "Departure";
}

function deriveMovementFromRoute(origin, destination) {
  if (!origin || !destination) return "Departure";
  return "Departure";
}

function normalizeTime(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";

  const isoMatch = trimmed.match(/T(\d{2}):(\d{2})/);
  if (isoMatch) {
    return `${isoMatch[1]}:${isoMatch[2]}`;
  }

  const twelveHour = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (twelveHour) {
    let hours = Number(twelveHour[1]);
    const minutes = Number(twelveHour[2]);
    const period = twelveHour[3].toUpperCase();
    if (hours === 12) hours = 0;
    if (period === "PM") hours += 12;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }

  const twentyFour = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (twentyFour) {
    return `${String(Number(twentyFour[1])).padStart(2, "0")}:${String(Number(twentyFour[2])).padStart(2, "0")}`;
  }

  return trimmed;
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
  if (Number.isNaN(parsed.getTime())) return new Date().toISOString().slice(0, 10);
  return parsed.toISOString().slice(0, 10);
}
