import { useEffect, useMemo, useState } from "react";
import useLogbookStore from "../../store/useLogbookStore.js";
import AircraftSearch from "../aircraft/AircraftSearch.jsx";
import AircraftProfile from "../aircraft/AircraftProfile.jsx";

const TYPE_META = {
  "Boeing 737-800": { baseAge: 14, seatConfig: "189Y" },
  "Boeing 737 MAX 8": { baseAge: 4, seatConfig: "189Y" },
  "Boeing 787-8 Dreamliner": { baseAge: 10, seatConfig: "47J / 241Y" },
  "Boeing 787-9 Dreamliner": { baseAge: 7, seatConfig: "63J / 282Y" },
};

export default function FleetPage() {
  const {
    fleet,
    history,
    currentUser,
    aircraftProfiles,
    hasHydrated,
    initializeAircraftProfilesFromFleet,
  } = useLogbookStore();
  const movementEntries = history[currentUser] || [];

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [activityFilter, setActivityFilter] = useState("All");
  const [intelligenceSearch, setIntelligenceSearch] = useState("");
  const [intelligenceError, setIntelligenceError] = useState("");

  useEffect(() => {
    try {
      initializeAircraftProfilesFromFleet(fleet || []);
      setIntelligenceError("");
    } catch (caughtError) {
      setIntelligenceError(caughtError?.message || "Failed to initialize aircraft intelligence.");
    }
  }, [fleet, initializeAircraftProfilesFromFleet]);

  const fleetCards = useMemo(() => {
    const all = (fleet || []).map((item) => buildAircraftCard(item, movementEntries));

    return all.filter((card) => {
      const query = searchTerm.trim().toLowerCase();
      const searchMatch =
        query.length === 0 ||
        `${card.registration} ${card.aircraftType} ${card.seatConfiguration}`.toLowerCase().includes(query);

      const typeMatch = typeFilter === "All" || card.aircraftType === typeFilter;
      const worked = card.totalJobs > 0;
      const activityMatch =
        activityFilter === "All" ||
        (activityFilter === "Worked" && worked) ||
        (activityFilter === "Not Worked" && !worked);

      return searchMatch && typeMatch && activityMatch;
    });
  }, [fleet, movementEntries, searchTerm, typeFilter, activityFilter]);

  const typeOptions = useMemo(
    () => ["All", ...Array.from(new Set((fleet || []).map((item) => parseFleetItem(item).aircraftType))).sort()],
    [fleet]
  );

  const filteredProfiles = useMemo(() => {
    const query = intelligenceSearch.trim().toLowerCase();
    const profiles = aircraftProfiles || [];

    if (!query) return profiles;

    return profiles.filter((profile) => {
      const recentDestinations = (profile.recentFlights || []).map((flight) => flight.destination || "").join(" ");
      return [
        profile.registration,
        profile.aircraftType,
        profile.fleetNumber,
        profile.favouriteDestination,
        recentDestinations,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [aircraftProfiles, intelligenceSearch]);

  return (
    <div className="space-y-4">
      <section className="ops-panel rounded-2xl p-4 sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Feature</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-100">Fleet</h2>
            <p className="mt-1 text-sm text-slate-400">Modern aircraft cards with history and performance insights.</p>
          </div>
          <div className="ops-pill rounded-xl px-3 py-1.5 text-xs text-slate-300">{fleetCards.length} visible aircraft</div>
        </div>
      </section>

      <section className="ops-panel rounded-2xl p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="xl:col-span-2">
            <label className="mb-1 block text-xs uppercase tracking-[0.14em] text-slate-400">Search</label>
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Registration, type, seat config"
              className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs uppercase tracking-[0.14em] text-slate-400">Aircraft Type</label>
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100"
            >
              {typeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs uppercase tracking-[0.14em] text-slate-400">Activity</label>
            <select
              value={activityFilter}
              onChange={(event) => setActivityFilter(event.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100"
            >
              <option value="All">All</option>
              <option value="Worked">Worked</option>
              <option value="Not Worked">Not Worked</option>
            </select>
          </div>
        </div>
      </section>

      <section>
        {fleetCards.length === 0 ? (
          <div className="ops-panel rounded-2xl p-8 text-center text-sm text-slate-400">
            No aircraft match the current search and filter settings.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
            {fleetCards.map((card) => (
              <AircraftCard key={card.registration} card={card} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="ops-panel rounded-2xl p-4 sm:p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Feature</p>
          <h3 className="mt-1 text-2xl font-semibold text-slate-100">Aircraft Intelligence</h3>
          <p className="mt-1 text-sm text-slate-400">Per-aircraft operational profile with statistics, recent history, and timeline.</p>
        </div>

        <AircraftSearch searchTerm={intelligenceSearch} onSearchTermChange={setIntelligenceSearch} />

        {!hasHydrated ? (
          <div className="ops-panel rounded-2xl p-8 text-center text-sm text-slate-400">Loading aircraft intelligence...</div>
        ) : null}

        {hasHydrated && intelligenceError ? (
          <div className="ops-panel rounded-2xl border border-rose-500/40 bg-rose-500/10 p-8 text-center text-sm text-rose-200">
            {intelligenceError}
          </div>
        ) : null}

        {hasHydrated && !intelligenceError && filteredProfiles.length === 0 ? (
          <div className="ops-panel rounded-2xl p-8 text-center text-sm text-slate-400">
            No aircraft intelligence profiles yet. Complete a shift job to automatically generate profiles.
          </div>
        ) : null}

        {hasHydrated && !intelligenceError && filteredProfiles.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
            {filteredProfiles.map((profile) => (
              <AircraftProfile key={profile.registration} profile={profile} />
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}

function AircraftCard({ card }) {
  const max = Math.max(card.totalJobs, 1);
  const arrivalPct = Math.round((card.arrivals / max) * 100);
  const departurePct = Math.round((card.departures / max) * 100);

  return (
    <article className="ops-panel overflow-hidden rounded-2xl">
      <div className="relative border-b border-slate-700 bg-gradient-to-br from-sky-500/25 via-cyan-500/10 to-transparent p-4">
        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-cyan-400/20 blur-2xl" />
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-slate-300">Photo Placeholder</p>
            <h3 className="mt-1 text-xl font-semibold text-slate-100">{card.registration}</h3>
            <p className="text-sm text-slate-300">{card.aircraftType}</p>
          </div>
          <div className="rounded-xl border border-slate-500/40 bg-slate-900/40 px-3 py-2 text-2xl">✈</div>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <StatCell label="Age" value={`${card.age}y`} />
          <StatCell label="Seat Configuration" value={card.seatConfiguration} />
          <StatCell label="Total Jobs" value={String(card.totalJobs)} />
          <StatCell label="Last Worked" value={card.lastWorked} />
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-3">
          <p className="mb-2 text-xs uppercase tracking-[0.14em] text-slate-500">Statistics</p>
          <div className="space-y-2 text-xs">
            <div>
              <div className="mb-1 flex items-center justify-between text-slate-300">
                <span>Arrival Jobs</span>
                <span>{card.arrivals}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800">
                <div className="h-2 rounded-full bg-emerald-400" style={{ width: `${arrivalPct}%` }} />
              </div>
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between text-slate-300">
                <span>Departure Jobs</span>
                <span>{card.departures}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800">
                <div className="h-2 rounded-full bg-sky-400" style={{ width: `${departurePct}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-3">
          <p className="mb-2 text-xs uppercase tracking-[0.14em] text-slate-500">History</p>
          <ul className="space-y-2">
            {card.recentHistory.map((item) => (
              <li key={item.id} className="rounded-lg border border-slate-700 bg-slate-950/50 px-2 py-1.5 text-xs text-slate-300">
                <div className="flex items-center justify-between gap-2">
                  <span>{item.date || "No date"}</span>
                  <span>{item.time || "--:--"}</span>
                </div>
                <div className="mt-1">
                  {item.movementType || "Movement"} • {item.fromStand || "--"} {" -> "} {item.toStand || "--"}
                </div>
              </li>
            ))}
            {card.recentHistory.length === 0 ? (
              <li className="text-xs text-slate-500">No movement history recorded.</li>
            ) : null}
          </ul>
        </div>
      </div>
    </article>
  );
}

function StatCell({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-2">
      <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-100">{value}</p>
    </div>
  );
}

function buildAircraftCard(fleetItem, movementEntries) {
  const { registration, aircraftType } = parseFleetItem(fleetItem);
  const meta = TYPE_META[aircraftType] || { baseAge: 8, seatConfig: "Unknown" };
  const age = calculateAge(registration, meta.baseAge);

  const history = movementEntries
    .filter((entry) => {
      const aircraft = entry.aircraft || "";
      return aircraft.startsWith(registration) || aircraft === fleetItem;
    })
    .sort((a, b) => toTimestamp(b) - toTimestamp(a));

  const totalJobs = history.length;
  const arrivals = history.filter((entry) => classifyMovement(entry) === "arrival").length;
  const departures = history.filter((entry) => classifyMovement(entry) === "departure").length;

  return {
    registration,
    aircraftType,
    age,
    seatConfiguration: meta.seatConfig,
    totalJobs,
    lastWorked: history[0] ? `${history[0].date || "No date"} ${history[0].time || ""}`.trim() : "Never",
    recentHistory: history.slice(0, 4),
    arrivals,
    departures,
  };
}

function parseFleetItem(item) {
  const [registration, ...rest] = String(item || "").split(" - ");
  return {
    registration: registration || "Unknown",
    aircraftType: rest.join(" - ") || "Unknown",
  };
}

function calculateAge(registration, baseAge) {
  const seed = [...String(registration || "")].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return baseAge + (seed % 6);
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
