import PropTypes from "prop-types";

export default function FlightRadarPreview({ flights }) {
  return (
    <section className="ops-panel rounded-2xl p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-slate-100">Preview Flights</h3>
        <span className="text-xs text-slate-400">{flights.length}</span>
      </div>

      {flights.length === 0 ? (
        <p className="text-sm text-slate-400">No flights match current filters.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-[980px] text-xs text-slate-200">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400">
                <th className="px-2 py-2 text-left">Flight Number</th>
                <th className="px-2 py-2 text-left">Airline</th>
                <th className="px-2 py-2 text-left">Registration</th>
                <th className="px-2 py-2 text-left">Aircraft</th>
                <th className="px-2 py-2 text-left">Origin</th>
                <th className="px-2 py-2 text-left">Destination</th>
                <th className="px-2 py-2 text-left">Arrival/Departure</th>
                <th className="px-2 py-2 text-left">Scheduled Time</th>
                <th className="px-2 py-2 text-left">Estimated Time</th>
                <th className="px-2 py-2 text-left">Status</th>
                <th className="px-2 py-2 text-left">Terminal</th>
                <th className="px-2 py-2 text-left">Gate</th>
                <th className="px-2 py-2 text-left">Stand</th>
                <th className="px-2 py-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {flights.slice(0, 200).map((flight) => (
                <tr key={flight.id} className="border-b border-slate-800/60">
                  <td className="px-2 py-2">{flight.flightNumber || "--"}</td>
                  <td className="px-2 py-2">{flight.airline || "--"}</td>
                  <td className="px-2 py-2">{flight.registration || "--"}</td>
                  <td className="px-2 py-2">{flight.aircraft || flight.aircraftType || "--"}</td>
                  <td className="px-2 py-2">{flight.origin || "--"}</td>
                  <td className="px-2 py-2">{flight.destination || "--"}</td>
                  <td className="px-2 py-2">{flight.type || flight.movement || "--"}</td>
                  <td className="px-2 py-2">{flight.scheduledTime || "--"}</td>
                  <td className="px-2 py-2">{flight.estimatedTime || "--"}</td>
                  <td className="px-2 py-2">{flight.status || "--"}</td>
                  <td className="px-2 py-2">{flight.terminal || "--"}</td>
                  <td className="px-2 py-2">{flight.gate || "--"}</td>
                  <td className="px-2 py-2">{flight.stand || "--"}</td>
                  <td className="px-2 py-2">{flight.date || "--"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

FlightRadarPreview.propTypes = {
  flights: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      flightNumber: PropTypes.string,
      airline: PropTypes.string,
      registration: PropTypes.string,
      aircraft: PropTypes.string,
      aircraftType: PropTypes.string,
      origin: PropTypes.string,
      destination: PropTypes.string,
      type: PropTypes.string,
      movement: PropTypes.string,
      scheduledTime: PropTypes.string,
      estimatedTime: PropTypes.string,
      status: PropTypes.string,
      terminal: PropTypes.string,
      gate: PropTypes.string,
      stand: PropTypes.string,
      date: PropTypes.string,
    })
  ).isRequired,
};
