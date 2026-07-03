import PropTypes from "prop-types";
import FlightStatusBadge from "./FlightStatusBadge.jsx";

export default function LiveFlightCard({ flight }) {
  const movement = String(flight.movement || flight.type || "Departure");

  return (
    <article className="rounded-2xl border border-slate-700 bg-slate-900/55 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xl font-semibold text-slate-100">{flight.flightNumber || "Unknown"}</p>
          <p className="text-xs text-slate-400">{flight.airline || "TUI Airways"}</p>
          <p className="mt-1 text-xs text-slate-300">{movement}</p>
        </div>
        <FlightStatusBadge status={flight.status} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-slate-200">
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Origin</p>
          <p className="mt-1 font-medium">{flight.origin || "--"}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Destination</p>
          <p className="mt-1 font-medium">{flight.destination || "--"}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Scheduled</p>
          <p className="mt-1 font-medium">{flight.scheduledTime || "--:--"}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Estimated</p>
          <p className="mt-1 font-medium">{flight.estimatedTime || "--:--"}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-700 pt-3 text-xs text-slate-400">
        <span>Terminal {flight.terminal || "--"}</span>
        <span>Gate {flight.gate || "--"}</span>
      </div>
    </article>
  );
}

LiveFlightCard.propTypes = {
  flight: PropTypes.shape({
    id: PropTypes.string,
    flightNumber: PropTypes.string,
    airline: PropTypes.string,
    movement: PropTypes.string,
    type: PropTypes.string,
    origin: PropTypes.string,
    destination: PropTypes.string,
    scheduledTime: PropTypes.string,
    estimatedTime: PropTypes.string,
    status: PropTypes.string,
    terminal: PropTypes.string,
    gate: PropTypes.string,
  }).isRequired,
};
