import PropTypes from "prop-types";

export default function FlightRadarFilters({ filters, onChange, statuses }) {
  return (
    <section className="ops-panel rounded-2xl p-4 sm:p-5">
      <h3 className="mb-3 text-lg font-semibold text-slate-100">Preview Filters</h3>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <label>
          <span className="mb-1 block text-xs uppercase tracking-[0.14em] text-slate-400">Search</span>
          <input
            value={filters.query}
            onChange={(event) => onChange({ ...filters, query: event.target.value })}
            placeholder="Flight, reg, origin, destination"
            className="min-h-11 w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100"
          />
        </label>

        <label>
          <span className="mb-1 block text-xs uppercase tracking-[0.14em] text-slate-400">Airline Filter</span>
          <select
            value={filters.airlineMode}
            onChange={(event) => onChange({ ...filters, airlineMode: event.target.value })}
            className="min-h-11 w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100"
          >
            <option value="TUIOnly">Show TUI Only</option>
            <option value="All">Show All Airlines</option>
          </select>
        </label>

        <label>
          <span className="mb-1 block text-xs uppercase tracking-[0.14em] text-slate-400">Arrival/Departure</span>
          <select
            value={filters.movement}
            onChange={(event) => onChange({ ...filters, movement: event.target.value })}
            className="min-h-11 w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100"
          >
            <option value="All">All</option>
            <option value="Arrival">Arrivals Only</option>
            <option value="Departure">Departures Only</option>
          </select>
        </label>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
        <label className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-200">
          <input
            type="checkbox"
            checked={Boolean(filters.sortByTime)}
            onChange={(event) => onChange({ ...filters, sortByTime: event.target.checked })}
          />
          Sort by Time
        </label>

        <label>
          <span className="mb-1 block text-xs uppercase tracking-[0.14em] text-slate-400">Status</span>
          <select
            value={filters.status}
            onChange={(event) => onChange({ ...filters, status: event.target.value })}
            className="min-h-11 w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100"
          >
            <option value="All">All</option>
            {statuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}

FlightRadarFilters.propTypes = {
  filters: PropTypes.shape({
    query: PropTypes.string,
    airlineMode: PropTypes.string,
    movement: PropTypes.string,
    status: PropTypes.string,
    sortByTime: PropTypes.bool,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  statuses: PropTypes.arrayOf(PropTypes.string).isRequired,
};
