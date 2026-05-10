export const createMovementsSlice = (set, get) => ({
  history: {},
  setHistory: (history) => set({ history }),
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
  updateEntry: (id, owner, updates) => {
    const history = get().history;
    const targetUser = owner || get().currentUser;
    const userHistory = history[targetUser] || [];
    const editor = get().currentUser;
    set({
      history: {
        ...history,
        [targetUser]: userHistory.map((entry) =>
          entry.id === id
            ? {
                ...entry,
                ...updates,
                updatedAt: new Date().toISOString(),
                updatedBy: editor,
              }
            : entry
        ),
      },
    });
  },
});
