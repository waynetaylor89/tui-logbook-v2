import defaultFlights from "../../features/flights/data/mockFlights.json";
import { refreshFlights as refreshFeedFlights, saveCachedFlights } from "../../services/flightFeed/flightFeedService.js";
import { isTuiFlight } from "../../utils/airlines.js";

export const createFlightsSlice = (set, get) => ({
  flights: defaultFlights.map((flight) => ({
    ...normalizeFlight(flight),
    imported: Boolean(flight.imported),
    completed: Boolean(flight.completed),
    claimed: Boolean(flight.claimed),
  })),
  dailyImportHistory: [],
  fr24ImportHistory: [],
  liveFlightsMeta: {
    status: "Idle",
    refreshing: false,
    lastUpdated: "",
    importedFlights: 0,
    tuiFlights: 0,
    fromCache: false,
    error: "",
  },

  addFlightRadarImportHistory: (entry) => {
    const historyEntry = {
      id: entry?.id || `fr24-import-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      importedAt: entry?.importedAt || new Date().toISOString(),
      fileName: entry?.fileName || "",
      sourceFormat: entry?.sourceFormat || "",
      provider: entry?.provider || "Generic",
      detectedFlightRadar: Boolean(entry?.detectedFlightRadar),
      detectionConfidence: Number(entry?.detectionConfidence || 0),
      parsedRows: Number(entry?.parsedRows || 0),
      flightsImported: Number(entry?.flightsImported || 0),
      flightsUpdated: Number(entry?.flightsUpdated || 0),
      duplicates: Number(entry?.duplicates || 0),
      errors: Number(entry?.errors || 0),
      rejectedRows: Number(entry?.rejectedRows || 0),
      overwriteDuplicates: Boolean(entry?.overwriteDuplicates),
      mappedColumns: Array.isArray(entry?.mappedColumns) ? entry.mappedColumns : [],
    };

    set({ fr24ImportHistory: [historyEntry, ...(get().fr24ImportHistory || [])].slice(0, 50) });
    return historyEntry;
  },

  setFlights: (flights) => {
    set({ flights: Array.isArray(flights) ? flights.map((flight) => normalizeFlight(flight)) : [] });
    return true;
  },

  refreshLiveFlights: () => {
    const meta = get().liveFlightsMeta || {};

    set({
      liveFlightsMeta: {
        ...meta,
        refreshing: true,
        status: "Refreshing...",
        error: "",
      },
    });

    try {
      // Use the Flight Feed Service which checks cache -> FR24 -> Mock
      const result = refreshFeedFlights({
        storeFlights: get().flights || [],
        setFlights: (flights) => get().setFlights(flights),
        importDailySchedule: (flights, opts) => get().importDailySchedule(flights, opts),
      });

      const now = new Date().toISOString();

      if (!result.ok || !result.flights.length) {
        set({
          liveFlightsMeta: {
            ...get().liveFlightsMeta,
            refreshing: false,
            status: "Unavailable",
            error: result.error || "No flights available.",
            fromCache: false,
          },
        });

        return {
          ok: false,
          error: result.error || "No flights available.",
          fromCache: false,
        };
      }

      const incoming = result.flights;
      const fromCache = result.source === "CACHE";
      const nextStatus = result.source === "MOCK" ? "Mock" : result.source;

      // Save to flight feed cache
      saveCachedFlights(incoming, result.source);

      set({
        liveFlightsMeta: {
          ...get().liveFlightsMeta,
          refreshing: false,
          status: nextStatus,
          lastUpdated: now,
          importedFlights: incoming.length,
          tuiFlights: incoming.filter((flight) => isTuiFlight(flight)).length,
          fromCache,
          error: "",
        },
      });

      return {
        ok: true,
        status: nextStatus,
        lastUpdated: now,
        importedFlights: incoming.length,
        tuiFlights: incoming.filter((flight) => isTuiFlight(flight)).length,
        fromCache,
        offline: fromCache,
        error: "",
      };
    } catch (error) {
      const message = String(error?.message || "Refresh failed.");
      set({
        liveFlightsMeta: {
          ...get().liveFlightsMeta,
          refreshing: false,
          status: "Error",
          error: message,
          fromCache: false,
        },
      });

      return {
        ok: false,
        error: message,
        fromCache: false,
      };
    }
  },

  addFlight: (flightData) => {
    const flight = normalizeFlight({
      ...flightData,
      id: flightData?.id || `flight-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      imported: Boolean(flightData?.imported),
      claimed: Boolean(flightData?.claimed),
      completed: Boolean(flightData?.completed),
    });

    set({ flights: [flight, ...(get().flights || [])] });
    return flight;
  },

  updateFlight: (flightId, updates) => {
    let updatedFlight = null;
    const flights = (get().flights || []).map((flight) => {
      if (flight.id !== flightId) return flight;
      updatedFlight = normalizeFlight({ ...flight, ...(updates || {}) });
      return updatedFlight;
    });

    set({ flights });

    if (!updatedFlight) return false;

    const shiftJobs = (get().shiftJobs || []).map((job) => {
      if (job.flightId !== flightId || job.jobState === "Completed") return job;
      return {
        ...job,
        flightNumber: updatedFlight.flightNumber,
        movement: updatedFlight.movement || updatedFlight.type || "",
        origin: updatedFlight.origin,
        destination: updatedFlight.destination,
        aircraftRegistration: updatedFlight.aircraftRegistration || updatedFlight.registration || "",
        aircraftType: updatedFlight.aircraftType || updatedFlight.aircraft || "",
        scheduledTime: updatedFlight.scheduledTime,
        estimatedTime: updatedFlight.estimatedTime,
        stand: updatedFlight.stand,
        terminal: updatedFlight.terminal || job.terminal || "",
        gate: updatedFlight.gate,
        status: updatedFlight.status,
        notes: updatedFlight.notes || job.notes || "",
        updatedAt: new Date().toISOString(),
      };
    });

    set({ shiftJobs });
    return true;
  },

  deleteFlight: (flightId) => {
    const flights = (get().flights || []).filter((flight) => flight.id !== flightId);
    const shiftJobs = (get().shiftJobs || []).filter(
      (job) => job.flightId !== flightId || job.jobState === "Completed"
    );

    set({ flights, shiftJobs });
    return true;
  },

  claimFlight: (flightId, options = {}) => {
    const claimant = options.claimedBy || "Ramp Agent";
    const now = new Date().toISOString();
    const flightToClaim = (get().flights || []).find((flight) => flight.id === flightId);

    if (!flightToClaim) {
      return false;
    }

    const flights = (get().flights || []).map((flight) => {
      if (flight.id !== flightId) return flight;
      return {
        ...flight,
        ...normalizeFlight(flight),
        claimed: true,
        claimedBy: claimant,
        claimedAt: now,
      };
    });

    set({ flights });

    if (typeof get().addFlightToShift === "function") {
      get().addFlightToShift({
        ...flightToClaim,
        claimed: true,
        claimedAt: now,
        claimedBy: claimant,
      });
    }

    return true;
  },

  importDailySchedule: (incomingFlights, options = {}) => {
    const flights = get().flights || [];
    const shiftJobs = get().shiftJobs || [];
    const replaceToday = Boolean(options.replaceToday);
    const today = new Date().toISOString().slice(0, 10);

    const completedFlightIds = new Set(
      shiftJobs.filter((job) => job.jobState === "Completed").map((job) => job.flightId)
    );

    const baseFlights = replaceToday
      ? flights.filter((flight) => {
          const isToday = (flight.date || today) === today;
          if (!isToday) return true;
          if (flight.completed) return true;
          if (completedFlightIds.has(flight.id)) return true;
          return false;
        })
      : flights;

    const flightsByKey = new Map(baseFlights.map((flight) => [flightImportKey(flight), flight]));
    const importedFlights = [];
    const updates = [];
    let duplicates = 0;
    let mergedUpdates = 0;

    for (const flight of incomingFlights || []) {
      const normalized = {
        ...normalizeFlight(flight),
        id: flight.id || `daily-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        date: flight.date || today,
        imported: true,
        claimed: Boolean(flight.claimed),
        completed: Boolean(flight.completed),
      };

      const key = flightImportKey(normalized);
      const existing = flightsByKey.get(key);

      if (!existing) {
        flightsByKey.set(key, normalized);
        importedFlights.push(normalized);
        continue;
      }

      duplicates += 1;

      const isCompleted =
        Boolean(existing.completed) ||
        completedFlightIds.has(existing.id) ||
        shiftJobs.some((job) => job.flightId === existing.id && job.jobState === "Completed");

      if (isCompleted) {
        continue;
      }

      const merged = {
        ...existing,
        ...normalized,
        id: existing.id,
        claimed: Boolean(existing.claimed),
        completed: Boolean(existing.completed),
      };

      flightsByKey.set(key, merged);
      updates.push(merged);
      mergedUpdates += 1;
    }

    const nextFlights = Array.from(flightsByKey.values());

    const removedFlightIds = replaceToday
      ? flights
          .filter((flight) => {
            if ((flight.date || today) !== today) return false;
            if (flight.completed) return false;
            if (completedFlightIds.has(flight.id)) return false;
            return !nextFlights.some((next) => next.id === flight.id);
          })
          .map((flight) => flight.id)
      : [];

    const jobByFlightId = new Map((get().shiftJobs || []).map((job) => [job.flightId, job]));
    const nextShiftJobs = [...(get().shiftJobs || [])]
      .filter((job) => !removedFlightIds.includes(job.flightId) || job.jobState === "Completed")
      .map((job) => {
        const updatedFlight = updates.find((f) => f.id === job.flightId);
        if (!updatedFlight || job.jobState === "Completed") return job;
        return {
          ...job,
          status: updatedFlight.status || job.status,
          scheduledTime: updatedFlight.scheduledTime || job.scheduledTime,
          estimatedTime: updatedFlight.estimatedTime || job.estimatedTime,
          stand: updatedFlight.stand || job.stand,
          gate: updatedFlight.gate || job.gate,
          origin: updatedFlight.origin || job.origin,
          destination: updatedFlight.destination || job.destination,
          updatedAt: new Date().toISOString(),
        };
      });

    const todaysFlights = nextFlights.filter((flight) => (flight.date || today) === today);
    for (const flight of todaysFlights) {
      if (jobByFlightId.has(flight.id)) continue;
      nextShiftJobs.unshift({
        id: `shift-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        flightId: flight.id,
        flightNumber: flight.flightNumber,
        aircraftRegistration: flight.aircraftRegistration || flight.registration || "",
        aircraftType: flight.aircraftType || flight.aircraft || "",
        movement: flight.movement || flight.type || "",
        origin: flight.origin || "",
        destination: flight.destination || "",
        scheduledTime: flight.scheduledTime || "",
        estimatedTime: flight.estimatedTime || "",
        status: flight.status || "Scheduled",
        stand: flight.stand || "",
        terminal: flight.terminal || "",
        gate: flight.gate || "",
        delay: "",
        pushback: "",
        marshall: "",
        startedAt: "",
        completedAt: "",
        notes: "",
        bags: false,
        gpu: false,
        refuel: false,
        water: false,
        toilet: false,
        cleaning: false,
        catering: false,
        prm: false,
        claimed: Boolean(flight.claimed),
        claimedAt: flight.claimedAt || "",
        claimedBy: flight.claimedBy || "",
        jobState: "Queued",
        updatedAt: new Date().toISOString(),
      });
    }

    const importSummary = {
      id: `daily-import-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      importTime: options.summary?.importTime || new Date().toISOString(),
      flightsImported: options.summary?.flightsImported ?? importedFlights.length,
      mergedUpdates,
      arrivals:
        options.summary?.arrivals ??
        nextFlights.filter((f) => (f.date || today) === today && (f.type || f.movement) === "Arrival").length,
      departures:
        options.summary?.departures ??
        nextFlights.filter((f) => (f.date || today) === today && (f.type || f.movement) === "Departure").length,
      duplicates: (options.summary?.duplicates || 0) + duplicates,
      errors: options.summary?.errors || 0,
      rejectedRows: options.summary?.rejectedRows || 0,
      replaced: replaceToday,
    };

    set({
      flights: nextFlights,
      shiftJobs: nextShiftJobs,
      dailyImportHistory: [importSummary, ...(get().dailyImportHistory || [])],
    });

    if (typeof get().syncAircraftProfilesFromImportedFlights === "function") {
      get().syncAircraftProfilesFromImportedFlights([...(importedFlights || []), ...(updates || [])]);
    }

    return {
      flightsImported: importedFlights.length,
      summary: importSummary,
      totalFlights: nextFlights.length,
    };
  },

  importFlights: (incomingFlights, options = {}) => {
    const overwrite = Boolean(options.overwrite);
    const existingFlights = get().flights || [];

    const existingMap = new Map(existingFlights.map((flight) => [flightImportKey(flight), flight]));
    const seenIncoming = new Set();

    const duplicates = [];
    const uniqueIncoming = [];

    for (const flight of incomingFlights || []) {
      const key = flightImportKey(flight);

      if (seenIncoming.has(key)) {
        duplicates.push({
          type: "within-import",
          key,
          flight,
        });
        continue;
      }

      seenIncoming.add(key);

      if (existingMap.has(key)) {
        duplicates.push({
          type: "existing",
          key,
          flight,
        });
        if (overwrite) {
          uniqueIncoming.push(normalizeFlight(flight));
        }
        continue;
      }

      uniqueIncoming.push(normalizeFlight(flight));
    }

    if (overwrite) {
      const replacementMap = new Map(existingMap);
      for (const flight of uniqueIncoming) {
        replacementMap.set(flightImportKey(flight), flight);
      }

      set({ flights: Array.from(replacementMap.values()) });
    } else if (uniqueIncoming.length > 0) {
      set({ flights: [...existingFlights, ...uniqueIncoming] });
    }

    if (uniqueIncoming.length > 0 && typeof get().syncAircraftProfilesFromImportedFlights === "function") {
      get().syncAircraftProfilesFromImportedFlights(uniqueIncoming);
    }

    return {
      imported: uniqueIncoming.length,
      duplicates,
      totalAfterImport: (overwrite ? Array.from(new Map([...existingFlights, ...uniqueIncoming].map((f) => [flightImportKey(f), f])).values()) : [...existingFlights, ...uniqueIncoming]).length,
    };
  },
});

export function flightImportKey(flight) {
  const direction = flight.type || flight.movement || "";
  const registration = flight.registration || flight.aircraftRegistration || "";
  return [flight.flightNumber, flight.scheduledTime, direction, registration]
    .map((value) => String(value || "").trim().toLowerCase())
    .join("|");
}

function normalizeFlight(flight) {
  const movement =
    flight?.movement ||
    flight?.type ||
    flight?.arrivalDeparture ||
    (String(flight?.arrival_departure || "").toLowerCase().startsWith("arr") ? "Arrival" : "Departure");
  const date = flight?.date || new Date().toISOString().slice(0, 10);
  const scheduledTime = normalizeTime(flight?.scheduledTime || flight?.time || "");
  const estimatedTime = normalizeTime(flight?.estimatedTime || "");

  return {
    id: flight?.id || `flight-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    flightNumber: String(flight?.flightNumber || "").trim().toUpperCase(),
    movement,
    type: movement,
    origin: String(flight?.origin || "").trim(),
    destination: String(flight?.destination || "").trim(),
    aircraftRegistration: String(flight?.aircraftRegistration || flight?.registration || "").trim().toUpperCase(),
    registration: String(flight?.aircraftRegistration || flight?.registration || "").trim().toUpperCase(),
    aircraftType: String(flight?.aircraftType || flight?.aircraft || "").trim(),
    aircraft: String(flight?.aircraftType || flight?.aircraft || "").trim(),
    scheduledTime,
    estimatedTime,
    actualTime: normalizeTime(flight?.actualTime || ""),
    stand: String(flight?.stand || "").trim().toUpperCase(),
    terminal: String(flight?.terminal || "").trim().toUpperCase(),
    gate: String(flight?.gate || "").trim().toUpperCase(),
    status: String(flight?.status || "Scheduled").trim(),
    notes: String(flight?.notes || "").trim(),
    date,
    imported: Boolean(flight?.imported),
    claimed: Boolean(flight?.claimed),
    claimedBy: flight?.claimedBy || "",
    claimedAt: flight?.claimedAt || "",
    completed: Boolean(flight?.completed),
  };
}

function normalizeTime(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";

  const twelve = raw.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (twelve) {
    let h = Number(twelve[1]);
    const m = Number(twelve[2]);
    const p = twelve[3].toUpperCase();
    if (h === 12) h = 0;
    if (p === "PM") h += 12;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }

  const twentyFour = raw.match(/^(\d{1,2}):(\d{2})$/);
  if (twentyFour) {
    return `${String(Number(twentyFour[1])).padStart(2, "0")}:${String(Number(twentyFour[2])).padStart(2, "0")}`;
  }

  return raw;
}
