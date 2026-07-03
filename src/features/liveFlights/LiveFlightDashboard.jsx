import { useEffect, useMemo, useRef, useState } from "react";
import useLogbookStore from "../../store/useLogbookStore.js";
import { toast } from "../../components/Toast.jsx";
import ConnectionStatus from "../../components/ConnectionStatus.jsx";
import OfflineIndicator from "../../components/OfflineIndicator.jsx";
import FlightRefreshButton from "./FlightRefreshButton.jsx";
import LiveFlightList from "./LiveFlightList.jsx";
import PasteFlightLink from "../import/PasteFlightLink.jsx";

export default function LiveFlightDashboard() {
  const {
    flights,
    shiftJobs,
    refreshLiveFlights,
    liveFlightsMeta,
    addFlightToShift,
    toggleShiftChecklistItem,
    addShiftJobNote,
    completeShiftJob,
  } = useLogbookStore();
  const hasAutoRefreshed = useRef(false);
  const [noteText, setNoteText] = useState("");

  const today = new Date().toISOString().slice(0, 10);

  const todaysTuiFlights = useMemo(() => {
    return (flights || [])
      .filter((flight) => (flight.date || today) === today)
      .filter((flight) => isTuiFlight(flight))
      .sort((a, b) => toMinutes(a.scheduledTime) - toMinutes(b.scheduledTime));
  }, [flights, today]);

  const metrics = useMemo(() => {
    const arrivals = todaysTuiFlights.filter((flight) => isArrival(flight)).length;
    const departures = todaysTuiFlights.filter((flight) => isDeparture(flight)).length;
    const delayed = todaysTuiFlights.filter((flight) => /delay/i.test(String(flight.status || ""))).length;
    const cancelled = todaysTuiFlights.filter((flight) => /cancel/i.test(String(flight.status || ""))).length;
    const completed = todaysTuiFlights.filter((flight) => /(landed|arriv|departed|complete|closed)/i.test(String(flight.status || ""))).length;

    const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
    const nextDeparture = todaysTuiFlights
      .filter((flight) => isDeparture(flight) && toMinutes(flight.scheduledTime) >= nowMinutes)
      .sort((a, b) => toMinutes(a.scheduledTime) - toMinutes(b.scheduledTime))[0] || null;

    const nextArrival = todaysTuiFlights
      .filter((flight) => isArrival(flight) && toMinutes(flight.scheduledTime) >= nowMinutes)
      .sort((a, b) => toMinutes(a.scheduledTime) - toMinutes(b.scheduledTime))[0] || null;

    return {
      total: todaysTuiFlights.length,
      arrivals,
      departures,
      delayed,
      cancelled,
      completed,
      nextDeparture,
      nextArrival,
    };
  }, [todaysTuiFlights]);

  useEffect(() => {
    const claimedFlights = todaysTuiFlights.filter((flight) => Boolean(flight.claimed));
    for (const flight of claimedFlights) {
      const alreadyExists = (shiftJobs || []).some((job) => job.flightId === flight.id);
      if (!alreadyExists) {
        addFlightToShift(flight);
      }
    }
  }, [todaysTuiFlights, shiftJobs, addFlightToShift]);

  const currentJob = useMemo(() => {
    const active = (shiftJobs || []).find((job) => String(job.jobState || job.status || "").toLowerCase() === "in progress");
    if (active) return active;

    const queued = (shiftJobs || []).find((job) => String(job.jobState || job.status || "").toLowerCase() !== "completed");
    return queued || null;
  }, [shiftJobs]);

  useEffect(() => {
    if (hasAutoRefreshed.current) return;
    if (liveFlightsMeta?.refreshing) return;
    if (liveFlightsMeta?.lastUpdated) return;

    hasAutoRefreshed.current = true;
    void handleRefresh();
  });

  async function handleRefresh() {
    const result = await refreshLiveFlights();

    if (!result?.ok) {
      toast.error(result?.error || "Live refresh failed.");
      return;
    }

    if (result.offline) {
      toast.warning("Offline mode: showing cached flights.");
      return;
    }

    toast.success(`Live refresh complete. Imported ${result.importedFlights} flights.`);
  }

  function handleCompleteCurrentJob() {
    if (!currentJob?.id) return;
    completeShiftJob(currentJob.id);
    toast.success(`${currentJob.flightNumber || "Current job"} completed.`);
  }

  function handleAddNote() {
    const text = noteText.trim();
    if (!currentJob?.id || !text) return;
    addShiftJobNote(currentJob.id, text);
    setNoteText("");
  }

  return (
    <div className="space-y-4 pb-20">
      <section className="ops-panel rounded-2xl p-4 sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Live Dashboard</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-100">Today's TUI Flights</h2>
            <p className="mt-1 text-sm text-slate-300">Mobile-first live board with offline cache support.</p>
          </div>
          <FlightRefreshButton refreshing={Boolean(liveFlightsMeta?.refreshing)} onRefresh={handleRefresh} />
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <ConnectionStatus lastSync={liveFlightsMeta?.lastUpdated || ""} />
          <div className="rounded-xl border border-slate-700 bg-slate-900/55 px-3 py-2 text-xs text-slate-200">
            Last Refresh: {liveFlightsMeta?.lastUpdated ? new Date(liveFlightsMeta.lastUpdated).toLocaleString() : "Not refreshed yet"}
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-900/55 px-3 py-2 text-xs text-slate-200">
            Source: {liveFlightsMeta?.fromCache ? "Offline Cache" : "Live Provider"}
          </div>
        </div>

        <div className="mt-2">
          <OfflineIndicator
            fromCache={Boolean(liveFlightsMeta?.fromCache)}
            cachedFlights={Number(liveFlightsMeta?.importedFlights || 0)}
            lastSync={liveFlightsMeta?.lastUpdated || ""}
          />
        </div>
      </section>

      <section className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
        <MetricCard label="Today's TUI Flights" value={metrics.total} />
        <MetricCard label="Arrivals" value={metrics.arrivals} />
        <MetricCard label="Departures" value={metrics.departures} />
        <MetricCard label="Delayed Flights" value={metrics.delayed} />
        <MetricCard label="Cancelled Flights" value={metrics.cancelled} />
        <MetricCard label="Flights Completed" value={metrics.completed} />
        <MetricCard
          label="Next Departure"
          value={metrics.nextDeparture ? `${metrics.nextDeparture.flightNumber || "--"} ${metrics.nextDeparture.scheduledTime || ""}`.trim() : "--"}
        />
        <MetricCard
          label="Next Arrival"
          value={metrics.nextArrival ? `${metrics.nextArrival.flightNumber || "--"} ${metrics.nextArrival.scheduledTime || ""}`.trim() : "--"}
        />
      </section>

      <section className="ops-panel rounded-2xl p-4 sm:p-5">
        <h3 className="text-lg font-semibold text-slate-100">Current Job</h3>
        {currentJob ? (
          <div className="mt-3 space-y-3">
            <div className="rounded-xl border border-slate-700 bg-slate-900/55 p-3">
              <p className="text-xl font-semibold text-slate-100">{currentJob.flightNumber || "--"}</p>
              <p className="mt-1 text-sm text-slate-300">Aircraft: {currentJob.aircraftType || currentJob.registration || "--"}</p>
              <p className="text-sm text-slate-300">Stand: {currentJob.stand || "--"}</p>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-slate-200">Checklist</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {[
                  ["marshall", "Marshall"],
                  ["chocksOn", "Chocks On"],
                  ["gpuConnected", "GPU Connected"],
                  ["doorsClosed", "Doors Closed"],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleShiftChecklistItem(currentJob.id, key)}
                    className={`min-h-11 rounded-xl border px-3 py-2 text-left text-sm ${currentJob.checklist?.[key] ? "border-emerald-500/45 bg-emerald-500/15 text-emerald-200" : "border-slate-700 bg-slate-900/55 text-slate-200"}`}
                  >
                    {currentJob.checklist?.[key] ? "[x]" : "[ ]"} {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-slate-200">Notes</p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  value={noteText}
                  onChange={(event) => setNoteText(event.target.value)}
                  placeholder="Add note"
                  className="min-h-11 w-full rounded-xl border border-slate-700 bg-slate-900/55 px-3 py-2 text-sm text-slate-100"
                />
                <button
                  type="button"
                  onClick={handleAddNote}
                  className="min-h-11 rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white"
                >
                  Add
                </button>
              </div>
              {(currentJob.notes || []).length > 0 ? (
                <ul className="mt-2 space-y-1">
                  {currentJob.notes.slice(-3).reverse().map((note) => (
                    <li key={note.id} className="rounded-lg border border-slate-700 bg-slate-900/55 px-2 py-1 text-xs text-slate-300">
                      {note.text}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <button
              type="button"
              onClick={handleCompleteCurrentJob}
              className="min-h-11 rounded-xl border border-emerald-500/50 bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-100"
            >
              Complete
            </button>
          </div>
        ) : (
          <div className="mt-2 rounded-xl border border-dashed border-slate-700 p-4 text-sm text-slate-400">
            No current job.
          </div>
        )}
      </section>

      <section className="ops-panel rounded-2xl p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-lg font-semibold text-slate-100">Live Flight List</h3>
          <span className="text-xs text-slate-400">{todaysTuiFlights.length} flights</span>
        </div>
        <LiveFlightList flights={todaysTuiFlights} />
      </section>

      <section className="ops-panel rounded-2xl p-4 sm:p-5">
        <h3 className="mb-3 text-lg font-semibold text-slate-100">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <PasteFlightLink />
        </div>
      </section>
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <article className="rounded-xl border border-slate-700 bg-slate-900/55 p-3">
      <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-100 sm:text-base">{value}</p>
    </article>
  );
}

function isTuiFlight(flight) {
  const airline = String(flight?.airline || "").toUpperCase();
  const flightNumber = String(flight?.flightNumber || "").toUpperCase();
  return airline.includes("TUI") || flightNumber.startsWith("BY");
}

function isArrival(flight) {
  const movement = String(flight?.movement || flight?.type || "").toLowerCase();
  return movement.startsWith("arr");
}

function isDeparture(flight) {
  const movement = String(flight?.movement || flight?.type || "").toLowerCase();
  return movement.startsWith("dep");
}

function toMinutes(value) {
  const match = String(value || "").trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return Number.MAX_SAFE_INTEGER;
  return Number(match[1]) * 60 + Number(match[2]);
}
