import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useLogbookStore from "../../store/useLogbookStore.js";
import SectionPanel from "../../components/dashboard/SectionPanel.jsx";
import OpsMetricCard from "../../components/dashboard/OpsMetricCard.jsx";
import OpsQuickActionCard from "../../components/dashboard/OpsQuickActionCard.jsx";
import AirlineFilter from "../../components/AirlineFilter.jsx";
import ConnectionStatus from "../../components/ConnectionStatus.jsx";
import OfflineIndicator from "../../components/OfflineIndicator.jsx";
import { toast } from "../../components/Toast.jsx";
import { getDetectedAirlines, isTuiFlight, matchAirline, withDetectedAirline } from "../../utils/airlines.js";

export default function StatisticsPage() {
  const {
    flights,
    shiftJobs,
    history,
    dailyImportHistory,
    fr24ImportHistory,
    claimFlight,
    currentUser,
    getSelectedAirline,
    setSelectedAirline,
    getShowOtherAirlines,
    refreshLiveFlights,
    liveFlightsMeta,
  } = useLogbookStore();

  const navigate = useNavigate();

  const [quickSearch, setQuickSearch] = useState("");
  const [showFabMenu, setShowFabMenu] = useState(false);
  const [swipedFlightId, setSwipedFlightId] = useState("");
  const [longPressedFlightId, setLongPressedFlightId] = useState("");
  const [temporaryShowOtherAirlines, setTemporaryShowOtherAirlines] = useState(false);
  const touchStartXRef = useRef(0);
  const longPressTimerRef = useRef(null);

  const today = new Date().toISOString().slice(0, 10);
  const selectedAirline = getSelectedAirline();
  const showOtherAirlines = getShowOtherAirlines();
  const enforceTuiMode = !showOtherAirlines && !temporaryShowOtherAirlines;
  const effectiveSelectedAirline = enforceTuiMode ? "TUI Airways" : selectedAirline;

  const allEntries = useMemo(() => Object.values(history || {}).flat(), [history]);
  const flightsWithAirline = useMemo(() => (flights || []).map((flight) => withDetectedAirline(flight)), [flights]);
  const airlines = useMemo(() => getDetectedAirlines(flightsWithAirline), [flightsWithAirline]);

  const todayFlights = useMemo(
    () => flightsWithAirline.filter((flight) => {
      if ((flight.date || today) !== today) return false;
      return enforceTuiMode ? isTuiFlight(flight) : matchAirline(flight, effectiveSelectedAirline);
    }),
    [flightsWithAirline, today, enforceTuiMode, effectiveSelectedAirline]
  );

  const todayEntries = useMemo(
    () => allEntries.filter((entry) => entry.date === today),
    [allEntries, today]
  );

  const searchQuery = quickSearch.trim().toLowerCase();
  const searchableTodayFlights = useMemo(() => {
    if (!searchQuery) return todayFlights;
    return todayFlights.filter((flight) => {
      const text = `${flight.flightNumber || ""} ${flight.registration || ""} ${flight.aircraftRegistration || ""} ${flight.origin || ""} ${flight.destination || ""} ${flight.stand || ""}`.toLowerCase();
      return text.includes(searchQuery);
    });
  }, [todayFlights, searchQuery]);

  const shiftSummary = useMemo(() => {
    const jobs = (shiftJobs || []).filter((job) => {
      const linked = flightsWithAirline.find((flight) => flight.id === job.flightId);
      const matchesAirline = enforceTuiMode
        ? isTuiFlight(linked || job)
        : matchAirline(linked || job, effectiveSelectedAirline);
      return (linked?.date || today) === today && matchesAirline;
    });

    const completed = jobs.filter((job) => job.jobState === "Completed").length;
    const started = jobs.filter((job) => job.jobState === "In Progress").length;

    return {
      total: jobs.length,
      started,
      completed,
      queued: Math.max(jobs.length - started - completed, 0),
    };
  }, [shiftJobs, flightsWithAirline, today, enforceTuiMode, effectiveSelectedAirline]);

  const movementSummary = useMemo(() => {
    const arrivals = todayFlights.filter((flight) => (flight.movement || flight.type) === "Arrival").length;
    const departures = todayFlights.filter((flight) => (flight.movement || flight.type) === "Departure").length;
    return { arrivals, departures };
  }, [todayFlights]);

  const handleLiveRefresh = async () => {
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
  };

  const upcomingFlights = useMemo(() => {
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    return searchableTodayFlights
      .filter((flight) => toMinutes(flight.scheduledTime) >= nowMinutes)
      .sort((a, b) => toMinutes(a.scheduledTime) - toMinutes(b.scheduledTime));
  }, [searchableTodayFlights]);

  const recentFlights = useMemo(() => {
    return [...searchableTodayFlights]
      .sort((a, b) => toMinutes(b.scheduledTime) - toMinutes(a.scheduledTime))
      .slice(0, 8);
  }, [searchableTodayFlights]);

  const flightsClaimed = useMemo(
    () => searchableTodayFlights.filter((flight) => Boolean(flight.claimed)).length,
    [searchableTodayFlights]
  );

  const currentShift = useMemo(() => {
    const active = (shiftJobs || []).find((job) => {
      const linked = flightsWithAirline.find((flight) => flight.id === job.flightId);
      const matchesAirline = enforceTuiMode
        ? isTuiFlight(linked || job)
        : matchAirline(linked || job, effectiveSelectedAirline);
      return matchesAirline && String(job.jobState || "").toLowerCase() === "in progress";
    });

    if (active) {
      return `Active: ${active.flightNumber || "Shift Job"}`;
    }

    return shiftSummary.total > 0
      ? `Queued ${shiftSummary.queued} • Completed ${shiftSummary.completed}`
      : "No active shift jobs";
  }, [shiftJobs, flightsWithAirline, enforceTuiMode, effectiveSelectedAirline, shiftSummary]);

  const activeJob = useMemo(() => {
    return (shiftJobs || []).find((job) => {
      const linked = flightsWithAirline.find((flight) => flight.id === job.flightId);
      const matchesAirline = enforceTuiMode
        ? isTuiFlight(linked || job)
        : matchAirline(linked || job, effectiveSelectedAirline);
      return matchesAirline && String(job.jobState || "").toLowerCase() === "in progress";
    }) || null;
  }, [shiftJobs, flightsWithAirline, enforceTuiMode, effectiveSelectedAirline]);

  const workedAircraft = useMemo(() => {
    const set = new Set();

    todayEntries.forEach((entry) => {
      if (entry.aircraft) set.add(entry.aircraft);
    });

    (shiftJobs || []).forEach((job) => {
      const linked = flightsWithAirline.find((flight) => flight.id === job.flightId);
      if ((linked?.date || today) !== today) return;
      const matchesAirline = enforceTuiMode
        ? isTuiFlight(linked || job)
        : matchAirline(linked || job, effectiveSelectedAirline);
      if (!matchesAirline) return;
      const reg = job.aircraftRegistration || linked?.aircraftRegistration || linked?.registration;
      const type = job.aircraftType || linked?.aircraftType || linked?.aircraft;
      if (reg || type) {
        set.add([reg || "", type || ""].filter(Boolean).join(" - "));
      }
    });

    return Array.from(set).filter(Boolean).sort();
  }, [todayEntries, shiftJobs, flightsWithAirline, today, enforceTuiMode, effectiveSelectedAirline]);

  const latestImport = useMemo(() => {
    const daily = (dailyImportHistory || []).map((item) => ({
      at: item.importTime,
      source: "Daily Import",
      status: item.errors > 0 ? "Completed with warnings" : "Completed",
    }));
    const fr24 = (fr24ImportHistory || []).map((item) => ({
      at: item.importedAt,
      source: "FlightRadar24",
      status: item.errors > 0 ? "Completed with warnings" : "Completed",
    }));
    const merged = [...daily, ...fr24]
      .filter((item) => item.at)
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
    return merged[0] || null;
  }, [dailyImportHistory, fr24ImportHistory]);

  const recentActivity = useMemo(() => {
    const fromHistory = todayEntries
      .slice(-6)
      .reverse()
      .map((entry) => ({
        id: entry.id,
        time: entry.time || "--:--",
        title: entry.aircraft || "Aircraft",
        detail: `${entry.movementType || "Movement"} • ${entry.fromStand || "--"} -> ${entry.toStand || "--"}`,
      }));

    if (fromHistory.length > 0) {
      return fromHistory;
    }

    return (shiftJobs || [])
      .filter((job) => {
        const linked = flightsWithAirline.find((flight) => flight.id === job.flightId);
        return enforceTuiMode
          ? isTuiFlight(linked || job)
          : matchAirline(linked || job, effectiveSelectedAirline);
      })
      .slice(0, 6)
      .map((job) => ({
        id: job.id,
        time: job.scheduledTime || "--:--",
        title: job.flightNumber || "Flight",
        detail: `${job.jobState || "Queued"} • ${job.origin || "?"} -> ${job.destination || "?"}`,
      }));
  }, [todayEntries, shiftJobs, flightsWithAirline, enforceTuiMode, effectiveSelectedAirline]);

  const handleQuickClaim = (flight) => {
    if (!flight?.id || flight.claimed) return;
    claimFlight(flight.id, { claimedBy: currentUser || "Wayne" });
  };

  const handleTouchStart = (flightId, event) => {
    touchStartXRef.current = event.changedTouches?.[0]?.clientX || 0;
    if (longPressTimerRef.current) window.clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = window.setTimeout(() => {
      setLongPressedFlightId(flightId);
    }, 520);
  };

  const handleTouchEnd = (flightId, event) => {
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    const endX = event.changedTouches?.[0]?.clientX || 0;
    const deltaX = touchStartXRef.current - endX;
    if (deltaX > 48) {
      setSwipedFlightId(flightId);
    } else if (deltaX < -30) {
      setSwipedFlightId("");
      setLongPressedFlightId("");
    }
  };

  return (
    <div className="space-y-5 pb-24">
      <section className="ops-panel ops-fade-in relative overflow-hidden rounded-2xl p-4 sm:p-6">
        <div className="pointer-events-none absolute -right-16 -top-14 h-44 w-44 rounded-full bg-cyan-400/15 blur-3xl" />
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Sprint 20</p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-100">Daily Workflow</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">Optimised daily operations flow with quick search, quick claim, gesture actions, and offline-aware import status.</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <ConnectionStatus lastSync={liveFlightsMeta?.lastUpdated || latestImport?.at || ""} />
          <div className="rounded-xl border border-slate-700 bg-slate-900/55 px-3 py-2 text-xs text-slate-200">
            Last Import Time: {latestImport?.at ? new Date(latestImport.at).toLocaleString() : "No imports yet"}
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-900/55 px-3 py-2 text-xs text-slate-200">
            Import Status: {latestImport?.status || "Idle"} {latestImport?.source ? `(${latestImport.source})` : ""}
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

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_2fr]">
        <SectionPanel title="Import FlightRadar24" subtitle="Start import workflow">
          <Link to="/import" className="ops-card-lift block rounded-xl border border-sky-500/40 bg-sky-500/10 p-4 text-sm text-sky-100">
            Open FlightRadar24 import wizard
          </Link>
        </SectionPanel>
        <SectionPanel title="Quick Search" subtitle="Search today's flights quickly">
          <input
            value={quickSearch}
            onChange={(event) => setQuickSearch(event.target.value)}
            placeholder="Flight number, registration, stand, route"
            className="min-h-12 w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500"
          />
        </SectionPanel>
      </section>

      <SectionPanel title="Today's Flights" subtitle="Live provider refresh status">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-xl border border-slate-700 bg-slate-900/55 px-3 py-2 text-sm text-slate-200">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Live Status</p>
            <p className="mt-1 font-medium text-slate-100">{liveFlightsMeta?.refreshing ? "Refreshing..." : liveFlightsMeta?.status || "Idle"}</p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-900/55 px-3 py-2 text-sm text-slate-200">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Last Updated</p>
            <p className="mt-1 font-medium text-slate-100">{liveFlightsMeta?.lastUpdated ? new Date(liveFlightsMeta.lastUpdated).toLocaleString() : "Not refreshed yet"}</p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-900/55 px-3 py-2 text-sm text-slate-200">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Imported Flights</p>
            <p className="mt-1 font-medium text-slate-100">{Number(liveFlightsMeta?.importedFlights || 0)}</p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-900/55 px-3 py-2 text-sm text-slate-200">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-400">TUI Flights</p>
            <p className="mt-1 font-medium text-slate-100">{Number(liveFlightsMeta?.tuiFlights || 0)}</p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-900/55 px-3 py-2 text-sm text-slate-200">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Other Airlines Hidden</p>
            <p className="mt-1 font-medium text-slate-100">{showOtherAirlines ? "No" : "Yes"}</p>
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleLiveRefresh}
              disabled={Boolean(liveFlightsMeta?.refreshing)}
              className="min-h-11 w-full rounded-xl border border-cyan-400/50 bg-cyan-500/15 px-4 py-2 text-sm font-semibold text-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {liveFlightsMeta?.refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>
      </SectionPanel>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <OpsMetricCard
          title="Today's TUI Flights"
          value={todayFlights.length}
          detail={`${movementSummary.arrivals} arrivals • ${movementSummary.departures} departures`}
          icon="🛫"
          tone="sky"
        />
        <OpsMetricCard
          title="Today's Arrivals"
          value={movementSummary.arrivals}
          detail="Inbound flights"
          icon="🛬"
          tone="emerald"
        />
        <OpsMetricCard
          title="Today's Departures"
          value={movementSummary.departures}
          detail="Outbound flights"
          icon="🛫"
          tone="amber"
        />
        <OpsMetricCard
          title="Flights Claimed"
          value={flightsClaimed}
          detail="Claimed by ramp agents"
          icon="👷"
          tone="emerald"
        />
        <OpsMetricCard
          title="Completed Flights"
          value={shiftSummary.completed}
          detail="Completed shift tasks"
          icon="✅"
          tone="amber"
        />
        <OpsMetricCard
          title="Aircraft Worked"
          value={workedAircraft.length}
          detail="Unique aircraft touched"
          icon="✈"
          tone="rose"
        />
        <OpsMetricCard
          title="Upcoming Flights"
          value={upcomingFlights.length}
          detail="Still to operate today"
          icon="⏭"
          tone="sky"
        />
        <OpsMetricCard
          title="Today's Statistics"
          value={shiftSummary.total}
          detail={currentShift}
          icon="⏱"
          tone="rose"
        />
      </section>

      <AirlineFilter
        airlines={airlines}
        selectedAirline={effectiveSelectedAirline}
        onSelect={setSelectedAirline}
        showOtherAirlines={showOtherAirlines}
        temporaryOverride={temporaryShowOtherAirlines}
        onTemporaryOverride={() => {
          setTemporaryShowOtherAirlines(true);
          setSelectedAirline("All Airlines");
        }}
        onClearTemporaryOverride={() => setTemporaryShowOtherAirlines(false)}
      />

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <SectionPanel title="Today's Flights" subtitle="Swipe for actions • long press for quick menu">
          <ul className="space-y-2">
            {searchableTodayFlights.slice(0, 8).map((flight) => {
              const isSwiped = swipedFlightId === flight.id;
              const isLongPressed = longPressedFlightId === flight.id;
              return (
                <li
                  key={flight.id}
                  onTouchStart={(event) => handleTouchStart(flight.id, event)}
                  onTouchEnd={(event) => handleTouchEnd(flight.id, event)}
                  className={`ops-card-lift rounded-xl border border-slate-700 bg-slate-900/50 p-3 transition ${isSwiped ? "translate-x-[-6px] border-cyan-400/50" : ""}`}
                >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-100">{flight.flightNumber || "Unknown"}</p>
                  <p className="text-xs text-slate-400">{flight.scheduledTime || "--:--"}</p>
                </div>
                <p className="mt-1 text-xs text-slate-300">{flight.origin || "?"} {" -> "} {flight.destination || "?"}</p>
                <p className="mt-1 text-xs text-slate-500">{flight.status || "Scheduled"} • Stand {flight.stand || "--"} • Gate {flight.gate || "--"}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickClaim(flight)}
                    disabled={flight.claimed}
                    className="min-h-9 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200 disabled:opacity-50"
                  >
                    Quick Claim
                  </button>
                  {isSwiped ? (
                    <>
                      <button
                        type="button"
                        onClick={() => navigate("/flights")}
                        className="min-h-9 rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200"
                      >
                        Swipe Action: Open Board
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickClaim(flight)}
                        className="min-h-9 rounded-lg border border-sky-500/40 bg-sky-500/10 px-3 py-1 text-xs text-sky-200"
                      >
                        Swipe Action: Claim
                      </button>
                    </>
                  ) : null}
                  {isLongPressed ? (
                    <>
                      <button
                        type="button"
                        onClick={() => navigate("/my-shift")}
                        className="min-h-9 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs text-amber-200"
                      >
                        Long Press: Continue Job
                      </button>
                      <button
                        type="button"
                        onClick={() => setLongPressedFlightId("")}
                        className="min-h-9 rounded-lg border border-slate-600 bg-slate-900/60 px-3 py-1 text-xs text-slate-300"
                      >
                        Close
                      </button>
                    </>
                  ) : null}
                </div>
                </li>
              );
            })}
            {searchableTodayFlights.length === 0 ? (
              <li className="rounded-xl border border-dashed border-slate-700 p-4 text-sm text-slate-400">
                No flights for today's current filter/search.
              </li>
            ) : null}
          </ul>
        </SectionPanel>

        <SectionPanel title="My Shift" subtitle="Live execution tracking">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <OpsMiniStat label="Started" value={shiftSummary.started} />
            <OpsMiniStat label="Completed" value={shiftSummary.completed} />
            <OpsMiniStat label="Queued" value={shiftSummary.queued} />
          </div>
          <div className="mt-4 h-3 rounded-full bg-slate-800">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
              style={{ width: `${shiftSummary.total > 0 ? (shiftSummary.completed / shiftSummary.total) * 100 : 0}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-400">Completion progress for today's assigned shift jobs.</p>
        </SectionPanel>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <SectionPanel title="Continue Active Job" subtitle="Resume your in-progress job">
          {activeJob ? (
            <div className="rounded-xl border border-cyan-500/40 bg-cyan-500/10 p-3">
              <p className="text-sm font-semibold text-cyan-100">{activeJob.flightNumber || "Shift Job"}</p>
              <p className="mt-1 text-xs text-cyan-200">{activeJob.origin || "?"} -&gt; {activeJob.destination || "?"} • Stand {activeJob.stand || "--"}</p>
              <button
                type="button"
                onClick={() => navigate("/my-shift")}
                className="mt-2 min-h-10 rounded-lg border border-cyan-300/60 bg-cyan-500/20 px-3 py-2 text-xs text-cyan-100"
              >
                Continue Active Job
              </button>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-700 p-3 text-sm text-slate-400">No active job to continue.</div>
          )}
        </SectionPanel>

        <SectionPanel title="Today's Statistics" subtitle="Operational snapshot">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <OpsMiniStat label="Flights" value={searchableTodayFlights.length} />
            <OpsMiniStat label="Claimed" value={flightsClaimed} />
            <OpsMiniStat label="Completed" value={shiftSummary.completed} />
            <OpsMiniStat label="Arrivals" value={movementSummary.arrivals} />
            <OpsMiniStat label="Departures" value={movementSummary.departures} />
            <OpsMiniStat label="Aircraft" value={workedAircraft.length} />
          </div>
        </SectionPanel>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <SectionPanel title="Recent Flights" subtitle="Most recent flights in today's workflow">
          <ul className="space-y-2">
            {recentFlights.map((flight) => (
              <li key={`recent-${flight.id}`} className="rounded-xl border border-slate-700 bg-slate-900/55 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-slate-100">{flight.flightNumber || "Unknown"}</p>
                  <p className="text-xs text-slate-400">{flight.scheduledTime || "--:--"}</p>
                </div>
                <p className="mt-1 text-xs text-slate-300">{flight.origin || "?"} {" -> "} {flight.destination || "?"}</p>
              </li>
            ))}
            {recentFlights.length === 0 ? (
              <li className="rounded-xl border border-dashed border-slate-700 p-4 text-sm text-slate-400">
                No recent flights for today.
              </li>
            ) : null}
          </ul>
        </SectionPanel>

        <SectionPanel title="Recent Activity" subtitle="Latest on-stand actions">
          <ul className="space-y-2">
            {recentActivity.map((item) => (
              <li key={item.id} className="rounded-xl border border-slate-700 bg-slate-900/55 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-slate-100">{item.title}</p>
                  <p className="text-xs text-slate-400">{item.time}</p>
                </div>
                <p className="mt-1 text-xs text-slate-300">{item.detail}</p>
              </li>
            ))}
            {recentActivity.length === 0 ? (
              <li className="rounded-xl border border-dashed border-slate-700 p-4 text-sm text-slate-400">
                No recent activity yet.
              </li>
            ) : null}
          </ul>
        </SectionPanel>

        <SectionPanel title="Quick Actions" subtitle="Large touch controls">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <OpsQuickActionCard
              label="Install App"
              description="Install PWA on Android home screen"
              to="/statistics"
              icon="📲"
            />
            <OpsQuickActionCard
              label="Refresh Flights"
              description="Refresh live provider and update today"
              icon="🔄"
              onClick={handleLiveRefresh}
            />
            <OpsQuickActionCard
              label="My Shift"
              description="Open shift execution board"
              to="/my-shift"
              icon="👷"
            />
            <OpsQuickActionCard
              label="Flight Board"
              description="View and manage all flights"
              to="/flights"
              icon="🛫"
            />
            <OpsQuickActionCard
              label="Statistics"
              description="Open operational dashboard"
              to="/statistics"
              icon="📈"
            />
            <OpsQuickActionCard
              label="Settings"
              description="Open preferences and notifications"
              to="/settings"
              icon="⚙"
            />
          </div>
        </SectionPanel>
      </section>

      <div className="fixed bottom-24 right-4 z-30 md:bottom-6">
        <button
          type="button"
          onClick={() => setShowFabMenu((value) => !value)}
          className="ops-fab h-14 w-14 rounded-full bg-cyan-500 text-2xl font-semibold text-slate-950 shadow-lg"
          aria-label="Open daily workflow actions"
        >
          +
        </button>
        {showFabMenu ? (
          <div className="ops-fab-menu mt-2 w-48 space-y-2 rounded-xl border border-slate-700 bg-slate-950/95 p-2">
            <button type="button" onClick={() => navigate("/import")} className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-left text-xs text-slate-100">Import FR24</button>
            <button type="button" onClick={() => navigate("/flights")} className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-left text-xs text-slate-100">Open Flight Board</button>
            <button type="button" onClick={() => navigate("/my-shift")} className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-left text-xs text-slate-100">My Shift</button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function OpsMiniStat({ label, value }) {
  return (
    <article className="rounded-xl border border-slate-700 bg-slate-900/55 p-3">
      <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-100">{value}</p>
    </article>
  );
}

function toMinutes(value) {
  const match = String(value || "").trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return -1;
  return Number(match[1]) * 60 + Number(match[2]);
}
