import PropTypes from "prop-types";
import AirlineSelector from "./AirlineSelector.jsx";

export default function AirlineFilter({
  airlines,
  selectedAirline,
  onSelect,
  showOtherAirlines = true,
  temporaryOverride = false,
  onTemporaryOverride,
  onClearTemporaryOverride,
}) {
  const tuiFirstAirlines = [
    ...airlines.filter((airline) => airline === "TUI Airways"),
    ...airlines.filter((airline) => airline !== "TUI Airways"),
  ];

  const strictTuiMode = !showOtherAirlines && !temporaryOverride;
  const chipAirlines = strictTuiMode ? ["TUI Airways"] : [...tuiFirstAirlines, "All Airlines"];

  return (
    <section className="ops-panel rounded-2xl p-4 sm:p-5">
      {strictTuiMode ? (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-3 py-2">
          <p className="text-xs text-cyan-100">TUI Mode active: non-TUI flights are hidden by default.</p>
          {onTemporaryOverride ? (
            <button
              type="button"
              onClick={onTemporaryOverride}
              className="min-h-10 rounded-lg border border-cyan-300/60 bg-cyan-500/20 px-3 py-2 text-xs font-medium text-cyan-100"
            >
              Show Other Airlines (Temporary)
            </button>
          ) : null}
        </div>
      ) : null}

      {!strictTuiMode && temporaryOverride && onClearTemporaryOverride ? (
        <div className="mb-3 flex justify-end">
          <button
            type="button"
            onClick={onClearTemporaryOverride}
            className="min-h-10 rounded-lg border border-slate-600 bg-slate-900/60 px-3 py-2 text-xs text-slate-200"
          >
            End Temporary Override
          </button>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[2fr_1fr]">
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.14em] text-slate-400">Airline Filter Chips</p>
          <div className="flex flex-wrap gap-2">
            {chipAirlines.map((airline) => {
              const active = selectedAirline === airline;
              return (
                <button
                  key={airline}
                  type="button"
                  onClick={() => onSelect(airline)}
                  className={`min-h-11 rounded-full border px-3 py-2 text-xs font-medium transition ${
                    active
                      ? "border-cyan-400 bg-cyan-500/15 text-cyan-100"
                      : "border-slate-700 bg-slate-900/60 text-slate-300 hover:border-slate-500"
                  }`}
                >
                  {airline}
                </button>
              );
            })}
          </div>
        </div>
        <AirlineSelector
          selectedAirline={selectedAirline}
          airlines={strictTuiMode ? ["TUI Airways"] : airlines}
          onChange={onSelect}
          includeAllOption={!strictTuiMode}
        />
      </div>
    </section>
  );
}

AirlineFilter.propTypes = {
  airlines: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedAirline: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired,
  showOtherAirlines: PropTypes.bool,
  temporaryOverride: PropTypes.bool,
  onTemporaryOverride: PropTypes.func,
  onClearTemporaryOverride: PropTypes.func,
};
