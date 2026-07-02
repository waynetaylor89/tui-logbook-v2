import { useMemo, useState } from "react";
import useLogbookStore from "../../../store/useLogbookStore.js";
import ImportButton from "./ImportButton.jsx";
import ImportSummary from "./ImportSummary.jsx";
import { parseImportFile, validateFlights } from "../services/flightImportService.js";

export default function FlightImporter() {
  const { flights, importFlights, fr24ImportHistory, addFlightRadarImportHistory } = useLogbookStore();

  const [isImporting, setIsImporting] = useState(false);
  const [summary, setSummary] = useState(null);
  const [pending, setPending] = useState(null);
  const [overwriteDuplicates, setOverwriteDuplicates] = useState(false);

  const existingCount = useMemo(() => (flights || []).length, [flights]);

  const handleFileSelected = async (file) => {
    setIsImporting(true);
    setSummary(null);
    setPending(null);

    try {
      const parsed = await parseImportFile(file);
      const validation = validateFlights(parsed, flights || []);

      const pendingState = {
        fileName: file?.name || "",
        ...validation,
      };

      setPending(pendingState);

      if (validation.duplicates.length > 0 && !overwriteDuplicates) {
        setSummary({
          fileName: pendingState.fileName,
          sourceFormat: pendingState.sourceFormat,
          provider: pendingState.provider,
          detectedFlightRadar: pendingState.detectedFlightRadar,
          detectionConfidence: pendingState.detectionConfidence,
          mappedColumns: pendingState.mappedColumns,
          parsedRows: pendingState.parsedRows,
          flightsImported: validation.importedFlights.length,
          duplicates: validation.duplicates.length,
          errors: validation.errors.length,
          rejectedRows: validation.rejectedRows.length,
          errorMessages: ["Duplicates detected. Enable overwrite and confirm import to replace existing flights."],
        });
        return;
      }

      await commitImport(pendingState, overwriteDuplicates);
    } catch (error) {
      setSummary({
        flightsImported: 0,
        duplicates: 0,
        errors: 1,
        rejectedRows: 0,
        errorMessages: [error.message || "Import failed."],
      });
    } finally {
      setIsImporting(false);
    }
  };

  const commitImport = async (state = pending, overwrite = overwriteDuplicates) => {
    if (!state) return;

    if (overwrite && state.duplicates.length > 0) {
      const confirmed = window.confirm(`Overwrite ${state.duplicates.length} duplicate flights?`);
      if (!confirmed) {
        return;
      }
    }

    const result = importFlights([...state.importedFlights, ...(overwrite ? state.duplicates.map((item) => item.flight) : [])], {
      overwrite,
    });

    const importRecord = addFlightRadarImportHistory({
      fileName: state.fileName,
      sourceFormat: state.sourceFormat,
      provider: state.provider,
      detectedFlightRadar: state.detectedFlightRadar,
      detectionConfidence: state.detectionConfidence,
      parsedRows: state.parsedRows,
      flightsImported: result.imported,
      duplicates: state.duplicates.length,
      errors: state.errors.length,
      rejectedRows: state.rejectedRows.length,
      overwriteDuplicates: overwrite,
      mappedColumns: state.mappedColumns,
    });

    setSummary({
      importId: importRecord.id,
      fileName: state.fileName,
      sourceFormat: state.sourceFormat,
      provider: state.provider,
      detectedFlightRadar: state.detectedFlightRadar,
      detectionConfidence: state.detectionConfidence,
      mappedColumns: state.mappedColumns,
      parsedRows: state.parsedRows,
      flightsImported: result.imported,
      duplicates: state.duplicates.length,
      errors: state.errors.length,
      rejectedRows: state.rejectedRows.length,
      errorMessages: state.errors.slice(0, 6).map((err) => `Row ${err.row}: ${err.messages.join(", ")}`),
    });

    setPending(null);
  };

  return (
    <div className="space-y-4">
      <section className="ops-panel rounded-2xl p-4 sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Feature</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-100">FlightRadar24 Import Wizard</h2>
            <p className="mt-1 text-sm text-slate-400">Detects FlightRadar24 exports and auto-maps CSV, XLSX, and JSON into operational flights.</p>
          </div>
          <div className="ops-pill rounded-xl px-3 py-1.5 text-xs text-slate-300">{existingCount} flights in store</div>
        </div>
      </section>

      <section className="ops-panel rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-300">
            Supported formats: <span className="font-semibold text-slate-100">CSV</span>, <span className="font-semibold text-slate-100">XLSX</span>, <span className="font-semibold text-slate-100">JSON</span>
          </div>
          <ImportButton onFileSelected={handleFileSelected} disabled={isImporting} />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <label className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-xs text-slate-200">
            <input
              type="checkbox"
              checked={overwriteDuplicates}
              onChange={(event) => setOverwriteDuplicates(event.target.checked)}
            />
            Overwrite duplicates (requires confirmation)
          </label>

          {pending && pending.duplicates.length > 0 ? (
            <button
              type="button"
              onClick={() => commitImport(pending, overwriteDuplicates)}
              className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
            >
              Confirm Import
            </button>
          ) : null}
        </div>
      </section>

      <ImportSummary summary={summary} />

      {summary ? (
        <section className="ops-panel rounded-2xl p-4 sm:p-5">
          <h3 className="mb-3 text-lg font-semibold text-slate-100">Detection and Mapping</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <InfoTile label="Detected Provider" value={summary.provider || "Generic"} />
            <InfoTile label="Source Format" value={(summary.sourceFormat || "").toUpperCase() || "Unknown"} />
            <InfoTile label="FlightRadar24" value={summary.detectedFlightRadar ? "Detected" : "Not detected"} />
            <InfoTile label="Detection Confidence" value={`${Math.round((summary.detectionConfidence || 0) * 100)}%`} />
          </div>

          <div className="mt-3 rounded-xl border border-slate-700 bg-slate-900/50 p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Auto-mapped Columns</p>
            {summary.mappedColumns?.length ? (
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {summary.mappedColumns.map((item) => (
                  <p
                    key={`${item.source}-${item.target}`}
                    className="rounded-lg border border-slate-700 bg-slate-950/60 px-2 py-1 text-xs text-slate-200"
                  >
                    {item.source} {"->"} {item.target}
                  </p>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-xs text-slate-400">No mapped columns were detected.</p>
            )}
          </div>
        </section>
      ) : null}

      <section className="ops-panel rounded-2xl p-4 sm:p-5">
        <h3 className="mb-3 text-lg font-semibold text-slate-100">Import History</h3>
        {(fr24ImportHistory || []).length === 0 ? (
          <p className="text-sm text-slate-400">No FlightRadar24 imports yet.</p>
        ) : (
          <div className="space-y-2">
            {fr24ImportHistory.slice(0, 12).map((entry) => (
              <article key={entry.id} className="rounded-xl border border-slate-700 bg-slate-900/60 p-3 text-xs text-slate-300">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-slate-100">{entry.fileName || "Import"}</p>
                  <p className="text-slate-400">{new Date(entry.importedAt).toLocaleString()}</p>
                </div>
                <p className="mt-1">
                  {entry.provider} • {(entry.sourceFormat || "").toUpperCase()} • Imported {entry.flightsImported} • Duplicates {entry.duplicates} • Errors {entry.errors}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function InfoTile({ label, value }) {
  return (
    <article className="rounded-xl border border-slate-700 bg-slate-900/60 p-3">
      <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-100">{value}</p>
    </article>
  );
}
