import PropTypes from "prop-types";

export default function ActivityCard({ 
  type, 
  title, 
  description, 
  time, 
  icon,
  status = "info"
}) {
  const getStatusColor = () => {
    switch(status) {
      case "success": return "bg-green-500/20 border-l-4 border-green-500";
      case "warning": return "bg-amber-500/20 border-l-4 border-amber-500";
      case "error": return "bg-red-500/20 border-l-4 border-red-500";
      default: return "bg-blue-500/20 border-l-4 border-blue-500";
    }
  };

  const getIconColor = () => {
    switch(status) {
      case "success": return "text-green-400";
      case "warning": return "text-amber-400";
      case "error": return "text-red-400";
      default: return "text-blue-400";
    }
  };

  return (
    <div className={`
      p-4 rounded-lg border border-slate-700 
      ${getStatusColor()} transition-all duration-200
    `}>
      <div className="flex items-start gap-3">
        {icon && (
          <div className={`text-2xl ${getIconColor()} flex-shrink-0`}>
            {icon}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-white text-sm">{title}</p>
              {description && (
                <p className="text-slate-400 text-xs mt-1">{description}</p>
              )}
            </div>
            {type && (
              <span className="px-2 py-1 bg-slate-800 rounded text-xs font-medium text-slate-200 flex-shrink-0">
                {type}
              </span>
            )}
          </div>
          {time && (
            <p className="text-slate-500 text-xs mt-2">{time}</p>
          )}
        </div>
      </div>
    </div>
  );
}

ActivityCard.propTypes = {
  type: PropTypes.string,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  time: PropTypes.string,
  icon: PropTypes.node,
  status: PropTypes.oneOf(["success", "warning", "error", "info"])
};
