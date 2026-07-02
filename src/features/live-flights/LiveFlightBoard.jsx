import { useEffect, useMemo, useRef } from "react";
import useLogbookStore from "../../store/useLogbookStore.js";
import { toast } from "../../components/Toast.jsx";
import { isTuiFlight } from "../../utils/airlines.js";
import FlightCard from "./components/FlightCard.jsx";
import FlightFilters from "./components/FlightFilters.jsx";
import RefreshButton from "./components/RefreshButton.jsx";

export default function LiveFlightBoard() {
  const {
    flights,
    claimFlight,
    currentUser,
    refreshLiveFlights,
    liveFlightsMeta,
    getLiveFlightBoardFilter,
    setLiveFlightBoardFilter,
  } = useLogbookStore();

  const hasAutoRefreshed = useRef(false);
  const selectedFilter = getLiveFlightBoardFilter();
  const today = new Date().toISOString().slice(0, 10);

  const todaysFlights = useMemo(() => {
    return (flights || [])
      .filter((flight) => (flight.date || today) === today)
      .sort((a, b) => toMinutes(a.scheduledTime) - toMinutes(b.scheduledTime));
  }, [flights, today]);

  const filteredFlights = useMemo(() => {
    return todaysFlights.filter((flight) => matchesFilter(flight, selectedFilter));
  }, [todaysFlights, selectedFilter]);

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

    toast.success(`Flights refreshed: ${result.importedFlights} imported.`);
  }

  function handleClaim(flight) {
    if (!flight?.id || flight.claimed) return;
    claimFlight(flight.id, { claimedBy: currentUser || "Wayne" });
    toast.success(`Claimed ${flight.flightNumber || "flight"}.`);
  }

  const tuiCount = todaysFlights.filter((flight) => isTuiFlight(flight)).length;

  return (
    <div className="space-y-4">
      <section className="ops-panel rounded-2xl p-4 sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Feature</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-100">Live Flight Board</h2>
            <p className="mt-1 text-sm text-slate-400">AviationStack arrivals and departures for Manchester, merged into one board.</p>
          </div>
          <RefreshButton refreshing={Boolean(liveFlightsMeta?.refreshing)} onRefresh={handleRefresh} />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2 text-xs text-slate-200 sm:grid-cols-4">
          <MetaPill label="Last Updated" value={liveFlightsMeta?.lastUpdated ? new Date(liveFlightsMeta.lastUpdated).toLocaleString() : "Not refreshed yet"} />
          <MetaPill label="Live Status" value={liveFlightsMeta?.refreshing ? "Refreshing..." : liveFlightsMeta?.status || "Idle"} />
          <MetaPill label="Imported Flights" value={String(liveFlightsMeta?.importedFlights ?? 0)} />
          <MetaPill label="TUI Flights" value={String(liveFlightsMeta?.tuiFlights || tuiCount)} />
        </div>

        {liveFlightsMeta?.fromCache ? (
          <p className="mt-3 text-xs text-amber-300">Offline support active: currently showing cached flights.</p>
        ) : null}
      </section>

      <FlightFilters value={selectedFilter} onChange={setLiveFlightBoardFilter} />

      <section className="ops-panel rounded-2xl p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-lg font-semibold text-slate-100">Today's Flights</h3>
          <p className="text-xs text-slate-400">{filteredFlights.length} visible</p>
        </div>

        {filteredFlights.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-700 p-8 text-center text-sm text-slate-400">
            No flights match the selected filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filteredFlights.map((flight) => (
              <FlightCard
                key={flight.id}
                flight={flight}
                canClaim={!flight.claimed}
                onClaim={handleClaim}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function MetaPill({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/55 px-3 py-2">
      <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-100">{value}</p>
    </div>
  );
}

function matchesFilter(flight, selectedFilter) {
  const movement = String(flight.movement || flight.type || "").toLowerCase();
  const status = String(flight.status || "").toLowerCase();

  if (selectedFilter === "TUI") return isTuiFlight(flight);
  if (selectedFilter === "Arrivals") return movement.startsWith("arr");
  if (selectedFilter === "Departures") return movement.startsWith("dep");

  if (selectedFilter === "Delayed") {
    return status.includes("delay");
  }

  if (selectedFilter === "Completed") {
    return status.includes("landed") || status.includes("arriv") || status.includes("complete") || status.includes("closed");
  }

  if (selectedFilter === "Active") {
    return !status.includes("delay") && !status.includes("landed") && !status.includes("arriv") && !status.includes("complete") && !status.includes("closed") && !status.includes("cancel");
  }

  return true;
}

function toMinutes(time) {
  const value = String(time || "").trim();
  const match = value.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return 0;
  return Number(match[1]) * 60 + Number(match[2]);
}
