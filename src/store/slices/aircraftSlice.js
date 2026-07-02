export const createAircraftSlice = (set, get) => ({
  aircraftProfiles: [],

  initializeAircraftProfilesFromFleet: (fleetItems = []) => {
    const profiles = get().aircraftProfiles || [];
    const profileMap = new Map(profiles.map((profile) => [normalizeRegistration(profile.registration), profile]));

    for (const item of fleetItems) {
      const parsed = parseFleetItem(item);
      if (!parsed.registration) continue;

      const regKey = normalizeRegistration(parsed.registration);
      if (profileMap.has(regKey)) continue;

      profileMap.set(regKey, createBaseProfile({
        registration: parsed.registration,
        aircraftType: parsed.aircraftType,
      }));
    }

    set({ aircraftProfiles: Array.from(profileMap.values()) });
    return true;
  },

  upsertAircraftProfile: (incomingProfile) => {
    const profiles = get().aircraftProfiles || [];
    const regKey = normalizeRegistration(incomingProfile?.registration);
    if (!regKey) return false;

    const existing = profiles.find((profile) => normalizeRegistration(profile.registration) === regKey);
    const merged = existing
      ? mergeProfile(existing, incomingProfile)
      : createBaseProfile(incomingProfile);

    const nextProfiles = existing
      ? profiles.map((profile) => (normalizeRegistration(profile.registration) === regKey ? merged : profile))
      : [merged, ...profiles];

    set({ aircraftProfiles: nextProfiles });
    return true;
  },

  upsertAircraftFromCompletedJob: (job) => {
    const reg = String(job?.registration || job?.aircraftRegistration || "").trim().toUpperCase();
    if (!reg) return false;

    const nowIso = new Date().toISOString();
    const startedAt = toIso(job?.startedAt || "") || nowIso;
    const completedAt = toIso(job?.completedAt || "") || nowIso;
    const turnaroundMinutes = calculateTurnaroundMinutes(startedAt, completedAt);

    const movement = String(job?.arrivalDeparture || job?.movement || "");
    const isArrival = movement.toLowerCase().startsWith("arr");
    const isDeparture = movement.toLowerCase().startsWith("dep");

    const flightItem = {
      id: `flight-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      flightNumber: job?.flightNumber || "",
      arrivalDeparture: movement || "Departure",
      origin: job?.origin || "",
      destination: job?.destination || "",
      stand: job?.stand || "",
      status: job?.status || "Completed",
      time: formatDisplayDateTime(completedAt),
      startedAt,
      completedAt,
    };

    const timelineEvent = {
      id: `event-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      at: formatDisplayDateTime(completedAt),
      label: `Completed ${job?.flightNumber || "job"} (${movement || "Movement"}) stand ${job?.stand || "--"}`,
    };

    const profiles = get().aircraftProfiles || [];
    const regKey = normalizeRegistration(reg);
    const existing = profiles.find((profile) => normalizeRegistration(profile.registration) === regKey);

    const standCounts = { ...(existing?.standCounts || {}) };
    const destinationCounts = { ...(existing?.destinationCounts || {}) };
    if (job?.stand) {
      const standKey = String(job.stand).trim().toUpperCase();
      standCounts[standKey] = (standCounts[standKey] || 0) + 1;
    }
    if (job?.destination) {
      const destinationKey = String(job.destination).trim();
      destinationCounts[destinationKey] = (destinationCounts[destinationKey] || 0) + 1;
    }

    const totalJobs = (existing?.totalJobs || 0) + 1;
    const totalArrivals = (existing?.totalArrivals || 0) + (isArrival ? 1 : 0);
    const totalDepartures = (existing?.totalDepartures || 0) + (isDeparture ? 1 : 0);

    const totalTurnaroundMinutes = (existing?.totalTurnaroundMinutes || 0) + turnaroundMinutes;
    const turnaroundSamples = (existing?.turnaroundSamples || 0) + (turnaroundMinutes > 0 ? 1 : 0);

    const merged = mergeProfile(existing || createBaseProfile({
      registration: reg,
      aircraftType: job?.aircraftType || "",
      status: "Active",
      firstSeen: formatDisplayDate(startedAt),
    }), {
      registration: reg,
      aircraftType: job?.aircraftType || existing?.aircraftType || "",
      status: "Active",
      firstSeen: existing?.firstSeen || formatDisplayDate(startedAt),
      lastWorked: formatDisplayDateTime(completedAt),
      totalJobs,
      totalArrivals,
      totalDepartures,
      favouriteStand: pickTopKey(standCounts),
      favouriteDestination: pickTopKey(destinationCounts),
      totalTurnaroundMinutes,
      turnaroundSamples,
      averageTurnaroundTime: turnaroundSamples > 0 ? `${Math.round(totalTurnaroundMinutes / turnaroundSamples)} min` : "N/A",
      recentFlights: [flightItem, ...(existing?.recentFlights || [])].slice(0, 12),
      timeline: [timelineEvent, ...(existing?.timeline || [])].slice(0, 20),
      standCounts,
      destinationCounts,
    });

    const nextProfiles = existing
      ? profiles.map((profile) => (normalizeRegistration(profile.registration) === regKey ? merged : profile))
      : [merged, ...profiles];

    set({ aircraftProfiles: nextProfiles });
    return true;
  },

  upsertAircraftFromImportedFlight: (flight) => {
    const reg = String(flight?.registration || flight?.aircraftRegistration || "").trim().toUpperCase();
    if (!reg) return false;

    const movement = String(flight?.movement || flight?.type || "Departure");
    const isArrival = movement.toLowerCase().startsWith("arr");
    const isDeparture = movement.toLowerCase().startsWith("dep");

    const occurredAt = toIso(`${flight?.date || new Date().toISOString().slice(0, 10)}T${flight?.scheduledTime || "00:00"}:00`)
      || toIso(flight?.importedAt || "")
      || new Date().toISOString();

    const flightItem = {
      id: `flight-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      flightNumber: flight?.flightNumber || "",
      arrivalDeparture: movement,
      origin: flight?.origin || "",
      destination: flight?.destination || "",
      stand: flight?.stand || "",
      status: flight?.status || "Scheduled",
      time: formatDisplayDateTime(occurredAt),
      startedAt: "",
      completedAt: "",
    };

    const timelineEvent = {
      id: `event-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      at: formatDisplayDateTime(occurredAt),
      label: `Imported ${flight?.flightNumber || "flight"} (${movement}) stand ${flight?.stand || "--"}`,
    };

    const profiles = get().aircraftProfiles || [];
    const regKey = normalizeRegistration(reg);
    const existing = profiles.find((profile) => normalizeRegistration(profile.registration) === regKey);

    const standCounts = { ...(existing?.standCounts || {}) };
    const destinationCounts = { ...(existing?.destinationCounts || {}) };
    if (flight?.stand) {
      const standKey = String(flight.stand).trim().toUpperCase();
      standCounts[standKey] = (standCounts[standKey] || 0) + 1;
    }
    if (flight?.destination) {
      const destinationKey = String(flight.destination).trim();
      destinationCounts[destinationKey] = (destinationCounts[destinationKey] || 0) + 1;
    }

    const totalJobs = (existing?.totalJobs || 0) + 1;
    const totalArrivals = (existing?.totalArrivals || 0) + (isArrival ? 1 : 0);
    const totalDepartures = (existing?.totalDepartures || 0) + (isDeparture ? 1 : 0);

    const merged = mergeProfile(existing || createBaseProfile({
      registration: reg,
      aircraftType: flight?.aircraftType || flight?.aircraft || "",
      status: "Active",
      firstSeen: formatDisplayDate(occurredAt),
    }), {
      registration: reg,
      aircraftType: flight?.aircraftType || flight?.aircraft || existing?.aircraftType || "",
      status: "Active",
      firstSeen: existing?.firstSeen || formatDisplayDate(occurredAt),
      lastWorked: formatDisplayDateTime(occurredAt),
      totalJobs,
      totalArrivals,
      totalDepartures,
      favouriteStand: pickTopKey(standCounts),
      favouriteDestination: pickTopKey(destinationCounts),
      recentFlights: [flightItem, ...(existing?.recentFlights || [])].slice(0, 12),
      timeline: [timelineEvent, ...(existing?.timeline || [])].slice(0, 20),
      standCounts,
      destinationCounts,
    });

    const nextProfiles = existing
      ? profiles.map((profile) => (normalizeRegistration(profile.registration) === regKey ? merged : profile))
      : [merged, ...profiles];

    set({ aircraftProfiles: nextProfiles });
    return true;
  },

  syncAircraftProfilesFromImportedFlights: (flights = []) => {
    const withRegistration = (flights || []).filter((flight) =>
      Boolean(String(flight?.registration || flight?.aircraftRegistration || "").trim())
    );

    withRegistration.forEach((flight) => {
      get().upsertAircraftFromImportedFlight(flight);
    });

    return true;
  },

  syncAircraftProfilesFromCompletedJobs: (jobs = []) => {
    const completed = (jobs || []).filter((job) => {
      const state = String(job?.status || job?.jobState || "").toLowerCase();
      return state === "completed";
    });

    completed.forEach((job) => {
      get().upsertAircraftFromCompletedJob(job);
    });

    return true;
  },
});

