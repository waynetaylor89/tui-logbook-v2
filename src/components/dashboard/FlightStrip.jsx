import PropTypes from "prop-types";

export default function FlightStrip({ flight }) {
  const statusColor = {
    boarding: "text-amber-300 bg-amber-500/15 border-amber-400/40",
    scheduled: "text-sky-300 bg-sky-500/15 border-sky-400/40",
    arrived: "text-emerald-300 bg-emerald-500/15 border-emerald-400/40",
    departed: "text-violet-300 bg-violet-500/15 border-violet-400/40",
  };

  const badgeStyle = statusColor[flight.status.toLowerCase()] || "text-slate-200 bg-slate-700/50 border-slate-600";

  return (
    <li className="rounded-xl border border-slate-700 bg-slate-900/40 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-slate-100">{flight.flightNumber}</p>
        <span className={`rounded-full border px-2 py-1 text-[11px] font-medium capitalize ${badgeStyle}`}>
          {flight.status}
        </span>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-300">
        <p>{flight.time}</p>
        <p className="text-right">Stand {flight.stand}</p>
        <p className="col-span-2 truncate text-slate-400">{flight.route} • {flight.aircraft}</p>
      </div>
    </li>
  );
}

FlightStrip.propTypes = {
  flight: PropTypes.shape({
    flightNumber: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    time: PropTypes.string.isRequired,
    stand: PropTypes.string.isRequired,
    route: PropTypes.string.isRequired,
    aircraft: PropTypes.string.isRequired,
  }).isRequired,
};
