export default function StandLeaderboard({ mostUsedStand, heatmapData }) {
  return (
    <section className="ops-panel rounded-2xl p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-slate-100">Stand Statistics</h3>
        <span className="rounded-lg border border-slate-700 bg-slate-900/50 px-2 py-1 text-xs text-slate-300">
          Most Used: {mostUsedStand || "--"}
        </span>
      </div>

      <p className="mt-3 text-xs uppercase tracking-[0.14em] text-slate-400">Stand Heatmap Data</p>
      {heatmapData.length === 0 ? (
        <div className="mt-2 rounded-xl border border-dashed border-slate-700 p-4 text-sm text-slate-400">
          No stand heatmap data.
        </div>
      ) : (
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-6">
          {heatmapData.slice(0, 18).map((item) => {
            const intensity = Math.min(100, Math.round((item.count / (heatmapData[0]?.count || 1)) * 100));
            return (
              <article
                key={item.stand}
                className="rounded-xl border border-slate-700 p-2"
                style={{ backgroundColor: `rgba(34, 211, 238, ${0.12 + intensity / 180})` }}
              >
                <p className="text-xs text-slate-100">{item.stand}</p>
                <p className="text-sm font-semibold text-slate-100">{item.count}</p>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}