import { NavLink, Outlet } from "react-router-dom";
import { useState } from "react";
import PropTypes from "prop-types";
import Header from "../components/Header.jsx";
import Breadcrumbs from "../components/Breadcrumbs.jsx";
import InstallAppCard from "../components/InstallAppCard.jsx";
import UpdateAvailableBanner from "../components/UpdateAvailableBanner.jsx";

const navClass = ({ isActive }) => {
  const baseClasses = "flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200";
  if (isActive) {
    return `${baseClasses} bg-sky-500/20 text-sky-200 border border-sky-400/50`;
  }
  return `${baseClasses} text-slate-300 border border-transparent hover:border-slate-600 hover:bg-slate-800/70`;
};

export default function AppShell({ fleetCount, currentUser, darkMode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className={`min-h-screen ${darkMode ? "ops-grid-bg" : ""}`}>
      <div className="mx-auto min-h-screen max-w-7xl px-3 pb-24 pt-4 sm:px-5 lg:px-8 lg:pb-8 lg:pt-6">
        <div className="space-y-4">
          <div className="ops-panel ops-fade-in rounded-2xl p-4 lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Airport Operations</p>
                <p className="text-lg font-semibold text-slate-100">Ramp Dashboard</p>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-expanded={isMobileMenuOpen}
                aria-label="Toggle mobile menu"
                className="ops-pill min-h-11 rounded-xl px-3 py-2 text-sm text-slate-200"
              >
                {isMobileMenuOpen ? "Close" : "Menu"}
              </button>
            </div>

            {isMobileMenuOpen && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <NavLink to="/statistics" className={navClass} onClick={() => setIsMobileMenuOpen(false)}>
                  <span>Statistics</span>
                </NavLink>
                <NavLink to="/flights" className={navClass} onClick={() => setIsMobileMenuOpen(false)}>
                  <span>Flights</span>
                </NavLink>
                <NavLink to="/my-shift" className={navClass} onClick={() => setIsMobileMenuOpen(false)}>
                  <span>My Shift</span>
                </NavLink>
                <NavLink to="/fleet" className={navClass} onClick={() => setIsMobileMenuOpen(false)}>
                  <span>Fleet</span>
                </NavLink>
                <NavLink to="/timeline" className={navClass} onClick={() => setIsMobileMenuOpen(false)}>
                  <span>Timeline</span>
                </NavLink>
                <NavLink to="/calendar" className={navClass} onClick={() => setIsMobileMenuOpen(false)}>
                  <span>Calendar</span>
                </NavLink>
                <NavLink to="/import" className={navClass} onClick={() => setIsMobileMenuOpen(false)}>
                  <span>Import</span>
                </NavLink>
                <NavLink to="/settings" className={navClass} onClick={() => setIsMobileMenuOpen(false)}>
                  <span>Settings</span>
                </NavLink>
              </div>
            )}
          </div>

          <div className="hidden lg:flex lg:items-center lg:gap-2">
            <NavLink to="/statistics" className={navClass}>
              Statistics
            </NavLink>
            <NavLink to="/flights" className={navClass}>
              Flights
            </NavLink>
            <NavLink to="/my-shift" className={navClass}>
              My Shift
            </NavLink>
            <NavLink to="/fleet" className={navClass}>
              Fleet
            </NavLink>
            <NavLink to="/timeline" className={navClass}>
              Timeline
            </NavLink>
            <NavLink to="/calendar" className={navClass}>
              Calendar
            </NavLink>
            <NavLink to="/import" className={navClass}>
              Import
            </NavLink>
            <NavLink to="/settings" className={navClass}>
              Settings
            </NavLink>
          </div>

          <UpdateAvailableBanner />
          <InstallAppCard />
          <Breadcrumbs />
          <Header fleetCount={fleetCount} currentUser={currentUser} darkMode={darkMode} />
          <Outlet />

          <div className="fixed bottom-3 left-3 right-3 z-20 rounded-2xl border border-slate-700 bg-slate-950/85 p-2 backdrop-blur lg:hidden">
            <div className="grid grid-cols-6 gap-1">
              <NavLink to="/statistics" className={({ isActive }) => `${navClass({ isActive })} px-1 text-[11px]`}>Stats</NavLink>
              <NavLink to="/flights" className={({ isActive }) => `${navClass({ isActive })} px-1 text-[11px]`}>Board</NavLink>
              <NavLink to="/my-shift" className={({ isActive }) => `${navClass({ isActive })} px-1 text-[11px]`}>Shift</NavLink>
              <NavLink to="/fleet" className={({ isActive }) => `${navClass({ isActive })} px-1 text-[11px]`}>Fleet</NavLink>
              <NavLink to="/timeline" className={({ isActive }) => `${navClass({ isActive })} px-1 text-[11px]`}>Time</NavLink>
              <NavLink to="/calendar" className={({ isActive }) => `${navClass({ isActive })} px-1 text-[11px]`}>Cal</NavLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

AppShell.propTypes = {
  fleetCount: PropTypes.number.isRequired,
  currentUser: PropTypes.string.isRequired,
  darkMode: PropTypes.bool,
};
