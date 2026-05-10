import FleetManager from "../components/FleetManager.jsx";
import StatsCards from "../components/StatsCards.jsx";

export default function HomePage({
  isAdmin,
  userSummary,
  stats,
  newReg,
  setNewReg,
  newType,
  setNewType,
  tuiAircraftTypes,
  handleAddAircraftToFleet,
  handleResetFleet,
}) {
  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800">Statistics Overview</h2>
          <div className="text-sm text-slate-500">Live movement tracking</div>
        </div>
        <StatsCards stats={stats} />
        {isAdmin && userSummary.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-800">User Movement Summary</h3>
                <div className="text-sm text-slate-500">Ranked by total movements logged.</div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm text-slate-700">
                <thead>
                  <tr>
                    <th className="px-4 py-3 font-medium text-slate-500">User</th>
                    <th className="px-4 py-3 font-medium text-slate-500">Movements</th>
                  </tr>
                </thead>
                <tbody>
                  {userSummary.map((row) => (
                    <tr key={row.username} className="border-t">
                      <td className="px-4 py-3">{row.username}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{row.movements}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <FleetManager
          newReg={newReg}
          setNewReg={setNewReg}
          newType={newType}
          setNewType={setNewType}
          tuiAircraftTypes={tuiAircraftTypes}
          addAircraftToFleet={handleAddAircraftToFleet}
          resetFleet={handleResetFleet}
        />
        <div className="hidden lg:block"></div>
      </div>
    </>
  );
}
