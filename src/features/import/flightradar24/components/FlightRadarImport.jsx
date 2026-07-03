import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import useLogbookStore from "../../../../store/useLogbookStore.js";
import { createFlightRadarPreview, commitFlightRadarImport } from "../services/flightRadarImportService.js";
import { filterFlightRadarPreview } from "../services/flightRadarMapper.js";
import FlightRadarSummary from "./FlightRadarSummary.jsx";
import FlightRadarHistory from "./FlightRadarHistory.jsx";
import FlightRadarMapping from "./FlightRadarMapping.jsx";
import FlightRadarFilters from "./FlightRadarFilters.jsx";
import FlightRadarPreview from "./FlightRadarPreview.jsx";
import FlightRadarUrlImport from "./FlightRadarUrlImport.jsx";

export default function FlightRadarImport() {
  const { flights, fr24ImportHistory, importDailySchedule, addFlightRadarImportHistory } = useLogbookStore();
  const navigate = useNavigate();

  const [isProcessing, setIsProcessing] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState(null);
  const [summary, setSummary] = useState(null);
  const [filters, setFilters] = useState({
    query: "",
    airlineMode: "TUIOnly",
    movement: "All",
    status: "All",
    sortByTime: true,
  });
  const previewFlights = useMemo(
    () => filterFlightRadarPreview(preview?.flights || [], filters),
    [preview, filters]
  );

  const statusOptions = useMemo(() => {
    const values = Array.from(new Set((preview?.flights || []).map((item) => item.status).filter(Boolean)));
    return values.sort();
  }, [preview]);

  const setDefaultFilters = () => {
    setFilters({
      query: "",
      airlineMode: "TUIOnly",
      movement: "All",
      status: "All",
      sortByTime: true,
    });
  };

  const handleSelectedFile = async (file, { fromDrop = false } = {}) => {
    if (!file) return;

    if (fromDrop && !isHtmlFile(file.name || "")) {
      setPreview(null);
      setSummary({
        parsedRows: 0,
        flightsFound: 0,
        flightsImported: 0,
        flightsUpdated: 0,
        duplicates: 0,
        errors: 1,
        errorMessages: ["Unsupported format. Drag and drop accepts only .html or .htm FlightRadar24 webpage exports."],
      });
      return;
    }

    setIsProcessing(true);
    setSummary(null);
    setProgress(12);

    try {
      setProgress(45);
      const nextPreview = await createFlightRadarPreview(file, flights || []);
      setProgress(82);

      if (!nextPreview.detectedFlightRadar) {
        setPreview(null);
        setSummary({
          fileName: nextPreview.fileName,
          sourceFormat: nextPreview.sourceFormat,
          provider: nextPreview.provider,
          parsedRows: nextPreview.parsedRows || 0,
          flightsFound: nextPreview.flightsFound || 0,
          flightsImported: 0,
          flightsUpdated: 0,
          duplicates: 0,
          errors: 1,
          errorMessages: ["Unsupported format. FlightRadar24 was not detected in this file."],
        });
        return;
      }

      setPreview(nextPreview);
      setDefaultFilters();
    } catch (error) {
      setPreview(null);
      setSummary({
        parsedRows: 0,
        flightsFound: 0,
        flightsImported: 0,
        flightsUpdated: 0,
        duplicates: 0,
        errors: 1,
        errorMessages: [error.message || "Import preview failed."],
      });
    } finally {
      setProgress(100);
      window.setTimeout(() => setProgress(0), 450);
      setIsProcessing(false);
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    await handleSelectedFile(file, { fromDrop: false });
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    setIsDraggingOver(false);
    const file = event.dataTransfer?.files?.[0] || null;
    await handleSelectedFile(file, { fromDrop: true });
  };

  const handleImport = () => {
    if (!preview) return;

    const result = commitFlightRadarImport({
      preview,
      importDailySchedule,
      addFlightRadarImportHistory,
    });

    setSummary(result.summary);
    setPreview(null);
    navigate("/statistics");
  };

  return (
    <div className="space-y-4">
      <section className="ops-panel rounded-2xl p-4 sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Sprint 11</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-100">Import FlightRadar24 Webpage</h2>
            <p className="mt-1 text-sm text-slate-400">Import FlightRadar24 exports locally (CSV/XLSX/JSON/HTML). HTML webpage imports are parsed on-device only and never uploaded.</p>
          </div>
          <div className="ops-pill rounded-xl px-3 py-1.5 text-xs text-slate-300">{(flights || []).length} flights in store</div>
        </div>
      </section>

      <FlightRadarUrlImport />

      <section className="ops-panel rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <label className={`inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold ${isProcessing ? "bg-slate-700 text-slate-400" : "bg-sky-600 text-white hover:bg-sky-500"}`}>
            {isProcessing ? "Processing..." : "Select FlightRadar Export"}
            <input
              type="file"
              accept=".csv,.xlsx,.xls,.json,.html,.htm"
              className="hidden"
              disabled={isProcessing}
              onChange={handleFileChange}
            />
          </label>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleImport}
              disabled={!preview || isProcessing}
              className="min-h-11 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-400"
            >
              Import Today's Flights
            </button>
          </div>
        </div>

        <div
          onDragOver={(event) => {
            event.preventDefault();
            setIsDraggingOver(true);
          }}
          onDragEnter={(event) => {
            event.preventDefault();
            setIsDraggingOver(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setIsDraggingOver(false);
          }}
          onDrop={handleDrop}
          className={`mt-3 rounded-xl border border-dashed p-4 text-sm transition ${isDraggingOver ? "border-cyan-400 bg-cyan-500/10 text-cyan-100" : "border-slate-700 bg-slate-900/40 text-slate-300"}`}
        >
          Drop Zone: Drag a FlightRadar24 webpage export (.html/.htm) here to parse locally.
        </div>

        {isProcessing || progress > 0 ? (
          <div className="mt-3">
            <div className="mb-1 flex items-center justify-between text-xs text-slate-300">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-800">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-sky-400 transition-all duration-150"
                style={{ width: `${Math.max(0, Math.min(progress, 100))}%` }}
              />
            </div>
          </div>
        ) : null}

        <p className="mt-3 text-xs text-slate-400">
          One click import mode: duplicates are ignored, existing flights are updated, completed jobs are kept, and shift notes/checklists remain intact.
        </p>
      </section>

      {preview ? (
        <>
          <FlightRadarMapping
            provider={preview.provider}
            sourceFormat={preview.sourceFormat}
            detectedFlightRadar={preview.detectedFlightRadar}
            detectionConfidence={preview.detectionConfidence}
            mappedColumns={preview.mappedColumns}
          />
          <FlightRadarFilters filters={filters} onChange={setFilters} statuses={statusOptions} />
          <FlightRadarPreview flights={previewFlights} />
        </>
      ) : null}

      <FlightRadarSummary summary={summary} />
      <FlightRadarHistory history={fr24ImportHistory || []} />
    </div>
  );
}

function isHtmlFile(fileName) {
  const extension = String(fileName || "").split(".").pop().toLowerCase();
  return extension === "html" || extension === "htm";
}
