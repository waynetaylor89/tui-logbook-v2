import FleetManager from "../components/FleetManager.jsx";
import KpiTile from "../components/dashboard/KpiTile.jsx";
import SectionPanel from "../components/dashboard/SectionPanel.jsx";
import FlightStrip from "../components/dashboard/FlightStrip.jsx";
import StatisticsOverview from "../components/dashboard/StatisticsOverview.jsx";
import { useMemo, useState } from "react";
import useLogbookStore from "../store/useLogbookStore.js";
import DailyImportButton from "../features/dailyImport/DailyImportButton.jsx";
import DailyImportDialog from "../features/dailyImport/DailyImportDialog.jsx";
import DailyImportHistory from "../features/dailyImport/DailyImportHistory.jsx";
import AirlineFilter from "../components/AirlineFilter.jsx";
import { getDetectedAirlines, isTuiFlight, matchAirline, withDetectedAirline } from "../utils/airlines.js";

export default function HomePage({
  stats,
  history,
  newReg,
  setNewReg,
  newType,
  setNewType,
  tuiAircraftTypes,
  handleAddAircraftToFleet,
  handleResetFleet,
}) {
  const { flights, shiftJobs, dailyImportHistory, getSelectedAirline, setSelectedAirline, getShowOtherAirlines } = useLogbookStore();
  const [showDailyImportDialog, setShowDailyImportDialog] = useState(false);
  const selectedAirline = getSelectedAirline();
  const showOtherAirlines = getShowOtherAirlines();
  const effectiveSelectedAirline = showOtherAirlines ? selectedAirline : "TUI Airways";

  const allEntries = Object.values(history || {}).flat();
  const today = new Date().toISOString().slice(0, 10);
  const flightsWithAirline = useMemo(() => (flights || []).map((flight) => withDetectedAirline(flight)), [flights]);
  const airlines = useMemo(() => getDetectedAirlines(flightsWithAirline), [flightsWithAirline]);
  const todaysFlights = flightsWithAirline.filter(
    (flight) =>
      (flight.date || today) === today &&
      (showOtherAirlines ? matchAirline(flight, effectiveSelectedAirline) : isTuiFlight(flight))
  );
  const todaysShiftJobs = (shiftJobs || []).filter((job) => {
    const flight = flightsWithAirline.find((f) => f.id === job.flightId);
    const linked = flight || job;
    const matchesAirline = showOtherAirlines
      ? matchAirline(linked, effectiveSelectedAirline)
      : isTuiFlight(linked);
    return (flight?.date || today) === today && matchesAirline;
  });
  const shiftCompleted = todaysShiftJobs.filter((job) => job.jobState === "Completed").length;
  const lastImport = (dailyImportHistory || [])[0] || null;

  const todaysEntries = allEntries.filter((entry) => entry.date === today);
  const aircraftToday = new Set(todaysEntries.map((entry) => entry.aircraft)).size;
  const jobsCompleted = todaysEntries.length;
  const averagePerAircraft = aircraftToday > 0 ? (jobsCompleted / aircraftToday).toFixed(1) : "0.0";
  const recentActivity = [...allEntries].slice(-6).reverse();

  const shiftStartHour = 6;
  const shiftEndHour = 18;
  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;
  const shiftProgress = Math.min(Math.max(((currentHour - shiftStartHour) / (shiftEndHour - shiftStartHour)) * 100, 0), 100);
  const hoursLeft = Math.max(shiftEndHour - currentHour, 0).toFixed(1);

  return (
    <div className="space-y-4">
      <section className="ops-panel overflow-hidden rounded-2xl p-5 sm:p-6">
        <div className="relative">
          <div className="pointer-events-none absolute -right-20 -top-16 h-48 w-48 rounded-full bg-sky-500/20 blur-3xl" />
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Ground Ops Dashboard</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-100 sm:text-3xl">Modern Airport Operations Interface</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            Operational overview designed for ramp teams. Flight data below is placeholder only until live feeds are connected.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiTile
          label="Today's Flights"
          value={todaysFlights.length}
          detail={lastImport ? `Imported ${new Date(lastImport.importTime).toLocaleTimeString()}` : "Awaiting import"}
          icon="🛫"
          tone="sky"
        />
        <KpiTile
          label="My Shift Jobs"
          value={todaysShiftJobs.length}
          detail={`${shiftCompleted} completed`}
          icon="✅"
          tone="emerald"
        />
        <KpiTile
          label="Aircraft Today"
          value={aircraftToday || stats.aircraftToday || 0}
          detail="Unique registrations"
          icon="✈️"
          tone="amber"
        />
        <KpiTile
          label="Statistics"
          value={stats.totalMovements || 0}
          detail="All recorded movements"
          icon="📊"
          tone="rose"
        />
      </section>

      <AirlineFilter
        airlines={airlines}
        selectedAirline={effectiveSelectedAirline}
        onSelect={setSelectedAirline}
        showOtherAirlines={showOtherAirlines}
      />

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.2fr]">
        <SectionPanel
          title="Daily Flight Import"
          subtitle="One-click import for today's TUI Manchester schedule"
          rightContent={<DailyImportButton onClick={() => setShowDailyImportDialog(true)} />}
        >
          <p className="text-sm text-slate-300">
            Upload CSV, XLSX, or JSON. Only TUI arrivals/departures are imported.
          </p>
        </SectionPanel>

        <DailyImportHistory historyItems={dailyImportHistory || []} />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionPanel title="Today's Flights" subtitle="Live board generated from today's import">
          <ul className="space-y-2">
            {todaysFlights.slice(0, 16).map((flight) => (
              <FlightStrip
                key={`${flight.id || flight.flightNumber}-${flight.scheduledTime || ""}`}
                flight={{
                  flightNumber: flight.flightNumber || "Unknown",
                  status: flight.status || "Scheduled",
                  time: flight.scheduledTime || "--:--",
                  stand: flight.stand || "TBC",
                  route: `${flight.origin || "?"} -> ${flight.destination || "?"}`,
                  aircraft: flight.aircraftType || flight.aircraft || flight.registration || "TUI",
                }}
              />
            ))}
            {todaysFlights.length === 0 ? (
              <li className="rounded-xl border border-dashed border-slate-700 p-4 text-sm text-slate-400">
                No flights found for the selected airline.
              </li>
            ) : null}
          </ul>
        </SectionPanel>

        <SectionPanel
          title="My Shift"
          subtitle="06:00 to 18:00 duty window"
          rightContent={<span className="ops-pill rounded-full px-3 py-1 text-xs text-emerald-300">Active</span>}
        >
          <div className="grid grid-cols-2 gap-3">
            <article className="rounded-xl border border-slate-700 bg-slate-900/50 p-3">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Hours Remaining</p>
              <p className="mt-1 text-2xl font-semibold text-slate-100">{hoursLeft}h</p>
            </article>
            <article className="rounded-xl border border-slate-700 bg-slate-900/50 p-3">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Jobs / Aircraft</p>
              <p className="mt-1 text-2xl font-semibold text-slate-100">{averagePerAircraft}</p>
            </article>
          </div>

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
              <span>Shift Progress</span>
              <span>{shiftProgress.toFixed(0)}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-800">
              <div className="h-2 rounded-full bg-gradient-to-r from-sky-400 to-emerald-400" style={{ width: `${shiftProgress}%` }} />
            </div>
          </div>
        </SectionPanel>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <StatisticsOverview history={history} />
        </div>

        <SectionPanel title="Recent Activity" subtitle="Latest recorded actions">
          <ul className="space-y-2">
            {recentActivity.map((entry) => (
              <li key={entry.id} className="rounded-xl border border-slate-700 bg-slate-900/40 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-slate-100">{entry.aircraft}</p>
                  <p className="text-xs text-slate-400">{entry.time || "--:--"}</p>
                </div>
                <p className="mt-1 text-xs text-slate-300">
                  {entry.movementType} • {entry.fromStand}{" -> "}{entry.toStand}
                </p>
              </li>
            ))}
            {recentActivity.length === 0 && (
              <li className="rounded-xl border border-dashed border-slate-700 p-4 text-sm text-slate-400">
                No recent activity. Add a movement to populate this feed.
              </li>
            )}
          </ul>
        </SectionPanel>
      </section>

      <section>
        <SectionPanel title="Aircraft Today" subtitle="Roster management">
          <FleetManager
            newReg={newReg}
            setNewReg={setNewReg}
            newType={newType}
            setNewType={setNewType}
            tuiAircraftTypes={tuiAircraftTypes}
            addAircraftToFleet={handleAddAircraftToFleet}
            resetFleet={handleResetFleet}
          />
        </SectionPanel>
      </section>

      <DailyImportDialog
        open={showDailyImportDialog}
        onClose={() => setShowDailyImportDialog(false)}
      />
    </div>
  );
}
