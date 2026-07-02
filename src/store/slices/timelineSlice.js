export const createTimelineSlice = (set, get) => ({
  timelineEvents: [],

  appendTimelineEvent: (eventInput = {}) => {
    const nowIso = eventInput.timestamp || new Date().toISOString();
    const date = nowIso.slice(0, 10);
    const time = formatTime(nowIso);

    const event = {
      id: eventInput.id || `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: nowIso,
      date,
      time,
      action: eventInput.action || "Action",
      message: eventInput.message || `${time} ${eventInput.action || "Action"}`,
      category: eventInput.category || "shift",
      shiftJobId: eventInput.shiftJobId || "",
      flightId: eventInput.flightId || "",
      flightNumber: eventInput.flightNumber || "",
      registration: eventInput.registration || eventInput.aircraftRegistration || "",
      aircraftType: eventInput.aircraftType || "",
      stand: eventInput.stand || "",
      destination: eventInput.destination || "",
      arrivalDeparture: eventInput.arrivalDeparture || eventInput.movement || "",
      details: eventInput.details || "",
    };

    const next = [event, ...(get().timelineEvents || [])].slice(0, 3000);
    set({ timelineEvents: next });
    return event;
  },

  clearTimelineEvents: () => {
    set({ timelineEvents: [] });
    return true;
  },
});

function formatTime(isoValue) {
  const date = new Date(isoValue || Date.now());
  if (Number.isNaN(date.getTime())) return "--:--";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
}
