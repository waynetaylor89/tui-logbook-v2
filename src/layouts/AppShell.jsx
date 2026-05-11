import { NavLink, Outlet } from "react-router-dom";
import { useState } from "react";
import Header from "../components/Header.jsx";
import Breadcrumbs from "../components/Breadcrumbs.jsx";

const navClass = ({ isActive }) =>
  `px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
    isActive 
      ? "bg-sky-700 text-white shadow-md" 
      : "bg-slate-50 text-slate-700 hover:bg-slate-100"
  }`;

export default function AppShell({ fleetCount, currentUser, isAdmin, onLogout }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50">
      <div className="min-h-screen p-3 lg:p-6">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Mobile Navigation */}
          <div className="lg:hidden bg-white rounded-2xl shadow-lg p-4">
            <div className="flex justify-between items-center">
              <h1 className="text-lg font-bold text-sky-800">TUI Logbook</h1>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg bg-sky-100 hover:bg-sky-200 text-sky-700"
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
                  Home
                </NavLink>
                <NavLink to="/movements" className={navClass} onClick={() => setIsMobileMenuOpen(false)}>
                  Aircraft Movements
                </NavLink>
                <NavLink to="/records" className={navClass} onClick={() => setIsMobileMenuOpen(false)}>
                  Movement Records
                </NavLink>
                {isAdmin && (
                  <NavLink to="/users" className={navClass} onClick={() => setIsMobileMenuOpen(false)}>
                    Manage Users
                  </NavLink>
                )}
              </div>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:block bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4 flex flex-wrap gap-2 border border-sky-100">
            <NavLink to="/" end className={navClass}>
              Home
            </NavLink>
            <NavLink to="/movements" className={navClass}>
              Aircraft Movements
            </NavLink>
            <NavLink to="/records" className={navClass}>
              Movement Records
            </NavLink>
            {isAdmin && (
              <NavLink to="/users" className={navClass}>
                Manage Users
              </NavLink>
            )}
          </div>

          <Breadcrumbs />
          <Header fleetCount={fleetCount} currentUser={currentUser} isAdmin={isAdmin} onLogout={onLogout} />
          <Outlet />
        </div>
      </div>
    </div>
  );
}
