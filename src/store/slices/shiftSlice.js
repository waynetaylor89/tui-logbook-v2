import { buildSmartSuggestion, learnSuggestionFeedback, suggestionFields } from "../../features/intelligence/smartSuggestions.js";

export const createShiftSlice = (set, get) => ({
  shiftJobs: [],
  smartSuggestionMemory: {},

  addFlightToShift: (flight) => {
    const shiftJobs = (get().shiftJobs || []).map(normalizeShiftJob);
    const alreadyExists = shiftJobs.some((job) => job.flightId === flight.id);

    if (alreadyExists) {
      return false;
    }

    const completedJobs = shiftJobs.filter((job) => String(job.status || job.jobState).toLowerCase() === "completed");
    const suggestionMeta = buildSmartSuggestion({
      flight,
      completedJobs,
      memory: get().smartSuggestionMemory || {},
    });

    const newJob = normalizeShiftJob({
      id: `shift-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      flightId: flight.id,
      flightNumber: flight.flightNumber,
      arrivalDeparture: flight.movement || flight.type || "Departure",
      origin: flight.origin || "",
      destination: flight.destination || "",
      registration: flight.aircraftRegistration || flight.registration || "",
      aircraftType: flight.aircraftType || flight.aircraft || "",
      scheduledTime: flight.scheduledTime || "",
      estimatedTime: flight.estimatedTime || "",
      stand: flight.stand || "",
      status: "Queued",
      started: false,
      completed: false,
      startedAt: "",
      completedAt: "",
      notes: [],
      checklist: defaultChecklist(),
      claimed: Boolean(flight.claimed),
      claimedAt: flight.claimedAt || new Date().toISOString(),
      claimedBy: flight.claimedBy || "",
      suggestionMeta,
      suggestionAccepted: Boolean(suggestionMeta.autoApplied),
      updatedAt: new Date().toISOString(),
    });

    const autoFilledJob = applySmartPrefill(newJob);

    set({ shiftJobs: [autoFilledJob, ...shiftJobs] });

    if (typeof get().appendTimelineEvent === "function") {
      get().appendTimelineEvent(createTimelineEventPayload(autoFilledJob, {
        action: "Flight Claimed",
        message: `Flight ${autoFilledJob.flightNumber || "--"} claimed for shift`,
      }));
    }

    return true;
  },

  removeShiftJob: (jobId) => {
    const shiftJobs = (get().shiftJobs || []).map(normalizeShiftJob);
    set({ shiftJobs: shiftJobs.filter((job) => job.id !== jobId) });
    return true;
  },

  updateShiftJob: (jobId, updates, options = {}) => {
    const shiftJobs = (get().shiftJobs || []).map(normalizeShiftJob);
    const existingMemory = get().smartSuggestionMemory || {};
    let learnedJob = null;
    let previousJob = null;
    let updatedJob = null;

    set({
      shiftJobs: shiftJobs.map((job) =>
        job.id === jobId
          ? (() => {
              previousJob = job;
              const nextJob = normalizeShiftJob({ ...job, ...(updates || {}), updatedAt: new Date().toISOString() });
              const changedSuggestionField = suggestionFields.some((field) => Object.prototype.hasOwnProperty.call(updates || {}, field));
              if (changedSuggestionField && job.suggestionMeta?.basedOnCount > 0) {
                learnedJob = {
                  ...nextJob,
                  suggestionAccepted: false,
                  suggestionMeta: {
                    ...(nextJob.suggestionMeta || {}),
                    wasEdited: true,
                  },
                };
                updatedJob = normalizeShiftJob(learnedJob);
                return updatedJob;
              }
              updatedJob = nextJob;
              return nextJob;
            })()
          : job
      ),
      smartSuggestionMemory: learnedJob
        ? learnSuggestionFeedback(existingMemory, { job: learnedJob, accepted: false })
        : existingMemory,
    });

    if (options.emitTimeline !== false && updatedJob && typeof get().appendTimelineEvent === "function") {
      const changedFields = getChangedFields(previousJob, updatedJob, Object.keys(updates || {}));
      if (changedFields.length > 0) {
        get().appendTimelineEvent(createTimelineEventPayload(updatedJob, {
          action: "Job Updated",
          message: `${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })} ${changedFields.join(", ")} updated`,
          details: changedFields.join(", "),
        }));
      }
    }

    return true;
  },

  startShiftJob: (jobId) => {
    const now = new Date().toISOString();
    const success = get().updateShiftJob(jobId, {
      status: "In Progress",
      jobState: "In Progress",
      started: true,
      startedAt: now,
      completed: false,
    }, { emitTimeline: false });

    const job = (get().shiftJobs || []).find((item) => item.id === jobId);
    if (success && job && typeof get().appendTimelineEvent === "function") {
      get().appendTimelineEvent(createTimelineEventPayload(job, {
        action: "Job Started",
        message: `${formatTimelineTime(now)} Job Started`,
      }));
    }

    return success;
  },

  completeShiftJob: (jobId) => {
    const now = new Date().toISOString();
    const updates = {
      status: "Completed",
      jobState: "Completed",
      started: true,
      completed: true,
      completedAt: now,
    };

    const success = get().updateShiftJob(jobId, updates, { emitTimeline: false });

    const completedJob = (get().shiftJobs || []).find((job) => job.id === jobId);
    if (success && completedJob && typeof get().upsertAircraftFromCompletedJob === "function") {
      get().upsertAircraftFromCompletedJob(completedJob);
    }

    if (success && completedJob && completedJob.suggestionMeta?.basedOnCount > 0) {
      set({
        smartSuggestionMemory: learnSuggestionFeedback(get().smartSuggestionMemory || {}, {
          job: completedJob,
          accepted: Boolean(completedJob.suggestionAccepted),
        }),
      });
    }

    if (success && completedJob && typeof get().appendTimelineEvent === "function") {
      get().appendTimelineEvent(createTimelineEventPayload(completedJob, {
        action: "Job Complete",
        message: `${formatTimelineTime(now)} Job Complete`,
      }));
    }

    return success;
  },

  acceptShiftSuggestions: (jobId) => {
    const shiftJobs = (get().shiftJobs || []).map(normalizeShiftJob);
    const target = shiftJobs.find((job) => job.id === jobId);
    if (!target || !target.suggestionMeta?.suggestedValues) return false;

    const nextValues = {
      ...target.suggestionMeta.suggestedValues,
      suggestionAccepted: true,
      suggestionMeta: {
        ...target.suggestionMeta,
        acceptedAt: new Date().toISOString(),
      },
    };

    const success = get().updateShiftJob(jobId, nextValues, { emitTimeline: false });
    const job = (get().shiftJobs || []).find((item) => item.id === jobId);

    if (success && job && typeof get().appendTimelineEvent === "function") {
      get().appendTimelineEvent(createTimelineEventPayload(job, {
        action: "Suggestions Accepted",
        message: `${formatTimelineTime(new Date().toISOString())} Based on previous jobs`,
      }));
    }

    return success;
  },

  pauseShiftJob: (jobId) => {
    const success = get().updateShiftJob(jobId, {
      status: "Paused",
      jobState: "Paused",
      started: true,
      completed: false,
    }, { emitTimeline: false });

    const job = (get().shiftJobs || []).find((item) => item.id === jobId);
    if (success && job && typeof get().appendTimelineEvent === "function") {
      get().appendTimelineEvent(createTimelineEventPayload(job, {
        action: "Job Paused",
        message: `${formatTimelineTime(new Date().toISOString())} Job Paused`,
      }));
    }

    return success;
  },

  reopenShiftJob: (jobId) => {
    const success = get().updateShiftJob(jobId, {
      status: "Queued",
      jobState: "Queued",
      completed: false,
      completedAt: "",
    }, { emitTimeline: false });

    const job = (get().shiftJobs || []).find((item) => item.id === jobId);
    if (success && job && typeof get().appendTimelineEvent === "function") {
      get().appendTimelineEvent(createTimelineEventPayload(job, {
        action: "Job Reopened",
        message: `${formatTimelineTime(new Date().toISOString())} Job Reopened`,
      }));
    }

    return success;
  },

  toggleShiftChecklistItem: (jobId, checklistKey) => {
    const shiftJobs = (get().shiftJobs || []).map(normalizeShiftJob);
    let nextJob = null;
    set({
      shiftJobs: shiftJobs.map((job) => {
        if (job.id !== jobId) return job;
        nextJob = normalizeShiftJob({
          ...job,
          checklist: {
            ...job.checklist,
            [checklistKey]: !Boolean(job.checklist?.[checklistKey]),
          },
          updatedAt: new Date().toISOString(),
        });
        return nextJob;
      }),
    });

    if (nextJob && typeof get().appendTimelineEvent === "function") {
      const checked = Boolean(nextJob.checklist?.[checklistKey]);
      const actionLabel = checklistActionLabel(checklistKey, checked);
      get().appendTimelineEvent(createTimelineEventPayload(nextJob, {
        action: actionLabel,
        message: `${formatTimelineTime(new Date().toISOString())} ${actionLabel}`,
      }));
    }

    return true;
  },

  addShiftJobNote: (jobId, noteText) => {
    const text = String(noteText || "").trim();
    if (!text) return false;

    const now = new Date().toISOString();
    const createdAtLabel = new Date(now).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const note = {
      id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      text,
      createdAt: now,
      createdAtLabel,
    };

    const shiftJobs = (get().shiftJobs || []).map(normalizeShiftJob);
    let updatedJob = null;
    set({
      shiftJobs: shiftJobs.map((job) => {
        if (job.id !== jobId) return job;
        updatedJob = normalizeShiftJob({
          ...job,
          notes: [...(job.notes || []), note],
          updatedAt: now,
        });
        return updatedJob;
      }),
    });

    if (updatedJob && typeof get().appendTimelineEvent === "function") {
      get().appendTimelineEvent(createTimelineEventPayload(updatedJob, {
        action: "Note Added",
        message: `${formatTimelineTime(now)} Note Added`,
        details: text,
      }));
    }

    return true;
  },

  removeShiftJobNote: (jobId, noteId) => {
    const shiftJobs = (get().shiftJobs || []).map(normalizeShiftJob);
    let updatedJob = null;
    set({
      shiftJobs: shiftJobs.map((job) => {
        if (job.id !== jobId) return job;
        updatedJob = normalizeShiftJob({
          ...job,
          notes: (job.notes || []).filter((note) => note.id !== noteId),
          updatedAt: new Date().toISOString(),
        });
        return updatedJob;
      }),
    });

    if (updatedJob && typeof get().appendTimelineEvent === "function") {
      get().appendTimelineEvent(createTimelineEventPayload(updatedJob, {
        action: "Note Removed",
        message: `${formatTimelineTime(new Date().toISOString())} Note Removed`,
      }));
    }

    return true;
  },
});

function defaultChecklist() {
  return {
    marshall: false,
    chocksOn: false,
    conesPlaced: false,
    gpuConnected: false,
    beltLoader: false,
    bagsUnloaded: false,
    bagsLoaded: false,
    refuel: false,
    waterService: false,
    toiletService: false,
    catering: false,
    cleaning: false,
    prm: false,
    pushback: false,
    walkaroundComplete: false,
    headsetConnected: false,
    doorsClosed: false,
  };
}

function normalizeShiftJob(job) {
  const notesArray = Array.isArray(job?.notes)
    ? job.notes.map((note) => ({
        id: note.id || `note-${Math.random().toString(36).slice(2, 8)}`,
        text: String(note.text || ""),
        createdAt: note.createdAt || new Date().toISOString(),
        createdAtLabel:
          note.createdAtLabel ||
          new Date(note.createdAt || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }))
    : String(job?.notes || "").trim()
      ? [
          {
            id: `note-${Math.random().toString(36).slice(2, 8)}`,
            text: String(job.notes),
            createdAt: job.updatedAt || new Date().toISOString(),
            createdAtLabel: new Date(job.updatedAt || Date.now()).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]
      : [];

  const mappedChecklist = {
    ...defaultChecklist(),
    ...(job?.checklist || {}),
    marshall: Boolean(job?.checklist?.marshall ?? job?.marshall),
    gpuConnected: Boolean(job?.checklist?.gpuConnected ?? job?.gpu),
    refuel: Boolean(job?.checklist?.refuel ?? job?.refuel),
    waterService: Boolean(job?.checklist?.waterService ?? job?.water),
    toiletService: Boolean(job?.checklist?.toiletService ?? job?.toilet),
    cleaning: Boolean(job?.checklist?.cleaning ?? job?.cleaning),
    catering: Boolean(job?.checklist?.catering ?? job?.catering),
    prm: Boolean(job?.checklist?.prm ?? job?.prm),
    pushback: Boolean(job?.checklist?.pushback ?? Boolean(job?.pushback)),
  };

  const startedAt = job?.startedAt || "";
  const completedAt = job?.completedAt || "";
  const started = Boolean(job?.started ?? startedAt);
  const completed = Boolean((job?.completed ?? completedAt) || job?.jobState === "Completed");

  return {
    id: job?.id || `shift-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    flightId: job?.flightId || "",
    flightNumber: job?.flightNumber || "",
    arrivalDeparture: job?.arrivalDeparture || job?.movement || "Departure",
    movement: job?.arrivalDeparture || job?.movement || "Departure",
    origin: job?.origin || "",
    destination: job?.destination || "",
    registration: job?.registration || job?.aircraftRegistration || "",
    aircraftRegistration: job?.registration || job?.aircraftRegistration || "",
    aircraftType: job?.aircraftType || "",
    scheduledTime: job?.scheduledTime || "",
    estimatedTime: job?.estimatedTime || "",
    stand: job?.stand || "",
    turnaroundTime: job?.turnaroundTime || "",
    gate: job?.gate || "",
    status: job?.status || job?.jobState || "Queued",
    jobState: job?.jobState || job?.status || "Queued",
    started,
    completed,
    startedAt,
    completedAt,
    notes: notesArray,
    checklist: mappedChecklist,
    suggestionMeta: normalizeSuggestionMeta(job?.suggestionMeta),
    suggestionAccepted: Boolean(job?.suggestionAccepted),
    claimed: Boolean(job?.claimed),
    claimedAt: job?.claimedAt || "",
    claimedBy: job?.claimedBy || "",
    updatedAt: job?.updatedAt || new Date().toISOString(),
  };
}

function applySmartPrefill(job) {
  const suggestion = normalizeSuggestionMeta(job?.suggestionMeta);
  if (!suggestion.autoApplied) return job;

  const next = { ...job, suggestionAccepted: true };

  for (const field of suggestionFields) {
    const confidence = Number(suggestion.confidenceByField?.[field] || 0);
    const suggestedValue = suggestion.suggestedValues?.[field];
    if (!suggestedValue || confidence < 0.75) continue;
    next[field] = suggestedValue;
  }

  return normalizeShiftJob(next);
}

function normalizeSuggestionMeta(meta) {
  const base = meta || {};
  return {
    message: base.message || "",
    basedOnCount: Number(base.basedOnCount || 0),
    confidence: Number(base.confidence || 0),
    confidenceByField: base.confidenceByField || {},
    suggestedValues: base.suggestedValues || {},
    autoApplied: Boolean(base.autoApplied),
    signature: base.signature || "",
    wasEdited: Boolean(base.wasEdited),
    acceptedAt: base.acceptedAt || "",
  };
}

function createTimelineEventPayload(job, extra = {}) {
  return {
    category: "shift",
    shiftJobId: job?.id || "",
    flightId: job?.flightId || "",
    flightNumber: job?.flightNumber || "",
    registration: job?.registration || job?.aircraftRegistration || "",
    aircraftType: job?.aircraftType || "",
    stand: job?.stand || "",
    destination: job?.destination || "",
    arrivalDeparture: job?.arrivalDeparture || job?.movement || "",
    ...extra,
  };
}

function checklistActionLabel(key, checked) {
  const map = {
    marshall: "Marshall Complete",
    chocksOn: "Chocks On",
    conesPlaced: "Cones Placed",
    gpuConnected: "GPU Connected",
    beltLoader: "Belt Loader",
    bagsUnloaded: "Bags Unloaded",
    bagsLoaded: "Bags Complete",
    refuel: "Refuel",
    waterService: "Water Service",
    toiletService: "Toilet Service",
    catering: "Catering",
    cleaning: "Cleaning",
    prm: "PRM",
    pushback: "Pushback",
    walkaroundComplete: "Walkaround",
    headsetConnected: "Headset Connected",
    doorsClosed: "Doors Closed",
  };

  const label = map[key] || "Checklist Updated";
  return checked ? label : `${label} Undo`;
}

function formatTimelineTime(iso) {
  const date = new Date(iso || Date.now());
  if (Number.isNaN(date.getTime())) return "--:--";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
}

function getChangedFields(previousJob, updatedJob, keys) {
  const tracked = keys.length > 0 ? keys : ["stand", "registration", "aircraftType", "destination", "arrivalDeparture", "turnaroundTime"];
  return tracked.filter((key) => String(previousJob?.[key] || "") !== String(updatedJob?.[key] || ""));
}
