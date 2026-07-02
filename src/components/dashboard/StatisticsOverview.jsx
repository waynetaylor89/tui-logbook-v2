import { useMemo } from "react";
import PropTypes from "prop-types";

export default function StatisticsOverview({ history }) {
  const analytics = useMemo(() => buildAnalytics(history), [history]);

  return (
    <section className="ops-panel rounded-2xl p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-slate-100">Statistics</h3>
          <p className="text-sm text-slate-400">Operational analytics generated from existing movement history.</p>
        </div>
        <div className="ops-pill rounded-xl px-3 py-1.5 text-xs text-slate-300">
          {analytics.totalJobs} total logged jobs
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <MetricTile label="Jobs Today" value={analytics.jobsToday} accent="sky" />
        <MetricTile label="Jobs Week" value={analytics.jobsWeek} accent="emerald" />
        <MetricTile label="Jobs Month" value={analytics.jobsMonth} accent="amber" />
        <MetricTile label="Aircraft Handled" value={analytics.aircraftHandled} accent="rose" />
        <MetricTile label="Avg Jobs / Shift" value={analytics.averageJobsPerShift} accent="cyan" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-slate-700 bg-slate-900/50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-200">Jobs Trend (Last 14 Days)</p>
            <p className="text-xs text-slate-400">Busiest Day: {analytics.busiestDayLabel}</p>
          </div>
          <TrendChart points={analytics.dailyTrend} />
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="rounded-2xl border border-slate-700 bg-slate-900/50 p-4">
            <p className="text-sm font-medium text-slate-200">Arrival vs Departure</p>
            <ArrivalDepartureRing arrivals={analytics.arrivals} departures={analytics.departures} />
          </div>

          <div className="rounded-2xl border border-slate-700 bg-slate-900/50 p-4 text-sm text-slate-300">
            <StatRow label="Favourite Aircraft" value={analytics.favouriteAircraft} />
            <StatRow label="Favourite Destination" value={analytics.favouriteDestination} />
            <StatRow label="Longest Shift" value={analytics.longestShiftLabel} />
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RankedBars title="Top Aircraft" data={analytics.topAircraft} />
        <RankedBars title="Top Destinations" data={analytics.topDestinations} />
      </div>
    </section>
  );
}

function MetricTile({ label, value, accent }) {
  const accents = {
    sky: "from-sky-400/35 to-transparent border-sky-400/35",
    emerald: "from-emerald-400/35 to-transparent border-emerald-400/35",
    amber: "from-amber-400/35 to-transparent border-amber-400/35",
    rose: "from-rose-400/35 to-transparent border-rose-400/35",
    cyan: "from-cyan-400/35 to-transparent border-cyan-400/35",
  };

  return (
    <article className={`rounded-xl border bg-gradient-to-br p-3 sm:p-4 ${accents[accent] || accents.sky}`}>
      <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-100">{value}</p>
    </article>
  );
}

