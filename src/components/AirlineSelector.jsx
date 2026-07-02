import PropTypes from "prop-types";

export default function AirlineSelector({ selectedAirline, airlines, onChange, includeAllOption = true }) {
  return (
    <label>
      <span className="mb-1 block text-xs uppercase tracking-[0.14em] text-slate-400">Airline</span>
      <select
        value={selectedAirline}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-11 w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100"
      >
        {includeAllOption ? <option value="All Airlines">All Airlines</option> : null}
        {airlines.map((airline) => (
          <option key={airline} value={airline}>{airline}</option>
        ))}
      </select>
    </label>
  );
}

AirlineSelector.propTypes = {
  selectedAirline: PropTypes.string.isRequired,
  airlines: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
  includeAllOption: PropTypes.bool,
};
