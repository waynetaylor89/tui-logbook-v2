import PropTypes from "prop-types";

export default function AircraftSearch({ searchTerm, onSearchTermChange }) {
  return (
    <section className="ops-panel rounded-2xl p-4 sm:p-5">
      <label className="mb-2 block text-xs uppercase tracking-[0.14em] text-slate-400">Search Aircraft Intelligence</label>
      <input
        value={searchTerm}
        onChange={(event) => onSearchTermChange(event.target.value)}
        placeholder="Registration, aircraft type, destination, fleet number"
        className="min-h-12 w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500"
      />
    </section>
  );
}

AircraftSearch.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  onSearchTermChange: PropTypes.func.isRequired,
};
