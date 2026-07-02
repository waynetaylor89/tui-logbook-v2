import PropTypes from "prop-types";

export default function FlightRadarHistory({ history }) {
  return (
    <section className="ops-panel rounded-2xl p-4 sm:p-5">
      <h3 className="mb-3 text-lg font-semibold text-slate-100">Import History</h3>

      {(history || []).length === 0 ? (
        <p className="text-sm text-slate-400">No FlightRadar24 imports yet.</p>
      ) : (
        <div className="space-y-2">
          {(history || []).slice(0, 12).map((entry) => (
            <article key={entry.id} className="rounded-xl border border-slate-700 bg-slate-900/60 p-3 text-xs text-slate-300">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-slate-100">{entry.fileName || "Import"}</p>
                <p className="text-slate-400">{new Date(entry.importedAt).toLocaleString()}</p>
              </div>
              <p className="mt-1">
                {entry.provider || "Generic"} • {(entry.sourceFormat || "").toUpperCase()} • Imported {entry.flightsImported} • Duplicates {entry.duplicates} • Errors {entry.errors}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

FlightRadarHistory.propTypes = {
  history: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      importedAt: PropTypes.string,
      fileName: PropTypes.string,
      sourceFormat: PropTypes.string,
      provider: PropTypes.string,
      flightsImported: PropTypes.number,
      duplicates: PropTypes.number,
      errors: PropTypes.number,
    })
  ),
};
