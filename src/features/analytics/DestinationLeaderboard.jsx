export default function DestinationLeaderboard({
  favouriteDestination,
  countriesVisited,
  airportCount,
  arrivalVsDeparture,
  destinationRows,
}) {
  return (
    <section className="ops-panel rounded-2xl p-4 sm:p-5">
      <h3 className="text-lg font-semibold text-slate-100">Destination Statistics</h3>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat title="Favourite Destination" value={favouriteDestination || "--"} />
        <Stat title="Countries Visited" value={countriesVisited} />
        <Stat title="Airport Count" value={airportCount} />
        <Stat
          title="Arrival vs Departure"
          value={`${arrivalVsDeparture.arrivals} / ${arrivalVsDeparture.departures}`}
        />
      </div>

      <div className="mt-3 rounded-xl border border-slate-700 bg-slate-900/55 p-3">
        <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Top Destinations</p>
        <ol className="mt-2 space-y-2">
          {(destinationRows || []).slice(0, 8).map((row, index) => (
            <li key={row.name} className="flex items-center justify-between gap-2 text-sm">
              <span className="text-slate-100">{index + 1}. {row.name}</span>
              <span className="text-slate-300">{row.count}</span>
            </li>
          ))}
          {(destinationRows || []).length === 0 ? (
            <li className="text-sm text-slate-400">No destination data.</li>
          ) : null}
        </ol>
      </div>
    </section>
  );
}

function Stat({ title, value }) {
  return (
    <article className="rounded-xl border border-slate-700 bg-slate-900/55 p-3">
      <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">{title}</p>
      <p className="mt-1 text-sm font-semibold text-slate-100">{value}</p>
    </article>
  );
}