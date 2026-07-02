import { useMemo, useState } from "react";
import useLogbookStore from "../../store/useLogbookStore.js";
import { exportLogbookCSV } from "../../utils/exportCSV.js";
import AirlineFilter from "../../components/AirlineFilter.jsx";
import { detectAirlineFromFlight, getDetectedAirlines, isTuiFlight, matchAirline, withDetectedAirline } from "../../utils/airlines.js";

export default function HistoryPage() {
  const { history, currentUser, shiftJobs, flights, markExportAction, getSelectedAirline, setSelectedAirline, getShowOtherAirlines } = useLogbookStore();
  const entries = history[currentUser] || [];
  const selectedAirline = getSelectedAirline();
  const showOtherAirlines = getShowOtherAirlines();
  const effectiveSelectedAirline = showOtherAirlines ? selectedAirline : "TUI Airways";

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const flightsWithAirline = useMemo(() => (flights || []).map((flight) => withDetectedAirline(flight)), [flights]);
  const airlines = useMemo(() => getDetectedAirlines(flightsWithAirline), [flightsWithAirline]);
  const entryAirlineMap = useMemo(() => {
    const map = new Map();
    entries.forEach((entry) => {
      const key = `${entry.date || ""}|${entry.aircraft || ""}`;
      const match = flightsWithAirline.find((flight) => {
        const flightDate = flight.date || "";
        const sameDate = !entry.date || !flightDate || entry.date === flightDate;
        const sameAircraft = [flight.registration, flight.aircraftRegistration, flight.aircraft, flight.aircraftType]
          .filter(Boolean)
          .some((token) => String(entry.aircraft || "").toLowerCase().includes(String(token || "").toLowerCase()));
        return sameDate && sameAircraft;
      });
      map.set(key, detectAirlineFromFlight(match || {}));
    });
    return map;
  }, [entries, flightsWithAirline]);

  const filteredEntries = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return [...entries]
      .filter((entry) => {
        const matchesMonth = !selectedMonth || (entry.date || "").startsWith(selectedMonth);
        const matchesDate = !selectedDate || entry.date === selectedDate;
        const searchable = `${entry.aircraft || ""} ${entry.movementType || ""} ${entry.fromStand || ""} ${entry.toStand || ""} ${entry.notes || ""}`.toLowerCase();
        const matchesSearch = query.length === 0 || searchable.includes(query);
        const entryAirline = entryAirlineMap.get(`${entry.date || ""}|${entry.aircraft || ""}`) || "";
        const entryProxyFlight = {
          airline: entryAirline,
          flightNumber: String(entry.flightNumber || ""),
        };
        const matchesAirline = showOtherAirlines
          ? matchAirline(entryProxyFlight, effectiveSelectedAirline) || !entryAirline
          : isTuiFlight(entryProxyFlight);

        return matchesMonth && matchesDate && matchesSearch && matchesAirline;
      })
      .sort((a, b) => toTimestamp(b) - toTimestamp(a));
  }, [entries, searchTerm, selectedDate, selectedMonth, showOtherAirlines, effectiveSelectedAirline, entryAirlineMap]);

  const dailySummary = useMemo(() => {
    if (!selectedDate) {
      return {
        dateLabel: "Pick a date",
        jobs: 0,
        aircraftHandled: 0,
        standMoves: 0,
      };
    }

    const dayEntries = entries.filter((entry) => entry.date === selectedDate);
    return {
      dateLabel: formatDate(selectedDate),
      jobs: dayEntries.length,
      aircraftHandled: new Set(dayEntries.map((entry) => entry.aircraft)).size,
      standMoves: new Set(dayEntries.flatMap((entry) => [entry.fromStand, entry.toStand])).size,
    };
  }, [entries, selectedDate]);

  const monthlySummary = useMemo(() => {
    const monthEntries = entries.filter((entry) => (entry.date || "").startsWith(selectedMonth));

    return {
      monthLabel: selectedMonth ? formatMonth(selectedMonth) : "All Months",
      jobs: monthEntries.length,
      aircraftHandled: new Set(monthEntries.map((entry) => entry.aircraft)).size,
      busiestDay: computeBusiestDay(monthEntries),
    };
  }, [entries, selectedMonth]);

  const aircraftHistory = useMemo(() => rankBy(entries, (entry) => parseAircraftType(entry.aircraft)), [entries]);
  const registrationHistory = useMemo(() => rankBy(entries, (entry) => parseRegistration(entry.aircraft)), [entries]);
  const standHistory = useMemo(() => {
    const counts = {};
    entries.forEach((entry) => {
      if (entry.fromStand) counts[`From ${entry.fromStand}`] = (counts[`From ${entry.fromStand}`] || 0) + 1;
      if (entry.toStand) counts[`To ${entry.toStand}`] = (counts[`To ${entry.toStand}`] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [entries]);

  const flightHistory = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return [...(shiftJobs || [])]
      .filter((job) => {
        const linked = flightsWithAirline.find((flight) => flight.id === job.flightId) || job;
        const matchesAirline = showOtherAirlines
          ? matchAirline(linked, effectiveSelectedAirline)
          : isTuiFlight(linked);
        if (!matchesAirline) return false;
        if (!query) return true;
        const searchable = `${job.flightNumber || ""} ${job.aircraftRegistration || ""} ${job.origin || ""} ${job.destination || ""} ${job.jobState || ""}`.toLowerCase();
        return searchable.includes(query);
      })
      .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
  }, [shiftJobs, searchTerm, flightsWithAirline, showOtherAirlines, effectiveSelectedAirline]);

  const calendarModel = useMemo(() => buildCalendar(selectedMonth, selectedDate, setSelectedDate), [selectedMonth, selectedDate]);

  return (
    <div className="space-y-4">
      <section className="ops-panel rounded-2xl p-4 sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Feature</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-100">History</h2>
            <p className="mt-1 text-sm text-slate-400">Timeline and historical summaries from existing movement records.</p>
          </div>
          <div className="ops-pill rounded-xl px-3 py-1.5 text-xs text-slate-300">
            {entries.length} total records
          </div>
        </div>
      </section>

      <AirlineFilter
        airlines={airlines}
        selectedAirline={effectiveSelectedAirline}
        onSelect={setSelectedAirline}
        showOtherAirlines={showOtherAirlines}
      />

      <section className="ops-panel rounded-2xl p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
          <div className="xl:col-span-2">
            <label className="mb-1 block text-xs uppercase tracking-[0.14em] text-slate-400">Search</label>
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Aircraft, stand, movement, notes, flight"
              className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-[0.14em] text-slate-400">Calendar Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-[0.14em] text-slate-400">Month</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100"
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={() => {
                exportLogbookCSV(filteredEntries);
                markExportAction();
              }}
              className="w-full rounded-xl bg-emerald-600 px-3 py-2 text-sm font-medium text-white"
            >
              Export Filtered
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setSelectedDate("");
              }}
              className="w-full rounded-xl border border-slate-600 px-3 py-2 text-sm text-slate-200"
            >
              Clear
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_2fr]">
        <section className="ops-panel rounded-2xl p-4 sm:p-5">
          <h3 className="mb-3 text-lg font-semibold text-slate-100">Calendar</h3>
          <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
            <span>{calendarModel.monthLabel}</span>
            <span>Tap a day to filter</span>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-slate-500">
            {calendarModel.weekDays.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {calendarModel.days.map((day, index) => (
              <button
                key={`${day.dateValue || "empty"}-${index}`}
                type="button"
                disabled={!day.dateValue}
                onClick={() => day.dateValue && setSelectedDate(day.dateValue)}
                className={`h-8 rounded-md text-xs ${
                  !day.dateValue
                    ? "opacity-0"
                    : day.isSelected
                      ? "bg-sky-600 text-white"
                      : day.hasEntries
                        ? "bg-slate-800 text-slate-100"
                        : "bg-slate-900/50 text-slate-500"
                }`}
              >
                {day.dayLabel}
              </button>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SummaryCard
            title="Daily Summary"
            subtitle={dailySummary.dateLabel}
            stats={[
              { label: "Jobs", value: dailySummary.jobs },
              { label: "Aircraft", value: dailySummary.aircraftHandled },
              { label: "Stands", value: dailySummary.standMoves },
            ]}
          />
          <SummaryCard
            title="Monthly Summary"
            subtitle={monthlySummary.monthLabel}
            stats={[
              { label: "Jobs", value: monthlySummary.jobs },
              { label: "Aircraft", value: monthlySummary.aircraftHandled },
              { label: "Busiest Day", value: monthlySummary.busiestDay },
            ]}
          />
        </section>
      </div>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <HistoryList title="Aircraft History" items={aircraftHistory} />
        <HistoryList title="Registration History" items={registrationHistory} />
        <HistoryList title="Stand History" items={standHistory} />
        <FlightHistoryList items={flightHistory} />
      </section>

      <section className="ops-panel rounded-2xl p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-100">Timeline</h3>
          <span className="text-xs text-slate-400">{filteredEntries.length} entries</span>
        </div>

        {filteredEntries.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-700 p-6 text-center text-sm text-slate-400">
            No timeline entries for current filters.
          </div>
        ) : (
          <ul className="space-y-2">
            {filteredEntries.map((entry) => (
              <li key={entry.id} className="rounded-xl border border-slate-700 bg-slate-900/50 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-slate-100">{entry.aircraft || "Unknown Aircraft"}</p>
                  <span className="text-xs text-slate-400">{formatDate(entry.date)} • {entry.time || "--:--"}</span>
                </div>
                <p className="mt-1 text-xs text-slate-300">
                  {entry.movementType || "Movement"} • {entry.fromStand || "--"} {" -> "} {entry.toStand || "--"}
                </p>
                {entry.notes ? <p className="mt-1 text-xs text-slate-400">{entry.notes}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function SummaryCard({ title, subtitle, stats }) {
  return (
    <article className="ops-panel rounded-2xl p-4">
      <p className="text-base font-semibold text-slate-100">{title}</p>
      <p className="mb-3 text-xs text-slate-400">{subtitle}</p>
      <div className="grid grid-cols-3 gap-2">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border border-slate-700 bg-slate-900/50 p-2 text-center">
            <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">{stat.label}</p>
            <p className="mt-1 text-sm font-medium text-slate-100">{String(stat.value)}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

function HistoryList({ title, items }) {
  return (
    <article className="ops-panel rounded-2xl p-4">
      <h3 className="mb-3 text-lg font-semibold text-slate-100">{title}</h3>
      <ul className="space-y-2">
        {items.slice(0, 8).map((item) => (
          <li key={item.label} className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm">
            <span className="truncate pr-2 text-slate-200">{item.label}</span>
            <span className="text-slate-400">{item.count}</span>
          </li>
        ))}
        {items.length === 0 ? <li className="text-sm text-slate-500">No data yet.</li> : null}
      </ul>
    </article>
  );
}

function FlightHistoryList({ items }) {
  return (
    <article className="ops-panel rounded-2xl p-4">
      <h3 className="mb-3 text-lg font-semibold text-slate-100">Flight History</h3>
      <ul className="space-y-2">
        {items.slice(0, 8).map((job) => (
          <li key={job.id} className="rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-slate-100">{job.flightNumber || "Unknown Flight"}</span>
              <span className="text-xs text-slate-400">{job.jobState || "Queued"}</span>
            </div>
            <p className="mt-1 text-xs text-slate-300">{job.origin || "--"} {" -> "} {job.destination || "--"}</p>
            <p className="mt-1 text-xs text-slate-500">{job.aircraftRegistration || "--"} • Stand {job.stand || "--"}</p>
          </li>
        ))}
        {items.length === 0 ? <li className="text-sm text-slate-500">No flight history yet.</li> : null}
      </ul>
    </article>
  );
}

function rankBy(entries, getLabel) {
  const counts = {};
  entries.forEach((entry) => {
    const label = getLabel(entry);
    if (!label) return;
    counts[label] = (counts[label] || 0) + 1;
  });

  return Object.entries(counts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

function parseAircraftType(aircraft) {
  if (!aircraft) return "Unknown";
  const parts = aircraft.split(" - ");
  return parts[1] || aircraft;
}

function parseRegistration(aircraft) {
  if (!aircraft) return "Unknown";
  return aircraft.split(" - ")[0] || aircraft;
}

function toTimestamp(entry) {
  const date = entry.date || "1970-01-01";
  const time = normalizeTime(entry.time || "00:00");
  return new Date(`${date}T${time}`).getTime() || 0;
}

function normalizeTime(value) {
  const raw = (value || "").trim().toUpperCase();
  const twelve = raw.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)$/);
  if (twelve) {
    let h = Number(twelve[1]);
    const m = Number(twelve[2]);
    const p = twelve[3];
    if (h === 12) h = 0;
    if (p === "PM") h += 12;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
  }
  const twentyFour = raw.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (twentyFour) {
    const h = Number(twentyFour[1]);
    const m = Number(twentyFour[2]);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
  }
  return "00:00:00";
}

function formatDate(value) {
  if (!value) return "No Date";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatMonth(value) {
  if (!value) return "No Month";
  const date = new Date(`${value}-01T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

function computeBusiestDay(entries) {
  if (entries.length === 0) return "No data";
  const byDay = {};
  entries.forEach((entry) => {
    if (!entry.date) return;
    byDay[entry.date] = (byDay[entry.date] || 0) + 1;
  });
  const top = Object.entries(byDay).sort((a, b) => b[1] - a[1])[0];
  if (!top) return "No data";
  return `${formatDate(top[0])} (${top[1]})`;
}

function buildCalendar(monthValue, selectedDate, setSelectedDate) {
  const now = new Date();
  const month = monthValue || now.toISOString().slice(0, 7);
  const [year, monthNumber] = month.split("-").map(Number);

  const firstDay = new Date(year, monthNumber - 1, 1);
  const lastDay = new Date(year, monthNumber, 0);

  const days = [];
  const startOffset = (firstDay.getDay() + 6) % 7;

  for (let i = 0; i < startOffset; i += 1) {
    days.push({ dateValue: "", dayLabel: "", isSelected: false, hasEntries: false });
  }

  for (let d = 1; d <= lastDay.getDate(); d += 1) {
    const dateValue = `${year}-${String(monthNumber).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    days.push({
      dateValue,
      dayLabel: String(d),
      isSelected: selectedDate === dateValue,
      hasEntries: false,
      onClick: () => setSelectedDate(dateValue),
    });
  }

  return {
    monthLabel: firstDay.toLocaleDateString("en-GB", { month: "long", year: "numeric" }),
    weekDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    days,
  };
}