function parseFleetItem(item) {
  const [registration, ...rest] = String(item || "").split(" - ");
  return {
    registration: String(registration || "").trim().toUpperCase(),
    aircraftType: String(rest.join(" - ") || "").trim(),
  };
}

function createBaseProfile(source = {}) {
  const registration = String(source.registration || "").trim().toUpperCase();
  const aircraftType = String(source.aircraftType || "").trim();
  const { manufacturer, series } = inferTypeFields(aircraftType);

  return {
    registration,
    aircraftType,
    manufacturer: source.manufacturer || manufacturer,
    series: source.series || series,
    fleetNumber: source.fleetNumber || inferFleetNumber(registration),
    engineType: source.engineType || inferEngineType(aircraftType),
    age: source.age || "",
    status: source.status || "Active",
    firstSeen: source.firstSeen || "",
    lastWorked: source.lastWorked || "",
    totalJobs: Number(source.totalJobs || 0),
    totalArrivals: Number(source.totalArrivals || 0),
    totalDepartures: Number(source.totalDepartures || 0),
    favouriteStand: source.favouriteStand || "",
    favouriteDestination: source.favouriteDestination || "",
    averageTurnaroundTime: source.averageTurnaroundTime || "N/A",
    totalTurnaroundMinutes: Number(source.totalTurnaroundMinutes || 0),
    turnaroundSamples: Number(source.turnaroundSamples || 0),
    recentFlights: Array.isArray(source.recentFlights) ? source.recentFlights : [],
    timeline: Array.isArray(source.timeline) ? source.timeline : [],
    standCounts: source.standCounts || {},
    destinationCounts: source.destinationCounts || {},
  };
}

