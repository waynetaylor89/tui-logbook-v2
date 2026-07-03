import PropTypes from "prop-types";
import LiveFlightCard from "./LiveFlightCard.jsx";

export default function LiveFlightList({ flights }) {
  if ((flights || []).length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-700 p-8 text-center text-sm text-slate-400">
        No TUI flights available for today.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      {(flights || []).map((flight) => (
        <LiveFlightCard key={flight.id} flight={flight} />
      ))}
    </div>
  );
}

LiveFlightList.propTypes = {
  flights: PropTypes.arrayOf(PropTypes.object).isRequired,
};
