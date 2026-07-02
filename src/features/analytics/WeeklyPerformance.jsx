export default function WeeklyPerformance({ weeks, selectedWeek, onSelectWeek }) {
  return (
    <section className="ops-panel rounded-2xl p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-slate-100">Weekly View</h3>
        <span className="text-xs text-slate-400">{weeks.length} weeks</span>
      </div>

      {weeks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-700 p-4 text-sm text-slate-400">
          No weekly data available.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {weeks.map((week) => {
            const isActive = week.key === selectedWeek;
            return (
              <button
                key={week.key}
                type="button"
                onClick={() => onSelectWeek(week.key)}
                className={`min-h-16 rounded-xl border p-3 text-left transition ${
                  isActive
                    ? "border-emerald-400 bg-emerald-500/10"
                    : "border-slate-700 bg-slate-900/60 hover:border-slate-500"
                }`}
              >
                <p className="text-xs uppercase tracking-[0.14em] text-slate-400">{week.label}</p>
                <p className="mt-1 text-base font-semibold text-slate-100">{week.jobs} Jobs</p>
                <p className="text-xs text-slate-300">{week.hours.toFixed(1)}h • {week.daysWorked} active days</p>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}