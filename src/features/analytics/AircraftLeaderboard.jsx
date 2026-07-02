function LeaderRows({ title, rows }) {
  return (
    <article className="rounded-xl border border-slate-700 bg-slate-900/55 p-3">
      <p className="text-xs uppercase tracking-[0.14em] text-slate-400">{title}</p>
      <ol className="mt-2 space-y-2">
        {(rows || []).slice(0, 5).map((row, index) => (
          <li key={`${title}-${row.name}`} className="flex items-center justify-between gap-2 text-sm">
            <span className="text-slate-100">{index + 1}. {row.name}</span>
            <span className="text-slate-300">{row.count}</span>
          </li>
        ))}
        {(rows || []).length === 0 ? (
          <li className="text-sm text-slate-400">No data</li>
        ) : null}
      </ol>
    </article>
  );
}

export default function AircraftLeaderboard({
  mostWorkedRegistration,
  mostWorkedAircraftType,
  mostWorkedFleet,
  favouriteAircraft,
  registrationRows,
  typeRows,
  fleetRows,
}) {
  return (
    <section className="ops-panel rounded-2xl p-4 sm:p-5">
      <h3 className="text-lg font-semibold text-slate-100">Aircraft Statistics</h3>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi title="Most Worked Registration" value={mostWorkedRegistration || "--"} />
        <Kpi title="Most Worked Aircraft Type" value={mostWorkedAircraftType || "--"} />
        <Kpi title="Most Worked Fleet" value={mostWorkedFleet || "--"} />
        <Kpi title="Favourite Aircraft" value={favouriteAircraft || "--"} />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 lg:grid-cols-3">
        <LeaderRows title="Registrations" rows={registrationRows} />
        <LeaderRows title="Aircraft Types" rows={typeRows} />
        <LeaderRows title="Fleet Mix" rows={fleetRows} />
      </div>
    </section>
  );
}

function Kpi({ title, value }) {
  return (
    <article className="rounded-xl border border-slate-700 bg-slate-900/55 p-3">
      <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">{title}</p>
      <p className="mt-1 text-sm font-semibold text-slate-100">{value}</p>
    </article>
  );
}