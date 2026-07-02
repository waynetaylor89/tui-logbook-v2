import PropTypes from "prop-types";

export default function FlightCard({ flight, onClaim, canClaim }) {
  return (
    <article className="rounded-2xl border border-slate-700 bg-slate-900/55 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-slate-100">{flight.flightNumber || "Unknown"}</p>
          <p className="text-xs text-slate-400">{flight.aircraftType || "--"}</p>
        </div>
        <span className="rounded-full border border-slate-600 bg-slate-800/80 px-2 py-1 text-[11px] text-slate-200">
          {flight.status || "Scheduled"}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-300">
        <p><span className="text-slate-500">Origin:</span> {flight.origin || "--"}</p>
        <p><span className="text-slate-500">Destination:</span> {flight.destination || "--"}</p>
        <p><span className="text-slate-500">Scheduled:</span> {flight.scheduledTime || "--:--"}</p>
        <p><span className="text-slate-500">Estimated:</span> {flight.estimatedTime || "--:--"}</p>
        <p><span className="text-slate-500">Terminal:</span> {flight.terminal || "--"}</p>
        <p><span className="text-slate-500">Gate:</span> {flight.gate || "--"}</p>
      </div>

      <div className="mt-3">
        <button
          type="button"
          onClick={() => onClaim(flight)}
          disabled={!canClaim}
          className="min-h-10 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {canClaim ? "Claim Flight" : "Claimed"}
        </button>
      </div>
    </article>
  );
}

FlightCard.propTypes = {
  flight: PropTypes.shape({
    id: PropTypes.string,
    flightNumber: PropTypes.string,
    destination: PropTypes.string,
    origin: PropTypes.string,
    scheduledTime: PropTypes.string,
    estimatedTime: PropTypes.string,
    status: PropTypes.string,
    aircraftType: PropTypes.string,
    terminal: PropTypes.string,
    gate: PropTypes.string,
  }).isRequired,
  onClaim: PropTypes.func.isRequired,
  canClaim: PropTypes.bool,
};
