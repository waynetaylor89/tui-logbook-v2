export default function MonthlyPerformance({ months, selectedMonth, onSelectMonth }) {
  return (
    <section className="ops-panel rounded-2xl p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-slate-100">Monthly View</h3>
        <span className="text-xs text-slate-400">{months.length} months</span>
      </div>

      {months.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-700 p-4 text-sm text-slate-400">
          No monthly activity yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {months.map((month) => {
            const active = month.key === selectedMonth;
            return (
              <button
                key={month.key}
                type="button"
                onClick={() => onSelectMonth(month.key)}
                className={`min-h-16 rounded-xl border p-3 text-left transition ${
                  active
                    ? "border-amber-400 bg-amber-500/10"
                    : "border-slate-700 bg-slate-900/60 hover:border-slate-500"
                }`}
              >
                <p className="text-xs uppercase tracking-[0.14em] text-slate-400">{month.label}</p>
                <p className="mt-1 text-base font-semibold text-slate-100">{month.jobs} Jobs</p>
                <p className="text-xs text-slate-300">Avg turnaround {month.avgTurnaround.toFixed(1)} min</p>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}