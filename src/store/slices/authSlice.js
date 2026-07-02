const DEFAULT_NOTIFICATION_PREFERENCES = {
  enabled: true,
  periodDays: 7,
  reminders: {
    shiftStart: true,
    break: true,
    endShift: true,
    incompleteJob: true,
    unfinishedNotes: true,
    exportReminder: true,
    dailySummary: true,
    weeklySummary: true,
    shiftStartTime: "06:00",
    breakAfterMinutes: 180,
    endShiftTime: "18:00",
    incompleteJobMinutes: 45,
    exportReminderTime: "19:00",
    dailySummaryTime: "20:30",
    weeklySummaryDay: 1,
    weeklySummaryTime: "20:30",
  },
};

function mergeNotificationPreferences(base, incoming) {
  const source = incoming && typeof incoming === "object" ? incoming : {};
  return {
    ...base,
    ...source,
    reminders: {
      ...base.reminders,
      ...(source.reminders && typeof source.reminders === "object" ? source.reminders : {}),
    },
  };
}

// Single-user profile for Wayne
export const createAuthSlice = (set, get) => ({
  currentUser: "Wayne",
  hasHydrated: false,

  setHasHydrated: (value) => set({ hasHydrated: value }),

  // Profile management for single user
  profile: {
    notificationPreferences: DEFAULT_NOTIFICATION_PREFERENCES,
    notificationMeta: {
      lastExportAt: "",
    },
    selectedAirline: "TUI Airways",
    showOtherAirlines: false,
    liveFlightBoardFilter: "TUI",
    darkMode: true,
  },

  updateNotificationPreferences: (preferences) => {
    const profile = get().profile;
    const nextPreferences = mergeNotificationPreferences(
      DEFAULT_NOTIFICATION_PREFERENCES,
      profile.notificationPreferences
    );

    set({
      profile: {
        ...profile,
        notificationPreferences: mergeNotificationPreferences(nextPreferences, preferences),
      },
    });
    return true;
  },

  getNotificationPreferences: () => {
    return mergeNotificationPreferences(
      DEFAULT_NOTIFICATION_PREFERENCES,
      get().profile.notificationPreferences
    );
  },

  markExportAction: () => {
    const profile = get().profile;
    set({
      profile: {
        ...profile,
        notificationMeta: {
          ...(profile.notificationMeta || {}),
          lastExportAt: new Date().toISOString(),
        },
      },
    });
    return true;
  },

  getNotificationMeta: () => {
    return get().profile.notificationMeta || { lastExportAt: "" };
  },

  setSelectedAirline: (airline) => {
    const profile = get().profile;
    set({
      profile: {
        ...profile,
        selectedAirline: String(airline || "TUI Airways"),
      },
    });
    return true;
  },

  getSelectedAirline: () => {
    return get().profile?.selectedAirline || "TUI Airways";
  },

  setShowOtherAirlines: (value) => {
    const profile = get().profile;
    set({
      profile: {
        ...profile,
        showOtherAirlines: Boolean(value),
      },
    });
    return true;
  },

  getShowOtherAirlines: () => {
    return Boolean(get().profile?.showOtherAirlines);
  },

  setLiveFlightBoardFilter: (value) => {
    const profile = get().profile;
    const allowed = ["All", "TUI", "Arrivals", "Departures", "Active", "Delayed", "Completed"];
    const next = allowed.includes(String(value)) ? String(value) : "TUI";
    set({
      profile: {
        ...profile,
        liveFlightBoardFilter: next,
      },
    });
    return true;
  },

  getLiveFlightBoardFilter: () => {
    const value = String(get().profile?.liveFlightBoardFilter || "TUI");
    return value || "TUI";
  },

  toggleDarkMode: () => {
    const profile = get().profile;
    set({
      profile: {
        ...profile,
        darkMode: !profile.darkMode,
      },
    });
    return true;
  },

  getDarkMode: () => {
    return get().profile.darkMode || false;
  },
});
