import PropTypes from "prop-types";

export default function AircraftStatistics({ profile }) {
  const stats = [
    ["Manufacturer", profile.manufacturer || "Unknown"],
    ["Series", profile.series || "Unknown"],
    ["Fleet Number", profile.fleetNumber || "N/A"],
    ["Engine Type", profile.engineType || "Unknown"],
    ["Age", profile.age || "N/A"],
    ["Status", profile.status || "Active"],
    ["First Seen", profile.firstSeen || "N/A"],
    ["Last Worked", profile.lastWorked || "N/A"],
    ["Total Jobs", profile.totalJobs || 0],
    ["Total Arrivals", profile.totalArrivals || 0],
    ["Total Departures", profile.totalDepartures || 0],
    ["Favourite Stand", profile.favouriteStand || "N/A"],
    ["Favourite Destination", profile.favouriteDestination || "N/A"],
    ["Avg Turnaround", profile.averageTurnaroundTime || "N/A"],
  ];

  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900/55 p-4">
      <h4 className="text-sm font-semibold text-slate-200">Aircraft Statistics</h4>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {stats.map(([label, value]) => (
          <article key={label} className="rounded-xl border border-slate-700 bg-slate-950/45 p-2">
            <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">{label}</p>
            <p className="mt-1 text-sm font-medium text-slate-100">{value}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

AircraftStatistics.propTypes = {
  profile: PropTypes.object.isRequired,
};
