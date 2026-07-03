import { useEffect, useState } from "react";
import { readClipboardText } from "../../../../services/import/clipboardService.js";
import {
  parseFlightImportLink,
  addImportHistory,
} from "../../../../services/import/linkParser.js";
import { toast } from "../../../../components/Toast.jsx";

export default function FlightRadarUrlImport() {
  const [url, setUrl] = useState("");
  const [validation, setValidation] = useState(null);
  const [checkedClipboard, setCheckedClipboard] = useState(false);

  useEffect(() => {
    if (checkedClipboard) return;
    setCheckedClipboard(true);

    void (async () => {
      try {
        const result = await readClipboardText();
        if (!result.ok || !result.text?.trim()) return;

        const text = result.text.trim();
        const parsed = parseFlightImportLink(text);
        if (parsed.ok && parsed.provider === "flightradar24") {
          setUrl(text);
          setValidation(parsed);
        }
      } catch {
        // Silently fail — clipboard may not be available
      }
    })();
  }, [checkedClipboard]);

  function handleInputChange(event) {
    const raw = event.target.value;
    setUrl(raw);

    if (!raw.trim()) {
      setValidation(null);
      return;
    }

    const parsed = parseFlightImportLink(raw);
    setValidation(parsed);
  }

  function handleClear() {
    setUrl("");
    setValidation(null);
  }

  async function handlePasteFromClipboard() {
    try {
      const result = await readClipboardText();
      if (!result.ok) {
        if (result.code === "denied") {
          toast.warning("Clipboard permission denied. You can paste manually.");
        } else {
          toast.warning(result.error || "Clipboard access is unavailable.");
        }
        return;
      }

      const text = (result.text || "").trim();
      if (!text) {
        toast.warning("Clipboard is empty.");
        return;
      }

      setUrl(text);
      const parsed = parseFlightImportLink(text);
      setValidation(parsed);

      if (!parsed.ok) {
        toast.error(parsed.error || "Not a valid flight link.");
      }
    } catch {
      toast.error("Could not read clipboard.");
    }
  }

  function handleImportUrl() {
    const raw = url.trim();
    if (!raw) {
      toast.warning("Enter a FlightRadar24 history URL first.");
      return;
    }

    const parsed = parseFlightImportLink(raw);
    setValidation(parsed);

    if (!parsed.ok) {
      toast.error(parsed.error || "Unsupported URL.");
      return;
    }

    if (parsed.provider !== "flightradar24") {
      toast.error("Only FlightRadar24 history URLs are supported for direct import.");
      return;
    }

    const importRecord = {
      url: raw,
      normalizedUrl: parsed.normalizedUrl || raw,
      provider: parsed.provider,
      kind: parsed.kind,
      status: parsed.ok ? "supported" : "unsupported",
      importedAt: new Date().toISOString(),
    };

    addImportHistory(importRecord, 20);

    toast.success("FlightRadar24 URL saved to import history.");
  }

  const isValid = validation?.ok && validation.provider === "flightradar24";

  return (
    <section className="ops-panel rounded-2xl p-4 sm:p-5">
      <div className="mb-3">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Quick Import</p>
        <h3 className="mt-1 text-lg font-semibold text-slate-100">Import from FlightRadar24 URL</h3>
        <p className="mt-1 text-sm text-slate-400">
          Paste a FlightRadar24 airport history URL to save it for import. Use the file selector below to upload an exported webpage.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-[0.14em] text-slate-400">FlightRadar24 History URL</span>
          <input
            type="url"
            value={url}
            onChange={handleInputChange}
            placeholder="https://www.flightradar24.com/data/airport/man/arrivals"
            className={`w-full rounded-xl border px-3 py-2 text-sm text-slate-100 transition ${
              validation && !isValid
                ? "border-rose-500/60 bg-rose-900/20"
                : isValid
                  ? "border-emerald-500/60 bg-emerald-900/20"
                  : "border-slate-700 bg-slate-900/60"
            }`}
          />
        </label>

        {validation && !isValid ? (
          <p className="text-xs text-rose-300">
            {validation.error || "Not a valid FlightRadar24 history URL."}
          </p>
        ) : null}

        {validation && isValid ? (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-900/15 p-3 text-xs text-slate-200">
            <p className="font-semibold text-emerald-200">FlightRadar24 history URL detected</p>
            <p className="mt-1">
              Airport: {validation.preview?.airport || "Unknown"} {"•"} Date: {validation.preview?.date || "Unknown"} {"•"} Type: {validation.preview?.type || "Unknown"}
            </p>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handlePasteFromClipboard}
            className="min-h-11 rounded-xl border border-slate-600 px-4 py-2 text-sm text-slate-200 transition hover:border-sky-400/50 hover:bg-sky-500/10"
          >
            📋 Paste from Clipboard
          </button>

          {url.trim() ? (
            <>
              <button
                type="button"
                onClick={handleImportUrl}
                className="min-h-11 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
              >
                Save URL for Import
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="min-h-11 rounded-xl border border-slate-600 px-4 py-2 text-sm text-slate-200 transition hover:border-rose-400/50 hover:bg-rose-500/10"
              >
                Clear
              </button>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}
