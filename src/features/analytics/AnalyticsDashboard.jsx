import { useMemo, useState } from "react";
import useLogbookStore from "../../store/useLogbookStore.js";
import { exportLogbookCSV } from "../../utils/exportCSV.js";
import { exportToExcel } from "../../utils/exportExcel.js";
import { exportToPDF } from "../../utils/exportPDF.js";
import DailyPerformance from "./DailyPerformance.jsx";
import WeeklyPerformance from "./WeeklyPerformance.jsx";
import MonthlyPerformance from "./MonthlyPerformance.jsx";
import AircraftLeaderboard from "./AircraftLeaderboard.jsx";
import StandLeaderboard from "./StandLeaderboard.jsx";
import DestinationLeaderboard from "./DestinationLeaderboard.jsx";

const VIEW_MODES = [
  { key: "daily", label: "Daily View" },
  { key: "weekly", label: "Weekly View" },
  { key: "monthly", label: "Monthly View" },
  { key: "timeline", label: "Timeline View" },
];

export default function AnalyticsDashboard() {
  const { history, shiftJobs, markExportAction } = useLogbookStore();
  const today = new Date().toISOString().slice(0, 10);
  const [viewMode, setViewMode] = useState("monthly");
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedWeek, setSelectedWeek] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(today.slice(0, 7));
  const [searchTerm, setSearchTerm] = useState("");

  const entries = useMemo(() => Object.values(history || {}).flat(), [history]);

  const model = useMemo(() => buildAnalyticsModel(entries, shiftJobs || []), [entries, shiftJobs]);

  const selectedDay = useMemo(() => {
    return model.days.find((day) => day.date === selectedDate) || createEmptyDay(selectedDate);
  }, [model.days, selectedDate]);

  const filteredTimeline = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return selectedDay.timeline;
    }
    return selectedDay.timeline.filter((item) =>
      `${item.time} ${item.title} ${item.detail} ${item.aircraft} ${item.registration}`.toLowerCase().includes(query)
    );
  }, [searchTerm, selectedDay]);

  const selectedWeekData = useMemo(() => {
    const week = model.weeks.find((item) => item.key === selectedWeek) || model.weeks[0];
    return week || { jobs: 0, hours: 0, daysWorked: 0, timeline: [] };
  }, [model.weeks, selectedWeek]);

  const selectedMonthData = useMemo(() => {
    const month = model.months.find((item) => item.key === selectedMonth) || model.months[0];
    return month || { jobs: 0, hours: 0, avgTurnaround: 0, timeline: [] };
  }, [model.months, selectedMonth]);

  const exportDay = (format) => {
    const dayRows = selectedDay.exportRows;
    if (dayRows.length === 0) {
      return;
    }

    const baseName = `analytics-${selectedDay.date}`;
    if (format === "csv") {
      exportLogbookCSV(dayRows);
      markExportAction();
      return;
    }
    if (format === "excel") {
      exportToExcel(dayRows, `${baseName}.csv`);
      markExportAction();
      return;
    }
    exportToPDF(dayRows, `${baseName}.pdf`);
    markExportAction();
  };

  return (
    <div className="space-y-4">
      <section className="ops-panel relative overflow-hidden rounded-2xl p-4 sm:p-6">
        <div className="pointer-events-none absolute -left-14 top-0 h-40 w-40 rounded-full bg-emerald-400/15 blur-3xl" />
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Sprint 8</p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-100">Shift Analytics Calendar</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-300">
          Professional mobile-first calendar with day drilldowns, timeline search, and export-ready operational analytics.
        </p>
      </section>

      <section className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-5">
        <Metric title="Today's Jobs" value={model.kpis.todayJobs} />
        <Metric title="Weekly Jobs" value={model.kpis.weeklyJobs} />
        <Metric title="Monthly Jobs" value={model.kpis.monthlyJobs} />
        <Metric title="Yearly Jobs" value={model.kpis.yearlyJobs} />
        <Metric title="Hours Worked" value={`${model.kpis.hoursWorked.toFixed(1)}h`} />
        <Metric title="Avg Jobs Per Shift" value={model.kpis.avgJobsPerShift.toFixed(2)} />
        <Metric title="Average Turnaround" value={`${model.kpis.avgTurnaround.toFixed(1)}m`} />
        <Metric title="Longest Shift" value={model.kpis.longestShiftLabel} />
        <Metric title="Busiest Day" value={model.kpis.busiestDayLabel} />
        <Metric title="Fastest Turnaround" value={`${model.kpis.fastestTurnaround.toFixed(1)}m`} />
      </section>

      <section className="ops-panel rounded-2xl p-4 sm:p-5">
        <div className="flex flex-wrap gap-2">
          {VIEW_MODES.map((mode) => (
            <button
              key={mode.key}
              type="button"
              onClick={() => setViewMode(mode.key)}
              className={`min-h-11 rounded-xl border px-4 py-2 text-sm transition ${
                viewMode === mode.key
                  ? "border-cyan-400 bg-cyan-500/15 text-cyan-100"
                  : "border-slate-700 bg-slate-900/55 text-slate-300 hover:border-slate-500"
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          <label>
            <span className="mb-1 block text-xs uppercase tracking-[0.14em] text-slate-400">Tap a day</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="min-h-12 w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-3 text-sm text-slate-100"
            />
          </label>
          <label>
            <span className="mb-1 block text-xs uppercase tracking-[0.14em] text-slate-400">Search history</span>
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Flight, stand, note, registration"
              className="min-h-12 w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500"
            />
          </label>
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={() => exportDay("pdf")}
              className="min-h-12 flex-1 rounded-xl bg-slate-700 px-3 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-600"
            >
              Export PDF
            </button>
            <button
              type="button"
              onClick={() => exportDay("excel")}
              className="min-h-12 flex-1 rounded-xl bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
            >
              Export Excel
            </button>
            <button
              type="button"
              onClick={() => exportDay("csv")}
              className="min-h-12 flex-1 rounded-xl bg-cyan-700 px-3 py-2 text-sm font-semibold text-white hover:bg-cyan-600"
            >
              Export CSV
            </button>
          </div>
        </div>
      </section>

      {viewMode === "daily" ? (
        <DailyPerformance days={model.days} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
      ) : null}

      {viewMode === "weekly" ? (
        <WeeklyPerformance
          weeks={model.weeks}
          selectedWeek={selectedWeek || model.weeks[0]?.key || ""}
          onSelectWeek={setSelectedWeek}
        />
      ) : null}

      {viewMode === "monthly" ? (
        <MonthlyPerformance
          months={model.months}
          selectedMonth={selectedMonth || model.months[0]?.key || ""}
          onSelectMonth={setSelectedMonth}
        />
      ) : null}

      {viewMode === "timeline" ? (
        <section className="ops-panel rounded-2xl p-4 sm:p-5">
          <h3 className="text-lg font-semibold text-slate-100">Timeline View</h3>
          {filteredTimeline.length === 0 ? (
            <div className="mt-2 rounded-xl border border-dashed border-slate-700 p-4 text-sm text-slate-400">
              No timeline events for the selected filters.
            </div>
          ) : (
            <ol className="mt-3 space-y-2">
              {filteredTimeline.slice(0, 180).map((item) => (
                <li key={item.id} className="rounded-xl border border-slate-700 bg-slate-900/55 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-slate-100">{item.time} {item.title}</p>
                    <span className="text-xs text-slate-500">{item.date}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-300">{item.detail}</p>
                </li>
              ))}
            </ol>
          )}
        </section>
      ) : null}

      <section className="ops-panel rounded-2xl p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-slate-100">Calendar</h3>
          <div className="flex flex-wrap gap-2 text-xs text-slate-300">
            <span className="rounded-md border border-emerald-500/60 bg-emerald-500/10 px-2 py-1">Best Day</span>
            <span className="rounded-md border border-amber-500/60 bg-amber-500/10 px-2 py-1">Longest Shift</span>
            <span className="rounded-md border border-cyan-500/60 bg-cyan-500/10 px-2 py-1">Most Jobs</span>
          </div>
        </div>
        <CalendarGrid
          days={model.days}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          highlight={model.highlights}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <DayDrilldown day={selectedDay} timeline={filteredTimeline} />
        <ActivityCharts charts={model.charts} selectedWeek={selectedWeekData} selectedMonth={selectedMonthData} />
      </section>

      <AircraftLeaderboard
        mostWorkedRegistration={model.aircraft.mostWorkedRegistration}
        mostWorkedAircraftType={model.aircraft.mostWorkedAircraftType}
        mostWorkedFleet={model.aircraft.mostWorkedFleet}
        favouriteAircraft={model.aircraft.favouriteAircraft}
        registrationRows={model.aircraft.registrationRows}
        typeRows={model.aircraft.typeRows}
        fleetRows={model.aircraft.fleetRows}
      />

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <DestinationLeaderboard
          favouriteDestination={model.destinations.favouriteDestination}
          countriesVisited={model.destinations.countriesVisited}
          airportCount={model.destinations.airportCount}
          arrivalVsDeparture={model.destinations.arrivalVsDeparture}
          destinationRows={model.destinations.rows}
        />
        <StandLeaderboard
          mostUsedStand={model.stands.mostUsedStand}
          heatmapData={model.stands.heatmapData}
        />
      </section>
    </div>
  );
}

function Metric({ title, value }) {
  return (
    <article className="rounded-xl border border-slate-700 bg-slate-900/55 p-3">
      <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">{title}</p>
      <p className="mt-1 text-base font-semibold text-slate-100">{value}</p>
    </article>
  );
}

function CalendarGrid({ days, selectedDate, onSelectDate, highlight }) {
  const byDate = new Map((days || []).map((day) => [day.date, day]));
  const basis = selectedDate || new Date().toISOString().slice(0, 10);
  const [year, month] = basis.split("-").map(Number);
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const startPad = (firstDay.getDay() + 6) % 7;
  const total = startPad + lastDay.getDate();
  const cells = [];

  for (let index = 0; index < total; index += 1) {
    if (index < startPad) {
      cells.push(null);
      continue;
    }
    const dayNum = index - startPad + 1;
    const date = `${year}-${String(month).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
    cells.push({ date, dayNum, data: byDate.get(date) || createEmptyDay(date) });
  }

  return (
    <div className="grid grid-cols-7 gap-1 sm:gap-2">
      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((label) => (
        <p key={label} className="px-1 py-1 text-center text-[11px] uppercase tracking-[0.14em] text-slate-500">{label}</p>
      ))}
      {cells.map((cell, index) => {
        if (!cell) {
          return <div key={`pad-${index}`} className="min-h-16 rounded-xl border border-transparent" />;
        }

        const isSelected = cell.date === selectedDate;
        const isBest = cell.date === highlight.bestDay;
        const isLongest = cell.date === highlight.longestShift;
        const isMostJobs = cell.date === highlight.mostJobs;

        let tone = "border-slate-700 bg-slate-900/55 hover:border-slate-500";
        if (isBest) tone = "border-emerald-400 bg-emerald-500/12";
        if (isLongest) tone = "border-amber-400 bg-amber-500/12";
        if (isMostJobs) tone = "border-cyan-400 bg-cyan-500/12";
        if (isSelected) tone += " ring-2 ring-sky-400/80";

        return (
          <button
            key={cell.date}
            type="button"
            onClick={() => onSelectDate(cell.date)}
            className={`min-h-16 rounded-xl border p-1.5 text-left transition sm:min-h-20 ${tone}`}
          >
            <p className="text-xs text-slate-100">{cell.dayNum}</p>
            <p className="mt-1 text-[11px] text-slate-300">{cell.data.jobs} jobs</p>
            <p className="text-[11px] text-slate-400">{cell.data.hours.toFixed(1)}h</p>
          </button>
        );
      })}
    </div>
  );
}

function DayDrilldown({ day, timeline }) {
  return (
    <article className="ops-panel rounded-2xl p-4 sm:p-5">
      <h3 className="text-lg font-semibold text-slate-100">Day Card {day.date}</h3>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Metric title="Flights Worked" value={day.flightsWorked} />
        <Metric title="Aircraft" value={day.aircraftCount} />
        <Metric title="Registrations" value={day.registrationCount} />
        <Metric title="Notes" value={day.notesCount} />
        <Metric title="Hours" value={day.hours.toFixed(1)} />
        <Metric title="Jobs" value={day.jobs} />
      </div>

      <div className="mt-3 rounded-xl border border-slate-700 bg-slate-900/55 p-3">
        <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Shift Cards</p>
        {day.shiftCards.length === 0 ? (
          <p className="mt-2 text-sm text-slate-400">No shift cards for this day.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {day.shiftCards.map((job) => (
              <li key={job.id} className="rounded-lg border border-slate-700 bg-slate-900/60 p-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-slate-100">{job.flightNumber || "Shift Job"}</p>
                  <p className="text-xs text-slate-400">{job.status || "--"}</p>
                </div>
                <p className="mt-1 text-xs text-slate-300">
                  {job.registration || "--"} • {job.aircraftType || "--"} • Stand {job.stand || "--"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-3 rounded-xl border border-slate-700 bg-slate-900/55 p-3">
        <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Statistics</p>
        <p className="mt-2 text-sm text-slate-200">Average turnaround: {day.avgTurnaround.toFixed(1)} minutes</p>
        <p className="text-sm text-slate-200">Top stand: {day.topStand || "--"}</p>
      </div>

      <div className="mt-3 rounded-xl border border-slate-700 bg-slate-900/55 p-3">
        <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Timeline ({timeline.length})</p>
        {timeline.length === 0 ? (
          <p className="mt-2 text-sm text-slate-400">No matching timeline events.</p>
        ) : (
          <ol className="mt-2 space-y-1.5">
            {timeline.slice(0, 14).map((item) => (
              <li key={item.id} className="text-xs text-slate-200">
                <span className="text-slate-400">{item.time}</span> {item.title} {item.detail}
              </li>
            ))}
          </ol>
        )}
      </div>
    </article>
  );
}

function ActivityCharts({ charts, selectedWeek, selectedMonth }) {
  return (
    <article className="ops-panel rounded-2xl p-4 sm:p-5">
      <h3 className="text-lg font-semibold text-slate-100">Activity Charts</h3>

      <SimpleBars title="Jobs Per Day" rows={charts.jobsPerDay.slice(0, 12)} keyName="date" />
      <SimpleBars title="Jobs Per Week" rows={charts.jobsPerWeek.slice(0, 8)} keyName="key" className="mt-3" />
      <SimpleBars title="Jobs Per Month" rows={charts.jobsPerMonth.slice(0, 8)} keyName="key" className="mt-3" />
      <SimpleBars title="Jobs By Hour" rows={charts.jobsByHour.slice(0, 24)} keyName="hour" className="mt-3" />
      <SimpleBars title="Aircraft Types" rows={charts.aircraftTypes.slice(0, 8)} keyName="name" className="mt-3" />

      <div className="mt-3 rounded-xl border border-slate-700 bg-slate-900/55 p-3">
        <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Selected Weekly Snapshot</p>
        <p className="mt-1 text-sm text-slate-200">{selectedWeek.label || "--"}: {selectedWeek.jobs} jobs, {selectedWeek.hours.toFixed(1)}h</p>
      </div>

      <div className="mt-2 rounded-xl border border-slate-700 bg-slate-900/55 p-3">
        <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Selected Monthly Snapshot</p>
        <p className="mt-1 text-sm text-slate-200">
          {selectedMonth.label || "--"}: {selectedMonth.jobs} jobs, avg turnaround {selectedMonth.avgTurnaround.toFixed(1)}m
        </p>
      </div>
    </article>
  );
}

function SimpleBars({ title, rows, keyName, className = "mt-3" }) {
  const max = rows.reduce((acc, row) => Math.max(acc, row.count || row.jobs || 0), 1);
  return (
    <div className={className}>
      <p className="text-xs uppercase tracking-[0.14em] text-slate-400">{title}</p>
      {rows.length === 0 ? (
        <div className="mt-1 rounded-xl border border-dashed border-slate-700 p-3 text-xs text-slate-400">No data</div>
      ) : (
        <div className="mt-1 space-y-1.5">
          {rows.map((row) => {
            const value = row.count ?? row.jobs ?? 0;
            return (
              <div key={row[keyName]} className="flex items-center gap-2 text-xs">
                <span className="w-20 truncate text-slate-300">{row.label || row[keyName]}</span>
                <div className="h-2 flex-1 rounded bg-slate-800">
                  <div className="h-2 rounded bg-cyan-400" style={{ width: `${Math.max(4, Math.round((value / max) * 100))}%` }} />
                </div>
                <span className="w-8 text-right text-slate-300">{value}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function buildAnalyticsModel(entries, shiftJobs) {
  const dayMap = new Map();

  entries.forEach((entry) => {
    if (!entry?.date) return;
    const day = ensureDay(dayMap, entry.date);
    day.entries.push(entry);
    day.aircraft.add(entry.aircraft || "");
    const { registration, aircraftType } = splitAircraft(entry.aircraft || "");
    if (registration) day.registrations.add(registration);
    if (aircraftType) day.aircraftTypes.add(aircraftType);
    if (entry.notes) day.notes.push(entry.notes);
    if (entry.fromStand) day.stands.push(entry.fromStand);
    if (entry.toStand) day.stands.push(entry.toStand);
    day.timeline.push({
      id: `entry-${entry.id || Math.random().toString(36).slice(2, 9)}`,
      date: entry.date,
      time: entry.time || "--:--",
      title: entry.movementType || "Movement",
      detail: `${entry.fromStand || "--"} -> ${entry.toStand || "--"}`,
      aircraft: entry.aircraft || "",
      registration: registration || "",
    });
  });

  shiftJobs.forEach((job) => {
    const date = deriveJobDate(job);
    if (!date) return;
    const day = ensureDay(dayMap, date);
    day.jobs.push(job);
    if (job.flightNumber) day.flights.add(job.flightNumber);
    if (job.registration || job.aircraftRegistration) day.registrations.add(job.registration || job.aircraftRegistration);
    if (job.aircraftType) day.aircraftTypes.add(job.aircraftType);
    if (job.stand) day.stands.push(job.stand);
    (job.notes || []).forEach((note) => day.notes.push(note.text || ""));

    const hours = computeJobHours(job);
    day.hours += hours;
    day.turnarounds.push(parseTurnaround(job.turnaroundTime));
    day.timeline.push({
      id: `job-${job.id}`,
      date,
      time: formatTime(job.startedAt || job.completedAt || job.claimedAt),
      title: job.jobState || job.status || "Shift Job",
      detail: `${job.flightNumber || "Job"} • Stand ${job.stand || "--"} • ${job.destination || "--"}`,
      aircraft: job.aircraftType || "",
      registration: job.registration || job.aircraftRegistration || "",
    });
  });

  const days = Array.from(dayMap.values())
    .map((day) => {
      const jobsCount = day.jobs.length;
      const movementsCount = day.entries.length;
      const turnarounds = day.turnarounds.filter((value) => Number.isFinite(value) && value > 0);
      const avgTurnaround = turnarounds.length ? turnarounds.reduce((sum, value) => sum + value, 0) / turnarounds.length : 0;
      const standsCounts = countMap(day.stands);

      return {
        ...day,
        label: new Date(`${day.date}T00:00:00`).toLocaleDateString([], { weekday: "short", day: "2-digit", month: "short" }),
        jobs: jobsCount,
        movements: movementsCount,
        flightsWorked: day.flights.size,
        aircraftCount: day.aircraft.size,
        registrationCount: day.registrations.size,
        notesCount: day.notes.filter(Boolean).length,
        avgTurnaround,
        topStand: standsCounts[0]?.name || "",
        shiftCards: day.jobs.slice(0, 8),
        exportRows: buildExportRows(day.entries, day.jobs, day.date),
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const thisWeek = getIsoWeekKey(now);
  const thisMonth = today.slice(0, 7);
  const thisYear = today.slice(0, 4);

  const weeks = aggregateWeeks(days);
  const months = aggregateMonths(days);

  const kpis = {
    todayJobs: days.find((day) => day.date === today)?.jobs || 0,
    weeklyJobs: weeks.find((week) => week.key === thisWeek)?.jobs || 0,
    monthlyJobs: months.find((month) => month.key === thisMonth)?.jobs || 0,
    yearlyJobs: days.filter((day) => day.date.startsWith(thisYear)).reduce((sum, day) => sum + day.jobs, 0),
    hoursWorked: days.reduce((sum, day) => sum + day.hours, 0),
    avgJobsPerShift: days.length ? days.reduce((sum, day) => sum + day.jobs, 0) / days.length : 0,
    avgTurnaround: average(days.map((day) => day.avgTurnaround).filter((value) => value > 0)),
    longestShiftLabel: `${Math.max(0, ...days.map((day) => day.hours)).toFixed(1)}h`,
    busiestDayLabel: days[0]
      ? `${days.slice().sort((a, b) => (b.jobs + b.movements) - (a.jobs + a.movements))[0]?.label || "--"}`
      : "--",
    fastestTurnaround: minPositive(days.map((day) => day.avgTurnaround)),
  };

  const highlights = {
    bestDay: days.slice().sort((a, b) => scoreDay(b) - scoreDay(a))[0]?.date || "",
    longestShift: days.slice().sort((a, b) => b.hours - a.hours)[0]?.date || "",
    mostJobs: days.slice().sort((a, b) => b.jobs - a.jobs)[0]?.date || "",
  };

  const aircraft = buildAircraftStats(days);
  const destinations = buildDestinationStats(shiftJobs);
  const stands = buildStandStats(days);
  const charts = buildCharts(days);

  return { days, weeks, months, kpis, highlights, aircraft, destinations, stands, charts };
}

function ensureDay(map, date) {
  if (!map.has(date)) {
    map.set(date, {
      date,
      entries: [],
      jobs: [],
      flights: new Set(),
      aircraft: new Set(),
      registrations: new Set(),
      aircraftTypes: new Set(),
      stands: [],
      notes: [],
      timeline: [],
      turnarounds: [],
      hours: 0,
    });
  }
  return map.get(date);
}

function deriveJobDate(job) {
  const stamp = job.completedAt || job.startedAt || job.claimedAt || job.updatedAt || "";
  if (!stamp) return "";
  return String(stamp).slice(0, 10);
}

function computeJobHours(job) {
  if (!job?.startedAt || !job?.completedAt) return 0;
  const start = new Date(job.startedAt).getTime();
  const end = new Date(job.completedAt).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 0;
  return (end - start) / (1000 * 60 * 60);
}

function splitAircraft(aircraft) {
  const parts = String(aircraft || "").split(" - ");
  if (parts.length > 1) {
    return { registration: parts[0], aircraftType: parts.slice(1).join(" - ") };
  }
  return { registration: String(aircraft || ""), aircraftType: "" };
}

function parseTurnaround(value) {
  if (typeof value === "number") return value;
  const match = String(value || "").match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

function formatTime(timestamp) {
  if (!timestamp) return "--:--";
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "--:--";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
}

function countMap(items) {
  const counts = {};
  (items || []).filter(Boolean).forEach((item) => {
    counts[item] = (counts[item] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

function aggregateWeeks(days) {
  const map = new Map();
  days.forEach((day) => {
    const key = getIsoWeekKey(new Date(`${day.date}T00:00:00`));
    if (!map.has(key)) {
      map.set(key, { key, jobs: 0, hours: 0, daysWorked: 0, timeline: [] });
    }
    const target = map.get(key);
    target.jobs += day.jobs;
    target.hours += day.hours;
    if (day.jobs > 0 || day.movements > 0) target.daysWorked += 1;
    target.timeline.push(...day.timeline);
  });

  return Array.from(map.values())
    .map((week) => ({
      ...week,
      label: `Week ${week.key.split("-W")[1]} • ${week.key.slice(0, 4)}`,
    }))
    .sort((a, b) => (a.key < b.key ? 1 : -1));
}

function aggregateMonths(days) {
  const map = new Map();
  days.forEach((day) => {
    const key = day.date.slice(0, 7);
    if (!map.has(key)) {
      map.set(key, { key, jobs: 0, hours: 0, turnaround: [] });
    }
    const target = map.get(key);
    target.jobs += day.jobs;
    target.hours += day.hours;
    if (day.avgTurnaround > 0) target.turnaround.push(day.avgTurnaround);
  });

  return Array.from(map.values())
    .map((month) => ({
      ...month,
      avgTurnaround: average(month.turnaround),
      label: new Date(`${month.key}-01T00:00:00`).toLocaleDateString([], { month: "long", year: "numeric" }),
    }))
    .sort((a, b) => (a.key < b.key ? 1 : -1));
}

function buildAircraftStats(days) {
  const registrationCounts = {};
  const typeCounts = {};

  days.forEach((day) => {
    day.shiftCards.forEach((job) => {
      const reg = job.registration || job.aircraftRegistration || "";
      const type = job.aircraftType || "";
      if (reg) registrationCounts[reg] = (registrationCounts[reg] || 0) + 1;
      if (type) typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    day.entries.forEach((entry) => {
      const parsed = splitAircraft(entry.aircraft || "");
      if (parsed.registration) registrationCounts[parsed.registration] = (registrationCounts[parsed.registration] || 0) + 1;
      if (parsed.aircraftType) typeCounts[parsed.aircraftType] = (typeCounts[parsed.aircraftType] || 0) + 1;
    });
  });

  const registrationRows = sortObjectCounts(registrationCounts);
  const typeRows = sortObjectCounts(typeCounts);

  const fleetCounts = {};
  typeRows.forEach((row) => {
    const family = inferFleet(row.name);
    fleetCounts[family] = (fleetCounts[family] || 0) + row.count;
  });

  const fleetRows = sortObjectCounts(fleetCounts);

  return {
    mostWorkedRegistration: registrationRows[0]?.name || "",
    mostWorkedAircraftType: typeRows[0]?.name || "",
    mostWorkedFleet: fleetRows[0]?.name || "",
    favouriteAircraft: registrationRows[0] && typeRows[0] ? `${registrationRows[0].name} • ${typeRows[0].name}` : registrationRows[0]?.name || "",
    registrationRows,
    typeRows,
    fleetRows,
  };
}

function buildDestinationStats(shiftJobs) {
  const destinationCounts = {};
  const countrySet = new Set();
  const airportSet = new Set();
  let arrivals = 0;
  let departures = 0;

  (shiftJobs || []).forEach((job) => {
    const destination = String(job.destination || "").trim();
    if (destination) {
      destinationCounts[destination] = (destinationCounts[destination] || 0) + 1;
      airportSet.add(destination);
      countrySet.add(extractCountry(destination));
    }

    const movement = String(job.arrivalDeparture || job.movement || "").toLowerCase();
    if (movement.includes("arrival")) arrivals += 1;
    if (movement.includes("departure")) departures += 1;
  });

  const rows = sortObjectCounts(destinationCounts);

  return {
    favouriteDestination: rows[0]?.name || "",
    countriesVisited: Array.from(countrySet).filter(Boolean).length,
    airportCount: airportSet.size,
    arrivalVsDeparture: { arrivals, departures },
    rows,
  };
}

function buildStandStats(days) {
  const stands = {};
  days.forEach((day) => {
    day.stands.forEach((stand) => {
      if (!stand) return;
      stands[stand] = (stands[stand] || 0) + 1;
    });
  });

  const heatmapData = sortObjectCounts(stands).map((item) => ({ stand: item.name, count: item.count }));
  return {
    mostUsedStand: heatmapData[0]?.stand || "",
    heatmapData,
  };
}

function buildCharts(days) {
  const jobsPerDay = days
    .slice()
    .sort((a, b) => (a.date > b.date ? 1 : -1))
    .map((day) => ({ date: day.date.slice(5), label: day.label, jobs: day.jobs }));

  const jobsPerWeek = aggregateWeeks(days)
    .slice()
    .reverse()
    .map((week) => ({ key: week.key, label: week.label, jobs: week.jobs }));

  const jobsPerMonth = aggregateMonths(days)
    .slice()
    .reverse()
    .map((month) => ({ key: month.key, label: month.label, jobs: month.jobs }));

  const hourCounts = {};
  days.forEach((day) => {
    day.timeline.forEach((event) => {
      const hour = String(event.time || "").split(":")[0];
      if (!hour || hour === "--") return;
      const key = `${hour.padStart(2, "0")}:00`;
      hourCounts[key] = (hourCounts[key] || 0) + 1;
    });
  });

  const jobsByHour = Object.entries(hourCounts)
    .map(([hour, count]) => ({ hour, count }))
    .sort((a, b) => (a.hour > b.hour ? 1 : -1));

  const aircraftTypes = {};
  days.forEach((day) => {
    day.aircraftTypes.forEach((type) => {
      if (!type) return;
      aircraftTypes[type] = (aircraftTypes[type] || 0) + 1;
    });
  });

  return {
    jobsPerDay,
    jobsPerWeek,
    jobsPerMonth,
    jobsByHour,
    aircraftTypes: sortObjectCounts(aircraftTypes),
  };
}

function inferFleet(type) {
  const value = String(type || "").toLowerCase();
  if (value.includes("boeing") || value.includes("73")) return "Boeing";
  if (value.includes("airbus") || value.includes("32")) return "Airbus";
  return "Other Fleet";
}

function sortObjectCounts(counts) {
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

function average(values) {
  if (!values || values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function minPositive(values) {
  const positive = (values || []).filter((value) => Number.isFinite(value) && value > 0);
  if (positive.length === 0) return 0;
  return Math.min(...positive);
}

function scoreDay(day) {
  return (day.jobs * 2) + day.movements + day.hours;
}

function getIsoWeekKey(dateInput) {
  const date = new Date(Date.UTC(dateInput.getFullYear(), dateInput.getMonth(), dateInput.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

function extractCountry(destination) {
  const value = String(destination || "").trim();
  if (!value) return "";
  const parts = value.split(/[,-]/).map((part) => part.trim()).filter(Boolean);
  if (parts.length > 1) return parts[parts.length - 1].toUpperCase();
  const token = parts[0].split(" ").filter(Boolean).pop() || "";
  return token.toUpperCase();
}

function buildExportRows(entries, jobs, date) {
  const movementRows = (entries || []).map((entry) => ({
    date: entry.date || date,
    time: entry.time || "",
    aircraft: entry.aircraft || "",
    movementType: entry.movementType || "",
    fromStand: entry.fromStand || "",
    toStand: entry.toStand || "",
    notes: entry.notes || "",
    createdBy: entry.createdBy || "Wayne",
  }));

  const shiftRows = (jobs || []).map((job) => ({
    date,
    time: formatTime(job.startedAt || job.completedAt || job.claimedAt),
    aircraft: [job.registration || job.aircraftRegistration || "", job.aircraftType || ""].filter(Boolean).join(" - "),
    movementType: job.arrivalDeparture || job.movement || "Shift Job",
    fromStand: job.stand || "",
    toStand: job.stand || "",
    notes: (job.notes || []).map((note) => note.text || "").filter(Boolean).join(" | "),
    createdBy: "Wayne",
  }));

  return [...movementRows, ...shiftRows];
}

function createEmptyDay(date) {
  return {
    date,
    label: "No data",
    jobs: 0,
    movements: 0,
    flightsWorked: 0,
    aircraftCount: 0,
    registrationCount: 0,
    notesCount: 0,
    avgTurnaround: 0,
    topStand: "",
    shiftCards: [],
    timeline: [],
    exportRows: [],
    hours: 0,
  };
}