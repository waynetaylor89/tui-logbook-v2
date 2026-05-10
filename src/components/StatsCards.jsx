export default function StatsCards({ stats }) {
  const cardCols = stats.topUsers && stats.topUsers.length > 0 ? "md:grid-cols-4" : "md:grid-cols-3";

  return (
    <div className={`grid grid-cols-1 ${cardCols} gap-4`}>

      <div className="bg-white rounded-2xl shadow-lg p-4">
        <div className="text-sm text-slate-500 mb-1">
          Total Movements
        </div>

        <div className="text-4xl font-bold text-blue-600">
          {stats.totalMovements}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-4">
        <div className="text-sm text-slate-500 mb-3">
          Top Aircraft
        </div>

        <div className="space-y-2 text-sm">
          {stats.topAircraft.map(([name, count]) => (
            <div key={name} className="flex justify-between">
              <span className="truncate mr-2">{name}</span>
              <span className="font-bold text-blue-600">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-4">
        <div className="text-sm text-slate-500 mb-3">
          Most Used Stands
        </div>

        <div className="space-y-2 text-sm">
          {stats.topStands.map(([name, count]) => (
            <div key={name} className="flex justify-between">
              <span>{name}</span>
              <span className="font-bold text-emerald-600">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {stats.topUsers && stats.topUsers.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <div className="text-sm text-slate-500 mb-3">
            Top Users
          </div>

          <div className="space-y-2 text-sm">
            {stats.topUsers.map(([name, count]) => (
              <div key={name} className="flex justify-between">
                <span>{name}</span>
                <span className="font-bold text-blue-600">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.userCount > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <div className="text-sm text-slate-500 mb-1">
            Registered Users
          </div>
          <div className="text-4xl font-bold text-slate-800">
            {stats.userCount}
          </div>
        </div>
      )}
    </div>
  );
}