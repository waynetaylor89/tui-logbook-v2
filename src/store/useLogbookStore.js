import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createAuthSlice } from "./slices/authSlice.js";
import { createFleetSlice } from "./slices/fleetSlice.js";
import { createMovementsSlice } from "./slices/movementsSlice.js";
import { mergeImportedHistory } from "./importedHistory.js";

const useLogbookStore = create(
  persist(
    (set, get) => ({
      ...createFleetSlice(set, get),
      ...createMovementsSlice(set, get),
      ...createAuthSlice(set, get),
    }),
    {
      name: "logbook-storage",
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        fleet: state.fleet,
        history: state.history,
        users: state.users,
        currentUser: state.currentUser,
      }),
      migrate: (persistedState, version) => {
        if (!persistedState || version >= 2) return persistedState;
        return {
          ...persistedState,
          history: mergeImportedHistory(persistedState.history || {}),
        };
      },
      onRehydrateStorage: () => (state) => {
        if (state) state.setHasHydrated(true);
      },
    }
  )
);

export default useLogbookStore;