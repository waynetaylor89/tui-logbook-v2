import PropTypes from "prop-types";

export default function ImportSummary({ summary }) {
  if (!summary) return null;

  return (
    <section className="ops-panel rounded-2xl p-4 sm:p-5">
      <h3 className="mb-3 text-lg font-semibold text-slate-100">Import Summary</h3>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryTile label="Flights Imported" value={summary.flightsImported} tone="emerald" />
        <SummaryTile label="Duplicates" value={summary.duplicates} tone="amber" />
        <SummaryTile label="Errors" value={summary.errors} tone="rose" />
        <SummaryTile label="Rejected Rows" value={summary.rejectedRows} tone="slate" />
      </div>

      {summary.errorMessages?.length > 0 ? (
        <ul className="mt-4 space-y-2 text-xs text-rose-200">
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

function SummaryTile({ label, value, tone }) {
  const tones = {
    emerald: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
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

ImportSummary.propTypes = {
  summary: PropTypes.shape({
    flightsImported: PropTypes.number.isRequired,
    duplicates: PropTypes.number.isRequired,
    errors: PropTypes.number.isRequired,
    rejectedRows: PropTypes.number.isRequired,
    errorMessages: PropTypes.arrayOf(PropTypes.string),
  }),
};

SummaryTile.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  tone: PropTypes.string,
};
