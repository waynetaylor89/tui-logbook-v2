import PropTypes from "prop-types";

export default function DailyImportHistory({ historyItems = [] }) {
  return (
    <section className="ops-panel rounded-2xl p-4 sm:p-5">
      <h3 className="mb-3 text-lg font-semibold text-slate-100">Daily Import History</h3>

      {historyItems.length === 0 ? (
        <p className="text-sm text-slate-400">No daily imports yet.</p>
      ) : (
        <ul className="space-y-2">
          {historyItems.slice(0, 8).map((item) => (
            <li key={item.id} className="rounded-xl border border-slate-700 bg-slate-900/50 p-3 text-xs text-slate-300">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium text-slate-100">{formatDateTime(item.importTime)}</span>
                <span className="text-slate-400">{item.replaced ? "Replaced schedule" : "Append import"}</span>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
                <Chip label="Imported" value={item.flightsImported} />
                <Chip label="Arrivals" value={item.arrivals} />
                <Chip label="Departures" value={item.departures} />
                <Chip label="Duplicates" value={item.duplicates} />
                <Chip label="Errors" value={item.errors} />
                <Chip label="Rejected" value={item.rejectedRows || 0} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Chip({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-950/50 px-2 py-1">
      <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-100">{value}</p>
    </div>
  );
}

function formatDateTime(iso) {
  if (!iso) return "Unknown";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString();
}

DailyImportHistory.propTypes = {
  historyItems: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    importTime: PropTypes.string.isRequired,
    flightsImported: PropTypes.number.isRequired,
    arrivals: PropTypes.number.isRequired,
    departures: PropTypes.number.isRequired,
    duplicates: PropTypes.number.isRequired,
    errors: PropTypes.number.isRequired,
    rejectedRows: PropTypes.number,
    replaced: PropTypes.bool,
  })),
};

Chip.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
};
