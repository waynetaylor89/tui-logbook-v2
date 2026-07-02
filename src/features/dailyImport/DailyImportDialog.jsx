import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import useLogbookStore from "../../store/useLogbookStore.js";
import { buildDailyImportPayload, parseDailyImportFile } from "./dailyImportService.js";

export default function DailyImportDialog({ open, onClose }) {
  const { flights, importDailySchedule } = useLogbookStore();

  const [selectedFile, setSelectedFile] = useState(null);
  const [replaceToday, setReplaceToday] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [summary, setSummary] = useState(null);
  const [errors, setErrors] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  if (!open) return null;

  const handleImport = async () => {
    if (!selectedFile) {
      setErrors(["Please select or drop a JSON export file."]);
      return;
    }

    setIsImporting(true);
    setErrors([]);
    setSummary(null);

    try {
      const ext = selectedFile.name.split(".").pop()?.toLowerCase();
      if (ext !== "json") {
        throw new Error("Only JSON files are supported for this import flow.");
      }

      const rawRows = await parseDailyImportFile(selectedFile);
      const payload = buildDailyImportPayload(rawRows, flights || [], { date: today });

      const result = importDailySchedule(payload.flights, {
        replaceToday,
        summary: {
          ...payload.summary,
          rejectedRows: payload.errors.length,
        },
      });

      setSummary({
        ...result.summary,
        importTime: result.summary.importTime || new Date().toISOString(),
        autoSaved: true,
      });
      setErrors(payload.errors);
    } catch (error) {
      setErrors([error.message || "Import failed."]);
    } finally {
      setIsImporting(false);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer?.files?.[0] || null;
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "json") {
      setErrors(["Drop a JSON export file (tui-flights-YYYY-MM-DD.json)."]);
      return;
    }

    setSelectedFile(file);
    setErrors([]);
  };

  return (
    <div className="fixed inset-0 z-50">
      <button type="button" className="absolute inset-0 bg-slate-950/65" onClick={onClose} aria-label="Close daily import" />

      <div className="absolute bottom-0 left-0 right-0 max-h-[88vh] overflow-y-auto rounded-t-2xl border border-slate-700 bg-slate-950 p-4 md:bottom-auto md:left-1/2 md:top-16 md:w-[700px] md:-translate-x-1/2 md:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Daily Import</p>
            <h3 className="text-xl font-semibold text-slate-100">Import Today's TUI Manchester Schedule</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-200">Close</button>
        </div>

        <div className="space-y-3">
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`rounded-xl border border-dashed p-4 text-center text-sm ${isDragging ? "border-sky-400 bg-sky-500/10 text-sky-200" : "border-slate-700 bg-slate-900/40 text-slate-300"}`}
          >
            Drag and drop exported JSON here
          </div>

          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-[0.14em] text-slate-400">Select File</span>
            <input
              type="file"
              accept=".json"
              onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100"
            />
            {selectedFile ? <p className="mt-2 text-xs text-slate-400">Selected: {selectedFile.name}</p> : null}
          </label>

          <label className="inline-flex items-center gap-2 text-sm text-slate-300">
            <input type="checkbox" checked={replaceToday} onChange={(event) => setReplaceToday(event.target.checked)} />
            Replace today's schedule (completed jobs are kept)
          </label>

          <button
            type="button"
            onClick={handleImport}
            disabled={isImporting}
            className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500 disabled:bg-slate-700"
          >
            {isImporting ? "Importing..." : "Import Today's Flights"}
          </button>
        </div>

        {summary ? (
          <div className="mt-4 rounded-xl border border-slate-700 bg-slate-900/50 p-3 text-sm text-slate-200">
            <p className="mb-2 font-semibold">Import Summary</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <Summary label="Flights Imported" value={summary.flightsImported} />
              <Summary label="Arrivals" value={summary.arrivals} />
              <Summary label="Departures" value={summary.departures} />
              <Summary label="Duplicates" value={summary.duplicates} />
              <Summary label="Errors" value={summary.errors} />
              <Summary label="Import Time" value={new Date(summary.importTime).toLocaleTimeString()} />
            </div>
            <p className="mt-2 text-xs text-emerald-300">Saved automatically to local storage.</p>
          </div>
        ) : null}

        {errors.length > 0 ? (
          <ul className="mt-4 space-y-2 text-xs text-rose-200">
            {errors.slice(0, 10).map((item, index) => (
              <li key={`${item}-${index}`} className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2">{item}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

function Summary({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-950/50 p-2">
      <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-100">{value}</p>
    </div>
  );
}

DailyImportDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

Summary.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
};
