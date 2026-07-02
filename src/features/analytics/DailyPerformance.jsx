export default function DailyPerformance({ days, selectedDate, onSelectDate }) {
  const visible = (days || []).slice(0, 14);

  return (
    <section className="ops-panel rounded-2xl p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-slate-100">Daily View</h3>
        <span className="text-xs text-slate-400">Last {visible.length} days</span>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-700 p-4 text-sm text-slate-400">
          No daily activity yet.
        </div>
      ) : (
        <div className="flex snap-x gap-3 overflow-x-auto pb-1">
          {visible.map((day) => {
            const active = day.date === selectedDate;
            return (
              <button
                key={day.date}
                type="button"
                onClick={() => onSelectDate(day.date)}
                className={`min-h-24 min-w-[170px] snap-start rounded-xl border p-3 text-left transition ${
                  active
                    ? "border-cyan-400 bg-cyan-500/15"
                    : "border-slate-700 bg-slate-900/60 hover:border-slate-500"
                }`}
              >
                <p className="text-xs uppercase tracking-[0.14em] text-slate-400">{day.label}</p>
                <p className="mt-2 text-xl font-semibold text-slate-100">{day.jobs}</p>
                <p className="text-xs text-slate-300">Jobs • {day.hours.toFixed(1)}h</p>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}