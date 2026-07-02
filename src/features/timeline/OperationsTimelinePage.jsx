import { useMemo, useState } from "react";
import useLogbookStore from "../../store/useLogbookStore.js";

export default function OperationsTimelinePage() {
  const { timelineEvents, shiftJobs } = useLogbookStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedRegistration, setSelectedRegistration] = useState("All");
  const [selectedShiftJobId, setSelectedShiftJobId] = useState("All");

  const filtered = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return (timelineEvents || []).filter((event) => {
      const matchesSearch =
        query.length === 0 ||
        `${event.message || ""} ${event.action || ""} ${event.flightNumber || ""} ${event.registration || ""} ${event.destination || ""} ${event.stand || ""}`
          .toLowerCase()
          .includes(query);
      return matchesSearch;
    });
  }, [timelineEvents, searchTerm]);

  const dailyTimeline = useMemo(
    () => filtered.filter((event) => !selectedDate || event.date === selectedDate),
    [filtered, selectedDate]
  );

  const aircraftTimeline = useMemo(
    () => filtered.filter((event) => selectedRegistration === "All" || event.registration === selectedRegistration),
    [filtered, selectedRegistration]
  );

  const shiftTimeline = useMemo(
    () => filtered.filter((event) => selectedShiftJobId === "All" || event.shiftJobId === selectedShiftJobId),
    [filtered, selectedShiftJobId]
  );

  const registrations = useMemo(
    () => ["All", ...Array.from(new Set((timelineEvents || []).map((event) => event.registration).filter(Boolean))).sort()],
    [timelineEvents]
  );

  const shiftOptions = useMemo(() => {
    const known = new Set((timelineEvents || []).map((event) => event.shiftJobId).filter(Boolean));
    const fromShift = (shiftJobs || []).map((job) => ({ id: job.id, label: `${job.flightNumber || "Job"} (${job.id.slice(-4)})` }));
    const fromEvents = Array.from(known)
      .filter((id) => !fromShift.some((job) => job.id === id))
      .map((id) => ({ id, label: `Shift ${id.slice(-4)}` }));
    return [{ id: "All", label: "All" }, ...fromShift, ...fromEvents];
  }, [timelineEvents, shiftJobs]);

  const exportTimeline = () => {
    const rows = filtered.map((event) => ({
      timestamp: event.timestamp,
      time: event.time,
      action: event.action,
      message: event.message,
      shiftJobId: event.shiftJobId,
      flightNumber: event.flightNumber,
      registration: event.registration,
      aircraftType: event.aircraftType,
      stand: event.stand,
      destination: event.destination,
      arrivalDeparture: event.arrivalDeparture,
      details: event.details,
    }));

    const headers = Object.keys(rows[0] || { timestamp: "", action: "", message: "" });
    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        headers
          .map((header) => `"${String(row[header] || "").replaceAll('"', '""')}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `operations-timeline-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <section className="ops-panel rounded-2xl p-4 sm:p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Feature</p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-100">Operations Timeline</h2>
        <p className="mt-1 text-sm text-slate-400">Searchable timeline across daily, aircraft, and shift events.</p>
      </section>

      <section className="ops-panel rounded-2xl p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
          <label className="xl:col-span-2">
            <span className="mb-1 block text-xs uppercase tracking-[0.14em] text-slate-400">Search Timeline</span>
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Job Started, GPU Connected, registration, stand"
              className="min-h-12 w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500"
            />
          </label>

          <label>
            <span className="mb-1 block text-xs uppercase tracking-[0.14em] text-slate-400">Daily Timeline</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="min-h-12 w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-3 text-sm text-slate-100"
            />
          </label>

          <label>
            <span className="mb-1 block text-xs uppercase tracking-[0.14em] text-slate-400">Aircraft Timeline</span>
            <select
              value={selectedRegistration}
              onChange={(event) => setSelectedRegistration(event.target.value)}
              className="min-h-12 w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-3 text-sm text-slate-100"
            >
              {registrations.map((registration) => (
                <option key={registration} value={registration}>{registration}</option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-1 block text-xs uppercase tracking-[0.14em] text-slate-400">Shift Timeline</span>
            <select
              value={selectedShiftJobId}
              onChange={(event) => setSelectedShiftJobId(event.target.value)}
              className="min-h-12 w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-3 text-sm text-slate-100"
            >
              {shiftOptions.map((option) => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={exportTimeline}
            className="min-h-12 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-500"
          >
            Export Timeline
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <TimelineColumn title="Daily Timeline" events={dailyTimeline} />
        <TimelineColumn title="Aircraft Timeline" events={aircraftTimeline} />
        <TimelineColumn title="Shift Timeline" events={shiftTimeline} />
      </section>
    </div>
  );
}

function TimelineColumn({ title, events }) {
  return (
    <article className="ops-panel rounded-2xl p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
        <span className="text-xs text-slate-400">{events.length}</span>
      </div>

      {events.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-700 p-4 text-sm text-slate-400">
          No timeline events.
        </div>
      ) : (
        <ol className="space-y-2">
          {events.slice(0, 120).map((event) => (
            <li key={event.id} className="rounded-xl border border-slate-700 bg-slate-900/55 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-slate-100">{event.time} {event.action}</p>
                <span className="text-[11px] text-slate-500">{event.date}</span>
              </div>
              <p className="mt-1 text-xs text-slate-300">{event.message}</p>
              <p className="mt-1 text-[11px] text-slate-500">
                {event.flightNumber || "--"} • {event.registration || "--"} • Stand {event.stand || "--"}
              </p>
            </li>
          ))}
        </ol>
      )}
    </article>
  );
}
