export default function Header({ fleetCount, currentUser, isAdmin, onLogout }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Wayne's Tui Brake riding
        </h1>

        <div className="text-sm text-slate-500 mt-1">
          {fleetCount} aircraft loaded
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="text-sm font-medium text-slate-600">
          Welcome, {currentUser} {isAdmin && "(Admin)"}
        </div>
        <div className="text-sm font-medium text-slate-600">
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
}