import PropTypes from "prop-types";
import { memo } from "react";

const Header = memo(function Header({ fleetCount, currentUser, isAdmin, onLogout, darkMode }) {
  return (
    <div className={`rounded-2xl shadow-lg p-4 flex justify-between items-center ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
      <div>
        <h1 className={`text-2xl font-bold ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
          Wayne's Tui Brake riding
        </h1>

        <div className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          {fleetCount} aircraft loaded
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
          Welcome, {currentUser} {isAdmin && "(Admin)"}
        </div>
        <div className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
          {new Date().toLocaleTimeString()}
        </div>
        <button
          onClick={onLogout}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
        >
          Logout
        </button>
      </div>
    </div>
  );
});

Header.propTypes = {
  fleetCount: PropTypes.number.isRequired,
  currentUser: PropTypes.string.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  onLogout: PropTypes.func.isRequired,
  darkMode: PropTypes.bool,
};

export default Header;