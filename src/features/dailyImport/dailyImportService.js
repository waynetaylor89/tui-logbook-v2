import Papa from "papaparse";
import * as XLSX from "xlsx";
import { flightImportKey } from "../../store/slices/flightsSlice.js";
import { isTuiFlight } from "../../utils/airlines.js";

const HEADER_MAP = {
  flightnumber: "flightNumber",
  flightno: "flightNumber",
  flight: "flightNumber",
  flt: "flightNumber",
  airline: "airline",
  operator: "airline",
  carrier: "airline",
  registration: "registration",
  aircraftregistration: "registration",
  reg: "registration",
  aircrafttype: "aircraftType",
  aircraft: "aircraftType",
  type: "aircraftType",
  movement: "movement",
  direction: "movement",
  arrivaldeparture: "movement",
  origin: "origin",
  from: "origin",
  destination: "destination",
  to: "destination",
  scheduledtime: "scheduledTime",
  schedtime: "scheduledTime",
  time: "scheduledTime",
  estimatedtime: "estimatedTime",
  etime: "estimatedTime",
  stand: "stand",
  gate: "gate",
  status: "status",
  date: "date",
};

export async function parseDailyImportFile(file) {
  const ext = file.name.split(".").pop().toLowerCase();

  if (ext === "csv") return parseCsv(file);
  if (ext === "xlsx" || ext === "xls") return parseXlsx(file);
  if (ext === "json") return parseJson(file);

  throw new Error("Unsupported file format. Please use CSV, XLSX, or JSON.");
}

export function buildDailyImportPayload(rawRows, existingFlights = [], options = {}) {
  const today = options.date || new Date().toISOString().slice(0, 10);
  const normalizedRows = [];
  const errors = [];

  rawRows.forEach((row, index) => {
    const normalized = normalizeRow(row, today);
    const rowErrors = validateRow(normalized);

    if (rowErrors.length > 0) {
      errors.push(`Row ${index + 1}: ${rowErrors.join(", ")}`);
      return;
    }

    if (!isTuiFlight(normalized)) {
      return;
    }

    const movement = detectMovement(normalized);
    if (!movement) {
      errors.push(`Row ${index + 1}: Could not detect Arrival/Departure`);
      return;
    }

    normalizedRows.push({
      ...normalized,
      movement,
      type: movement,
      claimed: false,
      completed: false,
      imported: true,
    });
  });

  const deduped = [];
  const seen = new Set();
  let duplicateCount = 0;

  for (const flight of normalizedRows) {
    const key = flightImportKey(flight);
    if (seen.has(key)) {
      duplicateCount += 1;
      continue;
    }
    seen.add(key);
    deduped.push(flight);
  }

  const existingKeys = new Set(existingFlights.map((flight) => flightImportKey(flight)));
  const candidateFlights = [];

  for (const flight of deduped) {
    const key = flightImportKey(flight);
    if (existingKeys.has(key)) {
      duplicateCount += 1;
      continue;
    }
    candidateFlights.push(flight);
  }

  const arrivals = candidateFlights.filter((f) => f.movement === "Arrival").length;
  const departures = candidateFlights.filter((f) => f.movement === "Departure").length;

  return {
    flights: candidateFlights,
    summary: {
      flightsImported: candidateFlights.length,
      arrivals,
      departures,
      duplicates: duplicateCount,
      errors: errors.length,
      importTime: new Date().toISOString(),
    },
    errors,
  };
}

function parseCsv(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => resolve(result.data || []),
      error: (error) => reject(error),
    });
  });
}

async function parseXlsx(file) {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(firstSheet, { defval: "" });
}

async function parseJson(file) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  if (Array.isArray(parsed)) return parsed;
  if (Array.isArray(parsed?.flights)) return parsed.flights;
  throw new Error("JSON must contain an array or { flights: [] }.");
}

function normalizeRow(rawRow, today) {
  const base = {};

  Object.entries(rawRow || {}).forEach(([key, value]) => {
    const normalizedKey = String(key || "").toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "");
    const mapped = HEADER_MAP[normalizedKey];
    if (mapped) {
      base[mapped] = String(value ?? "").trim();
    }
  });

  return {
    id: `daily-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    flightNumber: base.flightNumber || "",
    airline: base.airline || inferAirline(base.flightNumber),
    registration: base.registration || "",
    aircraftType: base.aircraftType || "",
    aircraft: base.aircraftType || "",
    origin: base.origin || "",
    destination: base.destination || "",
    scheduledTime: normalizeTime(base.scheduledTime || ""),
    estimatedTime: normalizeTime(base.estimatedTime || ""),
    stand: base.stand || "",
    gate: base.gate || "",
    status: base.status || "Scheduled",
    date: base.date || today,
    movement: base.movement || "",
    type: base.movement || "",
  };
}

function validateRow(row) {
  const issues = [];

  if (!row.flightNumber) issues.push("Missing Flight Number");
  if (!row.scheduledTime) issues.push("Missing Scheduled Time");
  if (!row.origin && !row.destination) issues.push("Missing Origin/Destination");

  if (row.scheduledTime && !/^([01]\d|2[0-3]):[0-5]\d$/.test(row.scheduledTime)) {
    issues.push("Scheduled Time must be HH:mm");
  }

  if (row.estimatedTime && !/^([01]\d|2[0-3]):[0-5]\d$/.test(row.estimatedTime)) {
    issues.push("Estimated Time must be HH:mm");
  }

  return issues;
}

function detectMovement(row) {
  const explicit = String(row.movement || row.type || "").toLowerCase();
  if (explicit.startsWith("arr")) return "Arrival";
  if (explicit.startsWith("dep")) return "Departure";

  const origin = String(row.origin || "").toLowerCase();
  const destination = String(row.destination || "").toLowerCase();

  if (destination.includes("man") || destination.includes("manchester")) return "Arrival";
  if (origin.includes("man") || origin.includes("manchester")) return "Departure";

  return "";
}

function normalizeTime(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";

  const twelve = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (twelve) {
    let hours = Number(twelve[1]);
    const minutes = Number(twelve[2]);
    const period = twelve[3].toUpperCase();

    if (hours === 12) hours = 0;
    if (period === "PM") hours += 12;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }

  const twentyFour = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (twentyFour) {
    return `${String(Number(twentyFour[1])).padStart(2, "0")}:${String(Number(twentyFour[2])).padStart(2, "0")}`;
  }

  return "";
}

function inferAirline(flightNumber) {
  const value = String(flightNumber || "").toUpperCase();
  if (/^(BY|TOM|TUI)\d+/.test(value)) return "TUI Airways";
  return "";
}
