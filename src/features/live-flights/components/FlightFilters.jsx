import PropTypes from "prop-types";

const FILTERS = ["All", "TUI", "Arrivals", "Departures", "Active", "Delayed", "Completed"];

export default function FlightFilters({ value, onChange }) {
  return (
    <section className="ops-panel rounded-2xl p-4 sm:p-5">
      <p className="mb-2 text-xs uppercase tracking-[0.14em] text-slate-400">Live Filters</p>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((item) => {
          const active = value === item;
          return (
            <button
              key={item}
              type="button"
              onClick={() => onChange(item)}
              className={`min-h-10 rounded-full border px-3 py-2 text-xs font-medium transition ${
                active
                  ? "border-cyan-400 bg-cyan-500/15 text-cyan-100"
                  : "border-slate-700 bg-slate-900/60 text-slate-300 hover:border-slate-500"
              }`}
            >
              {item}
            </button>
          );
        })}
      </div>
    </section>
  );
}

FlightFilters.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};
