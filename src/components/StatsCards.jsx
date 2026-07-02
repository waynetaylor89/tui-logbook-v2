import { AVIATION_COLORS } from "../config/logbookConfig.js";

const StatCard = ({ icon, title, value, trend, color, subtitle }) => (
  <div 
    className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-100 dark:border-slate-700"
    style={{ borderTop: `3px solid ${color}` }}
  >
    <div className="flex items-start justify-between mb-3">
      <div className="text-2xl">{icon}</div>
      {trend && (
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
          trend > 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
          trend < 0 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 
          'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
        }`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">{title}</div>
    <div className="text-3xl font-bold" style={{ color: color }}>
      {value}
    </div>
    {subtitle && (
      <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subtitle}</div>
    )}
  </div>
);

export default function StatsCards({ stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon="✈️"
        title="Aircraft Today"
        value={stats.aircraftToday || 0}
        trend={5}
        color={AVIATION_COLORS.accent}
        subtitle="Unique registrations"
      />
      
      <StatCard
        icon="🛬"
        title="Arrivals Today"
        value={stats.arrivalsToday || 0}
        trend={3}
        color={AVIATION_COLORS.success}
        subtitle="Tow & Power Moves"
      />
      
      <StatCard
        icon="🛫"
        title="Departures Today"
        value={stats.departuresToday || 0}
        trend={-2}
        color={AVIATION_COLORS.primary}
        subtitle="Tow & Power Moves"
      />
      
      <StatCard
        icon="📊"
        title="Total Movements"
        value={stats.totalMovements || 0}
        trend={8}
        color={AVIATION_COLORS.accent}
        subtitle="All time"
      />
      
      <StatCard
        icon="📍"
        title="Favourite Stand"
        value={stats.topStands?.[0]?.[0] || "N/A"}
        trend={null}
        color={AVIATION_COLORS.warning}
        subtitle={`${stats.topStands?.[0]?.[1] || 0} uses`}
      />
      
      <StatCard
        icon="🏆"
        title="Top Aircraft"
        value={stats.topAircraft?.[0]?.[0]?.split(" - ")[0] || "N/A"}
        trend={null}
        color={AVIATION_COLORS.primary}
        subtitle={`${stats.topAircraft?.[0]?.[1] || 0} movements`}
      />
      
      <StatCard
        icon="🔥"
        title="Current Streak"
        value={`${stats.currentStreak || 0} days`}
        trend={null}
        color={AVIATION_COLORS.danger}
        subtitle="Consecutive logging"
      />
      
      <StatCard
        icon="📅"
        title="This Month"
        value={stats.monthlyMovements || 0}
        trend={12}
        color={AVIATION_COLORS.success}
        subtitle="Movements recorded"
      />
    </div>
  );
}