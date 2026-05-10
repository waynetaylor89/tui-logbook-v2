import { create } from "zustand";
import { persist } from "zustand/middleware";

const initialFleet = [
  "G-FDZD - Boeing 737-800",
  "G-FDZR - Boeing 737-800",
  "G-FDZS - Boeing 737-800",
  "G-FDZX - Boeing 737-800",
  "G-FDZY - Boeing 737-800",
  "G-FDZZ - Boeing 737-800",
  "G-TAWA - Boeing 737-800",
  "G-TAWB - Boeing 737-800",
  "G-TAWC - Boeing 737-800",
  "G-TAWD - Boeing 737-800",
  "G-TAWG - Boeing 737-800",
  "G-TAWI - Boeing 737-800",
  "G-TAWK - Boeing 737-800",
  "G-TAWM - Boeing 737-800",
  "G-TAWO - Boeing 737-800",
  "G-TAWP - Boeing 737-800",
  "G-TAWS - Boeing 737-800",
  "G-TAWU - Boeing 737-800",
  "G-TAWV - Boeing 737-800",
  "G-TAWW - Boeing 737-800",
  "G-TAWX - Boeing 737-800",
  "G-TAWY - Boeing 737-800",
  "G-TAWZ - Boeing 737-800",
  "G-TUIA - Boeing 787-8 Dreamliner",
  "G-TUIB - Boeing 787-8 Dreamliner",
  "G-TUIC - Boeing 787-8 Dreamliner",
  "G-TUIE - Boeing 787-8 Dreamliner",
  "G-TUIF - Boeing 787-8 Dreamliner",
  "G-TUIH - Boeing 787-8 Dreamliner",
  "G-TUII - Boeing 787-8 Dreamliner",
  "G-TUIJ - Boeing 787-9 Dreamliner",
  "G-TUIL - Boeing 787-9 Dreamliner",
  "G-TUIM - Boeing 787-9 Dreamliner",
  "G-TUIN - Boeing 787-9 Dreamliner",
  "G-TUIO - Boeing 787-9 Dreamliner",
  "G-TUIP - Boeing 787-8 Dreamliner",
  "G-TUKF - Boeing 737-800",
  "G-TUKR - Boeing 737-800",
  "G-TUKS - Boeing 737-800",
  "G-TUKT - Boeing 737-800",
  "G-TUKW - Boeing 737-800",
  "G-TUMA - Boeing 737 MAX 8",
  "G-TUMB - Boeing 737 MAX 8",
  "G-TUMC - Boeing 737 MAX 8",
  "G-TUMD - Boeing 737 MAX 8",
  "G-TUMF - Boeing 737 MAX 8",
  "G-TUMH - Boeing 737 MAX 8",
  "G-TUMK - Boeing 737 MAX 8",
  "G-TUML - Boeing 737 MAX 8",
  "G-TUMM - Boeing 737 MAX 8",
  "G-TUMN - Boeing 737 MAX 8",
  "G-TUMO - Boeing 737 MAX 8",
  "G-TUMP - Boeing 737 MAX 8",
  "G-TUMS - Boeing 737 MAX 8",
  "G-TUMT - Boeing 737 MAX 8",
  "G-TUMU - Boeing 737 MAX 8",
  "G-TUMW - Boeing 737 MAX 8",
  "G-TUMX - Boeing 737 MAX 8",
  "G-TUMY - Boeing 737 MAX 8",
  "G-TUMZ - Boeing 737 MAX 8",
  "G-TUOA - Boeing 737 MAX 8",
  "G-TUOB - Boeing 737 MAX 8",
  "G-TUOD - Boeing 737 MAX 8",
  "G-TUPA - Boeing 737 MAX 8",
  "G-TUPB - Boeing 737 MAX 8",
  "G-TUPC - Boeing 737 MAX 8",
  "G-TUPD - Boeing 737 MAX 8",
  "G-TUPE - Boeing 737 MAX 8",
  "G-TUPF - Boeing 737 MAX 8",
  "G-TUPH - Boeing 737 MAX 8",
].sort();

const useLogbookStore = create(
  persist(
    (set, get) => ({
      // States
      fleet: initialFleet,
      history: {},
      users: {},
      currentUser: null,

      // Actions
      setFleet: (fleet) => set({ fleet }),
      setHistory: (history) => set({ history }),
      setUsers: (users) => set({ users }),
      setCurrentUser: (user) => set({ currentUser: user }),

      // Specific actions
      addAircraftToFleet: (newReg, newType) => {
        const newAircraft = `${newReg.toUpperCase()} - ${newType}`;
        const fleet = get().fleet;
        if (!fleet.includes(newAircraft)) {
          set({ fleet: [...fleet, newAircraft].sort() });
        }
      },

      resetFleet: () => {
        set({ fleet: initialFleet });
      },

      addLogEntry: (entry) => {
        const history = get().history;
        const currentUser = get().currentUser;
        const userHistory = history[currentUser] || [];
        set({
          history: { ...history, [currentUser]: [entry, ...userHistory] },
        });
      },

      deleteEntry: (id, owner) => {
        const history = get().history;
        const targetUser = owner || get().currentUser;
        const userHistory = history[targetUser] || [];
        set({
          history: {
            ...history,
            [targetUser]: userHistory.filter((entry) => entry.id !== id),
          },
        });
      },

      login: (username, password) => {
        if (username === "wayne" && password === "admin") {
          set({ currentUser: username });
          return true;
        }
        const users = get().users;
        if (users[username] && users[username].password === password) {
          set({ currentUser: username });
          return true;
        }
        return false;
      },

      logout: () => {
        set({ currentUser: null });
      },

      register: (username, password) => {
        const users = get().users;
        if (users[username]) return false;
        set({ users: { ...users, [username]: { password } } });
        return true;
      },

      recoverPassword: (username) => {
        const users = get().users;
        return users[username] ? users[username].password : null;
      },

      listUsernames: () => {
        const users = get().users;
        return Object.keys(users).filter(Boolean);
      },

      deleteUser: (username) => {
        if (!username || username === "wayne") return;
        const users = get().users;
        const history = get().history;
        const updatedUsers = { ...users };
        delete updatedUsers[username];
        const updatedHistory = { ...history };
        delete updatedHistory[username];
        set({ users: updatedUsers, history: updatedHistory });
      },

      resetUserPassword: (username, newPassword) => {
        if (!username || !newPassword) return false;
        const users = get().users;
        if (!users[username]) return false;
        set({
          users: {
            ...users,
            [username]: { password: newPassword },
          },
        });
        return true;
      },
    }),
    {
      name: "logbook-storage",
      partialize: (state) => ({
        fleet: state.fleet,
        history: state.history,
        users: state.users,
        currentUser: state.currentUser,
      }),
    }
  )
);

export default useLogbookStore;