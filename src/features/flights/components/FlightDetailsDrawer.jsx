import PropTypes from "prop-types";

export default function FlightDetailsDrawer({ flight, open, onClose, onAddToShift, isInShift }) {
  if (!open || !flight) return null;

  return (
    <div className="fixed inset-0 z-40">
      <button
        type="button"
        aria-label="Close flight details"
        className="absolute inset-0 bg-slate-950/65"
        onClick={onClose}
      />

      <aside className="absolute bottom-0 left-0 right-0 max-h-[86vh] overflow-y-auto rounded-t-2xl border border-slate-700 bg-slate-950 p-4 shadow-2xl md:bottom-0 md:left-auto md:right-0 md:top-0 md:max-h-none md:w-[420px] md:rounded-none md:border-l">
        <div className="mb-4 flex items-start justify-between gap-3 border-b border-slate-700 pb-3">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Flight Details</p>
            <h3 className="text-xl font-semibold text-slate-100">{flight.flightNumber}</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onAddToShift(flight)}
              disabled={isInShift}
              className="rounded-lg bg-sky-600 px-3 py-1.5 text-sm text-white disabled:cursor-not-allowed disabled:bg-slate-700"
            >
              {isInShift ? "In My Shift" : "Add to My Shift"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-800"
            >
              Close
            </button>
          </div>
        </div>

        <dl className="space-y-3 text-sm">
          <DetailRow label="Flight Number" value={flight.flightNumber} />
          <DetailRow label="Aircraft Registration" value={flight.aircraftRegistration} />
          <DetailRow label="Aircraft Type" value={flight.aircraftType} />
          <DetailRow label="Arrival/Departure" value={flight.movement} />
          <DetailRow label="Origin" value={flight.origin} />
          <DetailRow label="Destination" value={flight.destination} />
          <DetailRow label="Scheduled Time" value={flight.scheduledTime} />
          <DetailRow label="Status" value={flight.status} />
          <DetailRow label="Stand" value={flight.stand} />
        </dl>
      </aside>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-3">
      <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">{label}</dt>
      <dd className="mt-1 font-medium text-slate-100">{value}</dd>
    </div>
  );
}

DetailRow.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};

FlightDetailsDrawer.propTypes = {
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
  }),
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onAddToShift: PropTypes.func.isRequired,
  isInShift: PropTypes.bool,
};
