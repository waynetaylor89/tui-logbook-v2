import PropTypes from "prop-types";

export default function ShiftInfo({ 
  status = "active",
  startTime = "08:00",
  endTime = "16:00",
  hoursRemaining = 6
}) {
  const getStatusColor = () => {
    switch(status) {
      case "active": return "bg-green-500/20 border-green-500 text-green-200";
      case "break": return "bg-amber-500/20 border-amber-500 text-amber-200";
      case "ended": return "bg-slate-500/20 border-slate-500 text-slate-200";
      default: return "bg-blue-500/20 border-blue-500 text-blue-200";
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">My Shift</h3>
          <div className={`px-3 py-1 rounded-lg border text-sm font-semibold ${getStatusColor()}`}>
            {status === "active" ? "🟢" : status === "break" ? "🟡" : "🔴"} {status.charAt(0).toUpperCase() + status.slice(1)}
          </div>
        </div>

        {/* Times */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-700/50 rounded-lg p-3">
            <p className="text-slate-400 text-xs uppercase font-semibold">Start</p>
            <p className="text-white text-xl font-bold">{startTime}</p>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-3">
            <p className="text-slate-400 text-xs uppercase font-semibold">End</p>
            <p className="text-white text-xl font-bold">{endTime}</p>
          </div>
        </div>

        {/* Time Remaining */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs uppercase font-semibold">Hours Remaining</p>
              <p className="text-blue-200 text-lg font-bold">{hoursRemaining}h</p>
            </div>
            <div className="text-3xl">⏱️</div>
          </div>
        </div>
      </div>
    </div>
  );
}

ShiftInfo.propTypes = {
  status: PropTypes.oneOf(["active", "break", "ended"]),
  startTime: PropTypes.string,
  endTime: PropTypes.string,
  hoursRemaining: PropTypes.number
};
