import PropTypes from "prop-types";

export default function StatCard({ 
  icon, 
  label, 
  value, 
  unit = "", 
  change = null,
  trend = "neutral",
  size = "md"
}) {
  const sizes = {
    sm: "p-3",
    md: "p-4",
    lg: "p-6"
  };

  const textSizes = {
    sm: { icon: "text-2xl", value: "text-xl", label: "text-xs", unit: "text-xs" },
    md: { icon: "text-3xl", value: "text-2xl", label: "text-sm", unit: "text-xs" },
    lg: { icon: "text-4xl", value: "text-3xl", label: "text-base", unit: "text-sm" }
  };

  const getTrendColor = () => {
    switch(trend) {
      case "up": return "text-green-400";
      case "down": return "text-red-400";
      default: return "text-blue-400";
    }
  };

  return (
    <div className={`
      ${sizes[size]} 
      bg-gradient-to-br from-slate-800 to-slate-900 
      rounded-2xl border border-slate-700 
      hover:border-slate-600 transition-all duration-200
    `}>
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className={`${textSizes[size].icon} ${getTrendColor()}`}>
            {icon}
          </div>
          {change && (
            <div className={`text-xs font-semibold ${getTrendColor()} bg-slate-800/50 px-2 py-1 rounded`}>
              {change}
            </div>
          )}
        </div>
        
        <div>
          <p className={`${textSizes[size].label} text-slate-400 font-medium uppercase tracking-wide`}>
            {label}
          </p>
          <div className="flex items-baseline gap-1">
            <p className={`${textSizes[size].value} text-white font-bold`}>
              {value}
            </p>
            {unit && (
              <p className={`${textSizes[size].unit} text-slate-500`}>
                {unit}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

StatCard.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  unit: PropTypes.string,
  change: PropTypes.string,
  trend: PropTypes.oneOf(["up", "down", "neutral"]),
  size: PropTypes.oneOf(["sm", "md", "lg"])
};
