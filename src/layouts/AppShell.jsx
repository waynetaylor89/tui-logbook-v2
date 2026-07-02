import { NavLink, Outlet } from "react-router-dom";
import { useState } from "react";
import PropTypes from "prop-types";
import Header from "../components/Header.jsx";
import Breadcrumbs from "../components/Breadcrumbs.jsx";

const navClass = ({ isActive }) =>
  `px-3 py-1.5 rounded-lg font-medium text-sm transition-all duration-200 ${
    isActive 
      ? "bg-sky-700 text-white shadow-md" 
      : "bg-slate-50 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
  }`;

export default function AppShell({ fleetCount, currentUser, isAdmin, onLogout, darkMode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className={`min-h-screen bg-gradient-to-br ${darkMode ? 'from-slate-900 to-slate-800' : 'from-slate-50 to-sky-50'}`}>
      <div className="min-h-screen p-3 lg:p-6">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Mobile Navigation */}
          <div className={`lg:hidden rounded-2xl shadow-lg p-4 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
            <div className="flex justify-between items-center">
              <h1 className={`text-lg font-bold ${darkMode ? 'text-sky-400' : 'text-sky-800'}`}>TUI Logbook</h1>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`p-2 rounded-lg ${darkMode ? 'bg-slate-700 hover:bg-slate-600 text-sky-400' : 'bg-sky-100 hover:bg-sky-200 text-sky-700'}`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
            
            {isMobileMenuOpen && (
              <div className="mt-4 space-y-2">
                <NavLink to="/" end className={navClass} onClick={() => setIsMobileMenuOpen(false)}>
                  🏠 Home
                </NavLink>
                <NavLink to="/movements" className={navClass} onClick={() => setIsMobileMenuOpen(false)}>
                  ✈️ Aircraft Movements
                </NavLink>
                <NavLink to="/records" className={navClass} onClick={() => setIsMobileMenuOpen(false)}>
                  📋 Movement Records
                </NavLink>
                {isAdmin && (
                  <NavLink to="/users" className={navClass} onClick={() => setIsMobileMenuOpen(false)}>
                    👥 Manage Users
                  </NavLink>
                )}
                <NavLink to="/settings" className={navClass} onClick={() => setIsMobileMenuOpen(false)}>
                  ⚙️ Settings
                </NavLink>
              </div>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className={`hidden lg:block rounded-2xl shadow-lg p-4 flex flex-wrap gap-2 border ${darkMode ? 'bg-slate-800/90 backdrop-blur-sm border-slate-700' : 'bg-white/90 backdrop-blur-sm border-sky-100'}`}>
            <NavLink to="/" end className={navClass}>
              🏠 Home
            </NavLink>
            <NavLink to="/movements" className={navClass}>
              ✈️ Aircraft Movements
            </NavLink>
            <NavLink to="/records" className={navClass}>
              📋 Movement Records
            </NavLink>
            {isAdmin && (
              <NavLink to="/users" className={navClass}>
                👥 Manage Users
              </NavLink>
            )}
            <NavLink to="/settings" className={navClass}>
              ⚙️ Settings
            </NavLink>
          </div>

          <Breadcrumbs />
          <Header fleetCount={fleetCount} currentUser={currentUser} isAdmin={isAdmin} onLogout={onLogout} />
          <Outlet />
        </div>
      </div>
    </div>
  );
}

AppShell.propTypes = {
  fleetCount: PropTypes.number.isRequired,
  currentUser: PropTypes.string.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  onLogout: PropTypes.func.isRequired,
  darkMode: PropTypes.bool,
};
