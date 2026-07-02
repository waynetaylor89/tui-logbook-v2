import { flightImportKey } from "../../../store/slices/flightsSlice.js";
import { parseCsvFile } from "../providers/csvProvider.js";
import { parseJsonFile } from "../providers/jsonProvider.js";
import { parseExcelFile } from "../providers/excelProvider.js";
import {
  analyzeFlightRadarRows,
  normalizeFlightRadarRows,
  validateMappedFlights,
} from "../providers/flightRadarProvider.js";

export async function parseImportFile(file) {
  const extension = getExtension(file.name);
  let rows = [];

  if (extension === "csv") {
    rows = await parseCsvFile(file);
  } else if (extension === "xlsx" || extension === "xls") {
    rows = await parseExcelFile(file);
  } else if (extension === "json") {
    rows = await parseJsonFile(file);
  } else {
    throw new Error("Unsupported format. Use CSV, XLSX, or JSON.");
  }

  const analysis = analyzeFlightRadarRows(rows, file?.name || "");
  const normalizedRows = normalizeFlightRadarRows(rows);

  return {
    sourceFormat: extension,
    provider: analysis.detected ? "FlightRadar24" : "Generic",
    detectedFlightRadar: analysis.detected,
    detectionConfidence: analysis.confidence,
    mappedColumns: analysis.mappedColumns,
    rawRowCount: rows.length,
    rows: normalizedRows,
  };
}

export function validateFlights(parsedImport, existingFlights = []) {
  const parsed = Array.isArray(parsedImport)
    ? {
        rows: parsedImport,
        sourceFormat: "unknown",
        provider: "Generic",
        detectedFlightRadar: false,
        detectionConfidence: 0,
        mappedColumns: [],
        rawRowCount: parsedImport.length,
      }
    : parsedImport;

  const validation = validateMappedFlights(parsed.rows || [], existingFlights, flightImportKey);

  return {
    ...validation,
    sourceFormat: parsed.sourceFormat,
    provider: parsed.provider,
    detectedFlightRadar: parsed.detectedFlightRadar,
    detectionConfidence: parsed.detectionConfidence,
    mappedColumns: parsed.mappedColumns || [],
    parsedRows: parsed.rawRowCount || (parsed.rows || []).length,
  };
}

function getExtension(filename) {
  return String(filename || "").split(".").pop().toLowerCase();
}
