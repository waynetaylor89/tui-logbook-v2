import { NavLink, Outlet } from "react-router-dom";
import Header from "../components/Header.jsx";

const navClass = ({ isActive }) =>
  `px-3 py-2 rounded-xl font-semibold text-sm ${
    isActive ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"
  }`;

export default function AppShell({ fleetCount, currentUser, isAdmin, onLogout }) {
  return (
    <div className="min-h-screen bg-sky-200">
      <div className="min-h-screen bg-sky-100 p-3 lg:p-6">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="bg-white rounded-2xl shadow-lg p-4 flex flex-nowrap gap-2 overflow-x-auto">
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

          <Header fleetCount={fleetCount} currentUser={currentUser} isAdmin={isAdmin} onLogout={onLogout} />
          <Outlet />
        </div>
      </div>
    </div>
  );
}