function TrendChart({ points }) {
  const max = Math.max(...points.map((item) => item.value), 1);
  const width = 560;
  const height = 160;

  const pointList = points
    .map((item, index) => {
      const x = (index / Math.max(points.length - 1, 1)) * width;
      const y = height - (item.value / max) * (height - 16) - 8;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-40 w-full overflow-visible">
        <defs>
          <linearGradient id="trendStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
        </defs>
        <polyline fill="none" stroke="url(#trendStroke)" strokeWidth="3" points={pointList} />
      </svg>

      <div className="mt-2 grid grid-cols-7 gap-2 text-[11px] text-slate-500 sm:grid-cols-14">
        {points.map((point) => (
          <div key={point.date} className="truncate text-center">
            {point.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function ArrivalDepartureRing({ arrivals, departures }) {
  const total = Math.max(arrivals + departures, 1);
  const arrivalPercent = (arrivals / total) * 100;
  const departurePercent = 100 - arrivalPercent;

  return (
    <div className="mt-3 flex items-center gap-4">
      <div
        className="relative h-24 w-24 rounded-full"
        style={{
          background: `conic-gradient(#34d399 ${arrivalPercent}%, #38bdf8 ${arrivalPercent}% ${arrivalPercent + departurePercent}%)`,
        }}
      >
        <div className="absolute inset-3 rounded-full bg-slate-900" />
      </div>
      <div className="space-y-1 text-xs">
        <p className="text-emerald-300">Arrivals: {arrivals}</p>
        <p className="text-sky-300">Departures: {departures}</p>
      </div>
    </div>
  );
}

function RankedBars({ title, data }) {
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/50 p-4">
      <p className="mb-3 text-sm font-medium text-slate-200">{title}</p>
      <div className="space-y-2">
        {data.map((item) => (
          <div key={item.label}>
            <div className="mb-1 flex items-center justify-between text-xs text-slate-300">
              <span className="truncate pr-2">{item.label}</span>
              <span>{item.value}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-800">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-sky-400"
                style={{ width: `${(item.value / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
        {data.length === 0 && <p className="text-sm text-slate-500">No records yet.</p>}
      </div>
    </div>
  );
}

function StatRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-800 py-2 last:border-b-0">
      <span className="text-slate-400">{label}</span>
      <span className="font-medium text-slate-100">{value}</span>
    </div>
  );
}

function buildAnalytics(history) {
  const entries = Object.values(history || {}).flat();
  const todayStr = new Date().toISOString().slice(0, 10);
  const monthPrefix = todayStr.slice(0, 7);
  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - 6);

  const jobsToday = entries.filter((entry) => entry.date === todayStr).length;
  const jobsMonth = entries.filter((entry) => (entry.date || "").startsWith(monthPrefix)).length;
  const jobsWeek = entries.filter((entry) => {
    if (!entry.date) return false;
    const date = new Date(`${entry.date}T00:00:00`);
    return date >= weekStart;
  }).length;

  const aircraftHandled = new Set(entries.map((entry) => entry.aircraft).filter(Boolean)).size;

  const jobsByDate = {};
  const aircraftCount = {};
  const destinationCount = {};
  let arrivals = 0;
  let departures = 0;

  for (const entry of entries) {
    if (entry.date) {
      jobsByDate[entry.date] = (jobsByDate[entry.date] || 0) + 1;
    }

    if (entry.aircraft) {
      aircraftCount[entry.aircraft] = (aircraftCount[entry.aircraft] || 0) + 1;
    }

    const destinationLabel = entry.toStand ? `Stand ${entry.toStand}` : "Unknown";
    destinationCount[destinationLabel] = (destinationCount[destinationLabel] || 0) + 1;

    const movementClass = classifyMovement(entry);
    if (movementClass === "arrival") arrivals += 1;
    if (movementClass === "departure") departures += 1;
  }

  const uniqueShiftDays = Object.keys(jobsByDate).length;
  const averageJobsPerShift = uniqueShiftDays > 0 ? (entries.length / uniqueShiftDays).toFixed(1) : "0.0";

  const busiest = Object.entries(jobsByDate).sort((a, b) => b[1] - a[1])[0];
  const busiestDayLabel = busiest ? `${formatDateShort(busiest[0])} (${busiest[1]})` : "No data";

  const longestShiftLabel = computeLongestShift(entries);

  const favouriteAircraft = Object.entries(aircraftCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "No data";
  const favouriteDestination = Object.entries(destinationCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "No data";

  const topAircraft = Object.entries(aircraftCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, value]) => ({ label, value }));

  const topDestinations = Object.entries(destinationCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, value]) => ({ label, value }));

  const dailyTrend = buildDailyTrend(entries, 14);

  return {
    totalJobs: entries.length,
    jobsToday,
    jobsWeek,
    jobsMonth,
    aircraftHandled,
    averageJobsPerShift,
    arrivals,
    departures,
    favouriteAircraft,
    favouriteDestination,
    busiestDayLabel,
    longestShiftLabel,
    topAircraft,
    topDestinations,
    dailyTrend,
  };
}

function buildDailyTrend(entries, days) {
  const counts = {};
  entries.forEach((entry) => {
    if (entry.date) {
      counts[entry.date] = (counts[entry.date] || 0) + 1;
    }
  });

  const out = [];
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push({
      date: key,
      label: d.toLocaleDateString("en-GB", { weekday: "short" }),
      value: counts[key] || 0,
    });
  }

  return out;
}

function classifyMovement(entry) {
  const movement = (entry.movementType || "").toLowerCase();
  const from = (entry.fromStand || "").toUpperCase();
  const to = (entry.toStand || "").toUpperCase();

  if (/arrival|arrived|inbound/.test(movement)) return "arrival";
  if (/depart|pushback|outbound/.test(movement)) return "departure";

  if (from.startsWith("R") && !to.startsWith("R")) return "arrival";
  if (!from.startsWith("R") && to.startsWith("R")) return "departure";

  return "departure";
}

function computeLongestShift(entries) {
  const byDate = {};
  entries.forEach((entry) => {
    const mins = parseTimeToMinutes(entry.time);
    if (!entry.date || mins === null) return;
    if (!byDate[entry.date]) byDate[entry.date] = [];
    byDate[entry.date].push(mins);
  });

  let bestDate = "";
  let bestSpan = -1;

  Object.entries(byDate).forEach(([date, mins]) => {
    if (mins.length < 2) return;
    const min = Math.min(...mins);
    const max = Math.max(...mins);
    const span = max - min;
    if (span > bestSpan) {
      bestSpan = span;
      bestDate = date;
    }
  });

  if (bestSpan < 0) return "No data";
  const hours = Math.floor(bestSpan / 60);
  const minutes = bestSpan % 60;
  return `${hours}h ${minutes}m (${formatDateShort(bestDate)})`;
}

function parseTimeToMinutes(value) {
  if (!value || typeof value !== "string") return null;

  const time = value.trim().toUpperCase();
  const match12 = time.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)$/);
  if (match12) {
    let hours = Number(match12[1]);
    const minutes = Number(match12[2]);
    const period = match12[3];

    if (hours === 12) hours = 0;
    if (period === "PM") hours += 12;

    if (hours > 23 || minutes > 59) return null;
    return hours * 60 + minutes;
  }

  const match24 = time.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (match24) {
    const hours = Number(match24[1]);
    const minutes = Number(match24[2]);
    if (hours > 23 || minutes > 59) return null;
    return hours * 60 + minutes;
  }

  return null;
}

function formatDateShort(value) {
  if (!value) return "No data";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

StatisticsOverview.propTypes = {
  history: PropTypes.object,
};

MetricTile.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  accent: PropTypes.string,
};

TrendChart.propTypes = {
  points: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
    })
  ).isRequired,
};

ArrivalDepartureRing.propTypes = {
  arrivals: PropTypes.number.isRequired,
  departures: PropTypes.number.isRequired,
};

RankedBars.propTypes = {
  title: PropTypes.string.isRequired,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
    })
  ).isRequired,
};

StatRow.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};
