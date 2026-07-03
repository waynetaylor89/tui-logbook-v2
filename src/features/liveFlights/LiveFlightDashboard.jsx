import { useEffect, useMemo, useRef, useState } from "react";
import useLogbookStore from "../../store/useLogbookStore.js";
import { toast } from "../../components/Toast.jsx";
import ConnectionStatus from "../../components/ConnectionStatus.jsx";
import OfflineIndicator from "../../components/OfflineIndicator.jsx";
import FlightRefreshButton from "./FlightRefreshButton.jsx";
import LiveFlightList from "./LiveFlightList.jsx";
import PasteFlightLink from "../import/PasteFlightLink.jsx";
import {
  getTodaysFlights,
  refreshFlights,
  getCacheTimestamp,
  getCacheSource,
} from "../../services/flightFeed/flightFeedService.js";

function formatTimeAgo(timestamp) {
  if (!timestamp) return null;
  const diff = Date.now() - Number(timestamp);
  if (diff < 0) return "just now";
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes === 1) return "1 minute ago";
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  const remain = minutes % 60;
  if (hours === 1) return `1 hour ${remain} min ago`;
  return `${hours} hours ${remain} min ago`;
}

export default function LiveFlightDashboard() {
  const {
    flights,
    shiftJobs,
    setFlights,
    importDailySchedule,
    addFlightToShift,
    toggleShiftChecklistItem,
    addShiftJobNote,
    completeShiftJob,
  } = useLogbookStore();
  const hasInitialised = useRef(false);
  const [noteText, setNoteText] = useState("");
  const [feedSource, setFeedSource] = useState(() => {
    const cached = getCacheSource();
    return cached || "";
  });
  const [lastRefresh, setLastRefresh] = useState(() => {
    const ts = getCacheTimestamp();
    return ts || null;
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  // Initial load — use FlightFeedService instead of AviationStack
  useEffect(() => {
    if (hasInitialised.current) return;
    hasInitialised.current = true;

    // Load flights from the feed service (uses cache -> FR24 -> mock priority)
    const result = getTodaysFlights({
      storeFlights: flights,
      forceRefresh: false,
    });

    if (result.flights && result.flights.length > 0) {
      setFeedSource(result.source);
      setLastRefresh(result.timestamp || Date.now());

      // Only replace flights if we have data
      if (importDailySchedule) {
        importDailySchedule(result.flights, {
          replaceToday: true,
          summary: {
            flightsImported: result.flights.length,
            arrivals: result.flights.filter((f) => String(f.direction || f.movement || f.type || "").toLowerCase().startsWith("arr")).length,
            departures: result.flights.filter((f) => String(f.direction || f.movement || f.type || "").toLowerCase().startsWith("dep")).length,
            duplicates: 0,
            errors: 0,
          },
        });
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleRefresh() {
    setIsRefreshing(true);

    try {
      const result = refreshFlights({
        storeFlights: flights,
        setFlights,
        importDailySchedule,
      });

      if (!result.ok || !result.flights.length) {
        toast.warning("No new flight data available. Using existing data.");
        setIsRefreshing(false);
        return;
      }

      setFeedSource(result.source);
      setLastRefresh(Date.now());
      toast.success(`Feed refreshed from ${result.source}.`);
    } catch (error) {
      toast.error("Refresh failed. Existing flights preserved.");
    } finally {
      setIsRefreshing(false);
    }
  }

  function getSourceBadge() {
    const source = feedSource || "MOCK";
    const colors = {
      LIVE: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
      "FR24 IMPORT": "border-sky-500/40 bg-sky-500/10 text-sky-300",
      CACHE: "border-amber-500/40 bg-amber-500/10 text-amber-300",
      MOCK: "border-slate-500/40 bg-slate-500/10 text-slate-300",
    };
    const cls = colors[source] || colors.MOCK;
    return (
      <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${cls}`}>
        {source}
      </span>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      <section className="ops-panel rounded-2xl p-4 sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Flight Feed</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-100">Today's TUI Flights</h2>
            <p className="mt-1 text-sm text-slate-300">TUI Flight Feed Service – offline-capable, cache-first.</p>
          </div>
          <div className="flex items-center gap-2">
            {getSourceBadge()}
            <FlightRefreshButton refreshing={isRefreshing} onRefresh={handleRefresh} />
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <ConnectionStatus lastSync={lastRefresh ? new Date(lastRefresh).toISOString() : ""} />
          <div className="rounded-xl border border-slate-700 bg-slate-900/55 px-3 py-2 text-xs text-slate-200">
            {lastRefresh ? `Updated ${formatTimeAgo(lastRefresh)}` : "Not refreshed yet"}
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-900/55 px-3 py-2 text-xs text-slate-200">
            Source: {feedSource || "MOCK"}
          </div>
        </div>

        <div className="mt-2">
          <OfflineIndicator
            fromCache={feedSource === "CACHE"}
            cachedFlights={todaysTuiFlights.length}
            lastSync={lastRefresh ? new Date(lastRefresh).toISOString() : ""}
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
  const movement = String(flight?.movement || flight?.type || flight?.direction || "").toLowerCase();
  return movement.startsWith("arr");
}

function isDeparture(flight) {
  const movement = String(flight?.movement || flight?.type || flight?.direction || "").toLowerCase();
  return movement.startsWith("dep");
}

function toMinutes(value) {
  const match = String(value || "").trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return Number.MAX_SAFE_INTEGER;
  return Number(match[1]) * 60 + Number(match[2]);
}
