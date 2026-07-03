import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  addImportHistory,
  clearImportHistory,
  deleteImportHistory,
  parseFlightImportLink,
  readImportHistory,
  writeLastImportStatus,
} from "../../services/import/linkParser.js";
import { readClipboardText } from "../../services/import/clipboardService.js";
import RecentLinks from "./RecentLinks.jsx";
import { toast } from "../../components/Toast.jsx";

export default function ImportLinkDialog({ open, onClose, onImportComplete }) {
  const [value, setValue] = useState("");
  const [detected, setDetected] = useState(null);
  const [recentLinks, setRecentLinks] = useState(() => readImportHistory());

  const canImport = useMemo(() => {
    return Boolean(detected?.ok);
  }, [detected]);

  useEffect(() => {
    if (!open) return;
    setRecentLinks(readImportHistory());
    void handlePasteFromClipboard({ silent: true });
  }, [open]);

  if (!open) return null;

  async function handlePasteFromClipboard(options = {}) {
    const { silent = false } = options;
    const result = await readClipboardText();
    if (!result.ok) {
      if (!silent) {
        if (result.code === "denied") {
          toast.warning("Clipboard permission denied. You can still paste manually.");
        } else {
          toast.warning(result.error || "Clipboard access is unavailable in this browser.");
        }
      }
      return;
    }

    const nextValue = result.text || "";
    try {
      setValue(nextValue);

      if (!nextValue.trim()) {
        if (!silent) {
          toast.warning("Clipboard is empty.");
        }
        setDetected(null);
        return;
      }

      const parsed = parseFlightImportLink(nextValue);
      setDetected(parsed);

      if (!silent && !parsed.ok) {
        toast.error(parsed.error || "Unsupported link.");
      }
    } catch {
      if (!silent) {
        toast.error("Could not read clipboard.");
      }
    }
  }

  function handleInputChange(event) {
    const text = event.target.value;
    setValue(text);

    if (!text.trim()) {
      setDetected(null);
      return;
    }

    setDetected(parseFlightImportLink(text));
  }

  function handleClearInput() {
    setValue("");
    setDetected(null);
  }

  function handleImport() {
    const raw = value.trim();
    if (!raw) {
      toast.warning("Paste a link before importing.");
      return;
    }

    const parsed = parseFlightImportLink(raw);
    setDetected(parsed);

    const importRecord = {
      url: raw,
      normalizedUrl: parsed.normalizedUrl || raw,
      provider: parsed.provider,
      kind: parsed.kind,
      status: parsed.ok ? "supported" : "unsupported",
      importedAt: new Date().toISOString(),
    };

    const nextRecent = addImportHistory(importRecord, 20);
    setRecentLinks(nextRecent);

    writeLastImportStatus({
      url: importRecord.url,
      importedAt: importRecord.importedAt,
      status: importRecord.status,
      provider: importRecord.provider,
    });

    onImportComplete?.();

    if (!parsed.ok) {
      toast.error(parsed.error || "Unsupported link.");
      return;
    }

    toast.success("Link parsed and saved. Ready for future provider import.");
  }

  function applyRecent(item) {
    setValue(item.url);
    const parsed = parseFlightImportLink(item.url);
    setDetected(parsed);
  }

  function handleDeleteRecent(id) {
    setRecentLinks(deleteImportHistory(id));
  }

  function handleClearHistory() {
    setRecentLinks(clearImportHistory());
    toast.success("Recent import history cleared.");
  }

  return (
    <div className="fixed inset-0 z-50">
      <button type="button" className="absolute inset-0 bg-slate-950/65" onClick={onClose} aria-label="Close link import" />

      <div className="absolute bottom-0 left-0 right-0 max-h-[90vh] overflow-y-auto rounded-t-2xl border border-slate-700 bg-slate-950 p-4 md:bottom-auto md:left-1/2 md:top-16 md:w-[760px] md:-translate-x-1/2 md:rounded-2xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Flight URL Import</p>
            <h3 className="text-xl font-semibold text-slate-100">Paste Flight Link</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-200">
            Cancel
          </button>
        </div>

        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-[0.14em] text-slate-400">Link</span>
          <textarea
            value={value}
            onChange={handleInputChange}
            placeholder="Paste a flightradar24.com or aviationstack.com URL"
            rows={4}
            className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100"
          />
        </label>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handlePasteFromClipboard}
            className="min-h-11 rounded-xl border border-slate-600 px-4 py-2 text-sm text-slate-200"
          >
            Paste from Clipboard
          </button>
          <button
            type="button"
            onClick={handleClearInput}
            className="min-h-11 rounded-xl border border-slate-600 px-4 py-2 text-sm text-slate-200"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={handleImport}
            className="min-h-11 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Import
          </button>
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 rounded-xl border border-slate-600 px-4 py-2 text-sm text-slate-200"
          >
            Cancel
          </button>
        </div>

        {detected ? (
          <section className="mt-4 rounded-xl border border-slate-700 bg-slate-900/55 p-3">
            {detected.ok ? (
              <>
                <p className="text-sm font-semibold text-slate-100">{detected.preview?.title || "Link preview"}</p>
                {detected.provider === "flightradar24" ? (
                  <dl className="mt-2 grid grid-cols-1 gap-1 text-xs text-slate-300">
                    <div>Airport: {detected.preview?.airport || "Unknown"}</div>
                    <div>Date: {detected.preview?.date || "Unknown"}</div>
                    <div>Type: {detected.preview?.type || "Unknown"}</div>
                    <div className="truncate">Original URL: {detected.preview?.originalUrl || value}</div>
                    <div>Query: {JSON.stringify(detected.preview?.queryParameters || {})}</div>
                  </dl>
                ) : (
                  <dl className="mt-2 grid grid-cols-1 gap-1 text-xs text-slate-300">
                    <div>Endpoint: {detected.preview?.endpoint || "/"}</div>
                    <div className="truncate">Original URL: {detected.preview?.originalUrl || value}</div>
                    <div>Query: {JSON.stringify(detected.preview?.queryParameters || {})}</div>
                  </dl>
                )}
                <p className="mt-2 text-[11px] text-slate-500">
                  Future provider ready: parsed metadata stored only. No scraping/download from URL is performed.
                </p>
              </>
            ) : (
              <p className="text-sm text-rose-300">{detected.error || "Unsupported link."}</p>
            )}
          </section>
        ) : null}

        <RecentLinks items={recentLinks} onReuse={applyRecent} onDelete={handleDeleteRecent} onClear={handleClearHistory} />

        {!canImport && value.trim() ? (
          <p className="mt-3 text-xs text-slate-500">Import status is unsupported for this link. You can still keep it in Recent Imports.</p>
        ) : null}
      </div>
    </div>
  );
}

ImportLinkDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onImportComplete: PropTypes.func,
};