function mergeProfile(existing, incoming) {
  return {
    ...existing,
    ...incoming,
    registration: incoming.registration || existing.registration,
    aircraftType: incoming.aircraftType || existing.aircraftType,
    manufacturer: incoming.manufacturer || existing.manufacturer,
    series: incoming.series || existing.series,
    fleetNumber: incoming.fleetNumber || existing.fleetNumber,
    engineType: incoming.engineType || existing.engineType,
    status: incoming.status || existing.status,
    firstSeen: incoming.firstSeen || existing.firstSeen,
    lastWorked: incoming.lastWorked || existing.lastWorked,
    averageTurnaroundTime: incoming.averageTurnaroundTime || existing.averageTurnaroundTime || "N/A",
    standCounts: incoming.standCounts || existing.standCounts || {},
    destinationCounts: incoming.destinationCounts || existing.destinationCounts || {},
    recentFlights: Array.isArray(incoming.recentFlights) ? incoming.recentFlights : existing.recentFlights || [],
    timeline: Array.isArray(incoming.timeline) ? incoming.timeline : existing.timeline || [],
  };
}

function inferTypeFields(typeText) {
  const type = String(typeText || "").toLowerCase();
  if (type.includes("boeing")) {
    return { manufacturer: "Boeing", series: typeText || "Boeing" };
  }
  if (type.includes("airbus")) {
    return { manufacturer: "Airbus", series: typeText || "Airbus" };
  }
  return { manufacturer: "Unknown", series: typeText || "Unknown" };
}

function inferEngineType(typeText) {
  const type = String(typeText || "").toLowerCase();
  if (type.includes("787")) return "Twin Turbofan";
  if (type.includes("737")) return "Twin Turbofan";
  if (type.includes("a320")) return "Twin Turbofan";
  return "Unknown";
}

function inferFleetNumber(registration) {
  const chars = String(registration || "").replace(/[^a-zA-Z0-9]/g, "");
  return chars ? chars.slice(-3).toUpperCase() : "";
}

function normalizeRegistration(value) {
  return String(value || "").trim().toUpperCase();
}

function pickTopKey(map) {
  const entries = Object.entries(map || {});
  if (entries.length === 0) return "";
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}

function calculateTurnaroundMinutes(startedAt, completedAt) {
  const start = new Date(startedAt).getTime();
  const end = new Date(completedAt).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 0;
  return Math.round((end - start) / 60000);
}

function toIso(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString();
}

function formatDisplayDateTime(iso) {
  if (!iso) return "N/A";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "N/A";
  return `${date.toLocaleDateString("en-GB")} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

function formatDisplayDate(iso) {
  if (!iso) return "N/A";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-GB");
}
