import PropTypes from "prop-types";

export default function AircraftHistory({ recentFlights }) {
  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900/55 p-4">
      <h4 className="text-sm font-semibold text-slate-200">Recent Flights</h4>
      <ul className="mt-3 space-y-2">
        {(recentFlights || []).map((flight) => (
          <li key={flight.id} className="rounded-xl border border-slate-700 bg-slate-950/45 p-3 text-sm text-slate-200">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium">{flight.flightNumber || "Unknown"}</span>
              <span className="text-xs text-slate-400">{flight.time || "--:--"}</span>
            </div>
            <p className="mt-1 text-xs text-slate-300">
              {(flight.arrivalDeparture || "Movement")} • {flight.origin || "?"} {" -> "} {flight.destination || "?"}
            </p>
            <p className="mt-1 text-xs text-slate-500">Stand {flight.stand || "--"} • {flight.status || "Queued"}</p>
          </li>
        ))}
        {(recentFlights || []).length === 0 ? (
          <li className="rounded-xl border border-dashed border-slate-700 p-3 text-sm text-slate-400">
            No recent flights for this aircraft.
          </li>
        ) : null}
      </ul>
    </section>
  );
}

AircraftHistory.propTypes = {
  recentFlights: PropTypes.arrayOf(PropTypes.object),
};
