import PropTypes from "prop-types";

const statusStyles = {
  Scheduled: "border-sky-400/40 bg-sky-500/15 text-sky-200",
  Boarding: "border-amber-400/40 bg-amber-500/15 text-amber-200",
  "Gate Open": "border-cyan-400/40 bg-cyan-500/15 text-cyan-200",
  "Final Call": "border-orange-400/40 bg-orange-500/15 text-orange-200",
  Delayed: "border-rose-400/40 bg-rose-500/15 text-rose-200",
  Landed: "border-emerald-400/40 bg-emerald-500/15 text-emerald-200",
  Arrived: "border-emerald-400/40 bg-emerald-500/15 text-emerald-200",
};

const movementStyles = {
  Departure: "text-sky-300",
  Arrival: "text-emerald-300",
};

export default function FlightCard({ flight, onClaim }) {
  return (
    <button
      type="button"
      onClick={() => onClaim(flight)}
      disabled={flight.claimed}
      className="w-full rounded-2xl border border-slate-700 bg-slate-900/50 p-4 text-left transition-all hover:border-slate-500 hover:bg-slate-900/80 disabled:cursor-not-allowed disabled:border-emerald-500/50 disabled:bg-emerald-500/10"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-slate-100">{flight.flightNumber}</p>
          <p className="text-xs text-slate-400">{flight.aircraftRegistration}</p>
          <p className="text-xs text-slate-500">{flight.aircraftType}</p>
        </div>
        <span className={`rounded-full border px-2 py-1 text-[11px] font-medium ${statusStyles[flight.status] || "border-slate-600 bg-slate-700/50 text-slate-200"}`}>
          {flight.status}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Arrival/Departure</p>
          <p className={`font-medium ${movementStyles[flight.movement] || "text-slate-200"}`}>{flight.movement}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Time</p>
          <p className="font-medium text-slate-100">{flight.scheduledTime}</p>
        </div>
        <div className="col-span-2">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Destination</p>
          <p className="font-medium text-slate-200">
            {flight.destination}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-700 pt-3 text-xs text-slate-400">
        <span>Stand {flight.stand}</span>
        <span className={flight.claimed ? "text-emerald-300" : "text-sky-300"}>{flight.claimed ? "Claimed" : "Tap to claim"}</span>
      </div>
    </button>
  );
}

FlightCard.propTypes = {
  flight: PropTypes.shape({
    id: PropTypes.string.isRequired,
    flightNumber: PropTypes.string.isRequired,
    aircraftRegistration: PropTypes.string.isRequired,
    aircraftType: PropTypes.string.isRequired,
    movement: PropTypes.string.isRequired,
    origin: PropTypes.string.isRequired,
    destination: PropTypes.string.isRequired,
    scheduledTime: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    stand: PropTypes.string.isRequired,
    claimed: PropTypes.bool,
  }).isRequired,
  onClaim: PropTypes.func.isRequired,
};
