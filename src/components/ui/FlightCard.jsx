import PropTypes from "prop-types";

export default function FlightCard({ 
  flightNumber, 
  aircraft, 
  status, 
  time, 
  stand,
  destination,
  size = "md"
}) {
  const getStatusColor = () => {
    switch(status?.toLowerCase()) {
      case "scheduled": return "bg-blue-500/20 border-blue-500 text-blue-200";
      case "boarding": return "bg-amber-500/20 border-amber-500 text-amber-200";
      case "departed": return "bg-green-500/20 border-green-500 text-green-200";
      case "arrived": return "bg-slate-500/20 border-slate-500 text-slate-200";
      default: return "bg-slate-500/20 border-slate-500 text-slate-200";
    }
  };

  const getStatusIcon = () => {
    switch(status?.toLowerCase()) {
      case "scheduled": return "📅";
      case "boarding": return "👥";
      case "departed": return "🛫";
      case "arrived": return "🛬";
      default: return "✈️";
    }
  };

  return (
    <div className={`
      p-4 rounded-xl bg-slate-800 border border-slate-700 
      hover:border-slate-600 transition-all duration-200
      ${size === "lg" ? "p-6" : ""}
    `}>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-lg font-bold text-white">{flightNumber}</p>
            <p className="text-sm text-slate-400">{aircraft}</p>
          </div>
          <div className={`text-2xl ${getStatusColor()} px-3 py-1 rounded-lg border`}>
            {getStatusIcon()}
          </div>
        </div>

        {/* Status Badge */}
        <div className={`inline-block px-3 py-1 rounded-lg border text-sm font-semibold ${getStatusColor()}`}>
          {status}
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-3 pt-2 text-sm">
          <div>
            <p className="text-slate-500 text-xs uppercase">Time</p>
            <p className="text-white font-semibold">{time}</p>
          </div>
          <div>
            <p className="text-slate-500 text-xs uppercase">Stand</p>
            <p className="text-white font-semibold">{stand}</p>
          </div>
          {destination && (
            <div className="col-span-2">
              <p className="text-slate-500 text-xs uppercase">Destination</p>
              <p className="text-white font-semibold">{destination}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

FlightCard.propTypes = {
  flightNumber: PropTypes.string.isRequired,
  aircraft: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  time: PropTypes.string.isRequired,
  stand: PropTypes.string.isRequired,
  destination: PropTypes.string,
  size: PropTypes.oneOf(["md", "lg"])
};
