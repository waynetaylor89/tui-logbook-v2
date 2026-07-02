import FleetManager from "../components/FleetManager.jsx";
import StatsCards from "../components/StatsCards.jsx";
import { MovementStatsChart, DailyTrendChart } from "../components/Charts.jsx";

export default function HomePage({
  isAdmin,
  userSummary,
  stats,
  history,
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
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            📊 Statistics Overview
          </h2>
          <div className="text-sm text-slate-500 dark:text-slate-400">Live movement tracking</div>
        </div>
        <StatsCards stats={stats} />
        
        {/* Charts Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              📈 Analytics Dashboard
            </h2>
            <div className="text-sm text-slate-500 dark:text-slate-400">Visual insights from your data</div>
          </div>
          
          <MovementStatsChart stats={stats} />
          
          {isAdmin && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <DailyTrendChart history={history} days={7} />
              <DailyTrendChart history={history} days={30} />
            </div>
          )}
        </div>
        
        {isAdmin && userSummary.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  👥 User Movement Summary
                </h3>
                <div className="text-sm text-slate-500 dark:text-slate-400">Ranked by total movements logged.</div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm text-slate-700 dark:text-slate-300">
                <thead>
                  <tr>
                    <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">User</th>
                    <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Movements</th>
                  </tr>
                </thead>
                <tbody>
                  {userSummary.map((row) => (
                    <tr key={row.username} className="border-t dark:border-slate-700">
                      <td className="px-4 py-3">{row.username}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-100">{row.movements}</td>
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
