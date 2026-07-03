import { useMemo, useState } from "react";
import ImportLinkDialog from "./ImportLinkDialog.jsx";
import { readLastImportStatus } from "../../services/import/linkParser.js";

export default function PasteFlightLink() {
  const [open, setOpen] = useState(false);
  const [lastImport, setLastImport] = useState(() => readLastImportStatus());

  const lastImportTime = useMemo(() => {
    const text = String(lastImport?.importedAt || "");
    if (!text) return "Not imported yet";
    const date = new Date(text);
    if (Number.isNaN(date.getTime())) return "Not imported yet";
    return date.toLocaleString();
  }, [lastImport]);

  function handleOpenDialog() {
    setOpen(true);
  }

  function handleCloseDialog() {
    setOpen(false);
    setLastImport(readLastImportStatus());
  }

  function handleImportComplete() {
    setLastImport(readLastImportStatus());
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpenDialog}
        className="group flex min-h-24 w-full items-center justify-between rounded-2xl border border-slate-700 bg-slate-900/55 px-4 py-4 text-left transition hover:border-sky-400/45 hover:bg-slate-900/85"
      >
        <div className="min-w-0">
          <p className="text-base font-semibold text-slate-100">Paste Flight Link</p>
          <p className="mt-1 text-sm text-slate-400">Paste FlightRadar24 or AviationStack URL</p>
          <p className="mt-1 truncate text-xs text-slate-500">Last Imported Link: {lastImport?.url || "None"}</p>
          <p className="text-xs text-slate-500">Last Import Time: {lastImportTime}</p>
          <p className="text-xs text-slate-500">Import Status: {lastImport?.status || "idle"}</p>
          <p className="text-xs text-slate-500">Future Ready: provider parser adapters enabled</p>
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-slate-800 text-xl text-slate-200 group-hover:bg-sky-500/25">
          📋
        </div>
      </button>

      <ImportLinkDialog open={open} onClose={handleCloseDialog} onImportComplete={handleImportComplete} />
    </>
  );
}
