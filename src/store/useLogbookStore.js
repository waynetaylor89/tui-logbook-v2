import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createAuthSlice } from "./slices/authSlice.js";
import { createFleetSlice } from "./slices/fleetSlice.js";
import { createMovementsSlice } from "./slices/movementsSlice.js";
import { createShiftSlice } from "./slices/shiftSlice.js";
import { createFlightsSlice } from "./slices/flightsSlice.js";
import { createAircraftSlice } from "./slices/aircraftSlice.js";
import { createTimelineSlice } from "./slices/timelineSlice.js";
import { mergeImportedHistory } from "./importedHistory.js";

const useLogbookStore = create(
  persist(
    (set, get) => ({
      ...createFleetSlice(set, get),
      ...createMovementsSlice(set, get),
      ...createShiftSlice(set, get),
      ...createFlightsSlice(set, get),
      ...createAircraftSlice(set, get),
      ...createTimelineSlice(set, get),
      ...createAuthSlice(set, get),
    }),
    {
      name: "logbook-storage",
      version: 9,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        fleet: state.fleet,
        flights: state.flights,
        liveFlightsMeta: state.liveFlightsMeta,
        dailyImportHistory: state.dailyImportHistory,
        fr24ImportHistory: state.fr24ImportHistory,
        history: state.history,
        shiftJobs: state.shiftJobs,
        smartSuggestionMemory: state.smartSuggestionMemory,
        aircraftProfiles: state.aircraftProfiles,
        timelineEvents: state.timelineEvents,
        profile: state.profile,
      }),
      migrate: (persistedState, version) => {
        if (!persistedState) return persistedState;

        if (version < 2) {
          return {
            ...persistedState,
            history: mergeImportedHistory(persistedState.history || {}),
            shiftJobs: persistedState.shiftJobs || [],
          };
        }

        if (version < 3) {
          return {
            ...persistedState,
            shiftJobs: persistedState.shiftJobs || [],
          };
        }

        if (version < 4) {
          const migrated = { ...persistedState };
          if (Array.isArray(persistedState.flights)) {
            migrated.flights = persistedState.flights;
          }
          if (!Array.isArray(persistedState.dailyImportHistory)) {
            migrated.dailyImportHistory = [];
          }
          return migrated;
        }

        if (version < 5) {
          return {
            ...persistedState,
            aircraftProfiles: Array.isArray(persistedState.aircraftProfiles)
              ? persistedState.aircraftProfiles
              : [],
          };
        }

        if (version < 6) {
          return {
            ...persistedState,
            smartSuggestionMemory:
              persistedState.smartSuggestionMemory && typeof persistedState.smartSuggestionMemory === "object"
                ? persistedState.smartSuggestionMemory
                : {},
          };
        }

        if (version < 7) {
          return {
            ...persistedState,
            timelineEvents: Array.isArray(persistedState.timelineEvents)
              ? persistedState.timelineEvents
              : [],
          };
        }

        if (version < 8) {
          return {
            ...persistedState,
            fr24ImportHistory: Array.isArray(persistedState.fr24ImportHistory)
              ? persistedState.fr24ImportHistory
              : [],
          };
        }

        if (version < 9) {
          return {
            ...persistedState,
            liveFlightsMeta:
              persistedState.liveFlightsMeta && typeof persistedState.liveFlightsMeta === "object"
                ? persistedState.liveFlightsMeta
                : {
                    status: "Idle",
                    refreshing: false,
                    lastUpdated: "",
                    importedFlights: 0,
                    tuiFlights: 0,
                    fromCache: false,
                    error: "",
                  },
          };
        }

        return persistedState;
      },
      onRehydrateStorage: () => (state) => {
        if (state) state.setHasHydrated(true);
      },
    }
  )
);

export default useLogbookStore;