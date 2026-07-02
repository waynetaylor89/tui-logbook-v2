import { flightImportKey } from "../../../../store/slices/flightsSlice.js";
import { validateMappedFlights } from "../../providers/flightRadarProvider.js";
import { parseFlightRadarFile } from "./flightRadarParser.js";
import { mapFlightRadarRows } from "./flightRadarMapper.js";

export async function createFlightRadarPreview(file, existingFlights) {
  const parsed = await parseFlightRadarFile(file);
  const mapped = mapFlightRadarRows(parsed.rows, parsed.fileName);
  const validation = validateMappedFlights(mapped.flights, existingFlights || [], flightImportKey);
  const detectedFlightRadar = Boolean(mapped.detected || parsed.detectedFlightRadarHint);
  const detectionConfidence = Math.max(
    Number(mapped.confidence || 0),
    Number(parsed.detectedFlightRadarConfidence || 0)
  );

  return {
    fileName: parsed.fileName,
    sourceFormat: parsed.sourceFormat,
    provider: detectedFlightRadar ? "FlightRadar24" : mapped.provider,
    detectedFlightRadar,
    detectionConfidence,
    mappedColumns: mapped.mappedColumns,
    parsedRows: parsed.rows.length,
    flightsFound: mapped.flights.length,
    flights: mapped.flights,
    importedFlights: validation.importedFlights,
    duplicates: validation.duplicates,
    errors: validation.errors,
    rejectedRows: validation.rejectedRows,
  };
}

export function commitFlightRadarImport({
  preview,
  importDailySchedule,
  addFlightRadarImportHistory,
}) {
  const duplicateFlightsToInclude = (preview.duplicates || [])
    .filter((item) => item.source === "existing")
    .map((item) => item.flight);

  const incomingFlights = [...(preview.importedFlights || []), ...duplicateFlightsToInclude];

  const result = importDailySchedule(incomingFlights, {
    replaceToday: true,
    summary: {
      flightsImported: incomingFlights.length,
      duplicates: (preview.duplicates || []).length,
      errors: (preview.errors || []).length,
      rejectedRows: (preview.rejectedRows || []).length,
    },
  });

  const historyEntry = addFlightRadarImportHistory({
    fileName: preview.fileName,
    sourceFormat: preview.sourceFormat,
    provider: preview.provider,
    detectedFlightRadar: preview.detectedFlightRadar,
    detectionConfidence: preview.detectionConfidence,
    parsedRows: preview.parsedRows,
    flightsImported: result.flightsImported,
    flightsUpdated: result?.summary?.mergedUpdates || 0,
    duplicates: (preview.duplicates || []).length,
    errors: (preview.errors || []).length,
    rejectedRows: (preview.rejectedRows || []).length,
    overwriteDuplicates: false,
    mappedColumns: preview.mappedColumns,
  });

  return {
    historyEntry,
    summary: {
      importId: historyEntry.id,
      fileName: preview.fileName,
      sourceFormat: preview.sourceFormat,
      provider: preview.provider,
      detectedFlightRadar: preview.detectedFlightRadar,
      detectionConfidence: preview.detectionConfidence,
      mappedColumns: preview.mappedColumns,
      parsedRows: preview.parsedRows,
      flightsFound: preview.flightsFound || preview.flights?.length || 0,
      flightsImported: result.flightsImported,
      flightsUpdated: result?.summary?.mergedUpdates || 0,
      duplicates: (preview.duplicates || []).length,
      errors: (preview.errors || []).length,
      rejectedRows: (preview.rejectedRows || []).length,
      replaceToday: true,
      errorMessages: (preview.errors || []).slice(0, 8).map((item) => `Row ${item.row}: ${item.messages.join(", ")}`),
    },
  };
}
