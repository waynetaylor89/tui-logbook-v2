import PropTypes from "prop-types";

export default function FlightFilters({
  searchTerm,
  onSearchTermChange,
  movementFilter,
  onMovementFilterChange,
  statusFilter,
  onStatusFilterChange,
  standFilter,
  onStandFilterChange,
  sortBy,
  onSortByChange,
  statuses,
  stands,
}) {
  const inputClass =
    "w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-400/50 focus:outline-none";

  return (
    <div className="ops-panel rounded-2xl p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs uppercase tracking-[0.14em] text-slate-400">Search</label>
          <input
            value={searchTerm}
            onChange={(event) => onSearchTermChange(event.target.value)}
            placeholder="Flight, registration, route, stand"
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs uppercase tracking-[0.14em] text-slate-400">Movement</label>
          <select
            value={movementFilter}
            onChange={(event) => onMovementFilterChange(event.target.value)}
            className={inputClass}
          >
            <option value="All">All</option>
            <option value="Arrival">Arrival</option>
            <option value="Departure">Departure</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs uppercase tracking-[0.14em] text-slate-400">Status</label>
          <select
            value={statusFilter}
            onChange={(event) => onStatusFilterChange(event.target.value)}
            className={inputClass}
          >
            <option value="All">All</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs uppercase tracking-[0.14em] text-slate-400">Stand</label>
          <select
            value={standFilter}
            onChange={(event) => onStandFilterChange(event.target.value)}
            className={inputClass}
          >
            <option value="All">All</option>
            {stands.map((stand) => (
              <option key={stand} value={stand}>
                {stand}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs uppercase tracking-[0.14em] text-slate-400">Sort</label>
          <select
            value={sortBy}
            onChange={(event) => onSortByChange(event.target.value)}
            className={inputClass}
          >
            <option value="time-asc">Time (Earliest)</option>
            <option value="time-desc">Time (Latest)</option>
            <option value="status-asc">Status (A-Z)</option>
            <option value="destination-asc">Destination (A-Z)</option>
            <option value="stand-asc">Stand (Low-High)</option>
          </select>
        </div>
      </div>
    </div>
  );
}

FlightFilters.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  onSearchTermChange: PropTypes.func.isRequired,
  movementFilter: PropTypes.string.isRequired,
  onMovementFilterChange: PropTypes.func.isRequired,
  statusFilter: PropTypes.string.isRequired,
  onStatusFilterChange: PropTypes.func.isRequired,
  standFilter: PropTypes.string.isRequired,
  onStandFilterChange: PropTypes.func.isRequired,
  sortBy: PropTypes.string.isRequired,
  onSortByChange: PropTypes.func.isRequired,
  statuses: PropTypes.arrayOf(PropTypes.string).isRequired,
  stands: PropTypes.arrayOf(PropTypes.string).isRequired,
};
