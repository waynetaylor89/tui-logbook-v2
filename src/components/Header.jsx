import PropTypes from "prop-types";
import { memo } from "react";

const Header = memo(function Header({ fleetCount, currentUser, darkMode }) {
  const dayLabel = new Date().toLocaleDateString(undefined, {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });

  return (
    <div className={`ops-panel rounded-2xl p-4 sm:p-5 ${darkMode ? "" : "bg-slate-50"}`}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">TUI Ground Control</p>
          <h1 className="mt-1 text-xl font-semibold text-slate-100 sm:text-2xl">Airport Operations Interface</h1>
          <div className="mt-1 text-sm text-slate-400">
            {fleetCount} aircraft available in your active roster
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-3">
          <div className="ops-pill rounded-xl px-3 py-2 text-xs text-slate-200 sm:text-sm">
            Agent: {currentUser}
          </div>
          <div className="ops-pill rounded-xl px-3 py-2 text-xs text-slate-200 sm:text-sm">{dayLabel}</div>
          <div className="ops-pill rounded-xl px-3 py-2 text-xs text-slate-200 sm:text-sm">
            {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      </div>
    </div>
  );
});

Header.propTypes = {
  fleetCount: PropTypes.number.isRequired,
  currentUser: PropTypes.string.isRequired,
  darkMode: PropTypes.bool,
};

export default Header;