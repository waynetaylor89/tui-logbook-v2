import PropTypes from "prop-types";

export default function FlightRadarSummary({ summary }) {
  if (!summary) return null;

  return (
    <section className="ops-panel rounded-2xl p-4 sm:p-5">
      <h3 className="mb-3 text-lg font-semibold text-slate-100">Import Summary</h3>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Tile label="Flights Found" value={summary.flightsFound || summary.parsedRows || 0} tone="slate" />
        <Tile label="Flights Imported" value={summary.flightsImported || 0} tone="emerald" />
        <Tile label="Flights Updated" value={summary.flightsUpdated || 0} tone="sky" />
        <Tile label="Duplicates" value={summary.duplicates || 0} tone="amber" />
        <Tile label="Errors" value={summary.errors || 0} tone="rose" />
      </div>

      <div className="mt-3 text-xs text-slate-300">
        <p>
          Provider: <span className="font-semibold text-slate-100">{summary.provider || "Generic"}</span> • Format: <span className="font-semibold text-slate-100">{(summary.sourceFormat || "").toUpperCase() || "Unknown"}</span>
        </p>
        <p className="mt-1">
          Replace Today: <span className="font-semibold text-slate-100">{summary.replaceToday ? "Enabled" : "Disabled"}</span>
        </p>
      </div>

      {summary.errorMessages?.length > 0 ? (
        <ul className="mt-3 space-y-2 text-xs text-rose-200">
          {summary.errorMessages.map((message, index) => (
            <li key={`${message}-${index}`} className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2">
              {message}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function Tile({ label, value, tone }) {
  const tones = {
    emerald: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
    sky: "border-sky-500/40 bg-sky-500/10 text-sky-200",
    amber: "border-amber-500/40 bg-amber-500/10 text-amber-200",
    rose: "border-rose-500/40 bg-rose-500/10 text-rose-200",
    slate: "border-slate-600 bg-slate-800/60 text-slate-200",
  };

  return (
    <article className={`rounded-xl border px-3 py-2 ${tones[tone] || tones.slate}`}>
      <p className="text-[10px] uppercase tracking-[0.14em]">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </article>
  );
}

FlightRadarSummary.propTypes = {
  summary: PropTypes.shape({
    flightsFound: PropTypes.number,
    parsedRows: PropTypes.number,
    flightsImported: PropTypes.number,
    flightsUpdated: PropTypes.number,
    duplicates: PropTypes.number,
    errors: PropTypes.number,
    sourceFormat: PropTypes.string,
    provider: PropTypes.string,
    replaceToday: PropTypes.bool,
    errorMessages: PropTypes.arrayOf(PropTypes.string),
  }),
};

Tile.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  tone: PropTypes.string,
};
