export const getCurrentUserHistory = (history, currentUser) => {
  if (!currentUser) return [];
  return history[currentUser] || [];
};

export const getAllHistory = (history, isAdmin) => {
  if (!isAdmin) return [];
  return Object.values(history).flat();
};

export const getUserOptions = (users, history) => {
  const keys = [...Object.keys(users), ...Object.keys(history)];
  return ["ALL_USERS", ...Array.from(new Set(keys)).filter(Boolean)];
};

export const filterHistoryBySearch = (entries, searchTerm) => {
  return entries.filter((entry) => {
    const searchable = `${entry.aircraft} ${entry.fromStand} ${entry.toStand} ${entry.movementType} ${entry.notes || ""}`;
    return searchable.toLowerCase().includes(searchTerm.toLowerCase());
  });
};

export const filterHistoryByTabAndUser = ({ isAdmin, allHistory, filteredHistory, selectedUser, activeTab }) => {
  let baseHistory = isAdmin ? allHistory : filteredHistory;
  if (isAdmin && selectedUser !== "ALL_USERS") {
    baseHistory = baseHistory.filter((entry) => entry.createdBy === selectedUser);
  }
  if (activeTab === "ALL") return baseHistory;
  return baseHistory.filter((entry) => entry.aircraft.includes(activeTab));
};

export const computeStats = ({ isAdmin, allHistory, currentUserHistory, users }) => {
  const baseHistory = isAdmin ? allHistory : currentUserHistory;
  const aircraftCounts = {};
  const standCounts = {};

  baseHistory.forEach((entry) => {
    aircraftCounts[entry.aircraft] = (aircraftCounts[entry.aircraft] || 0) + 1;
    standCounts[entry.fromStand] = (standCounts[entry.fromStand] || 0) + 1;
    standCounts[entry.toStand] = (standCounts[entry.toStand] || 0) + 1;
  });

  return {
    totalMovements: baseHistory.length,
    topAircraft: Object.entries(aircraftCounts).sort((a, b) => b[1] - a[1]).slice(0, 3),
    topStands: Object.entries(standCounts).sort((a, b) => b[1] - a[1]).slice(0, 3),
    topUsers: isAdmin
      ? Object.entries(
          baseHistory.reduce((acc, entry) => {
            acc[entry.createdBy] = (acc[entry.createdBy] || 0) + 1;
            return acc;
          }, {})
        )
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
      : [],
    userCount: isAdmin ? Object.keys(users).length : 0,
  };
};

export const computeUserSummary = (history, isAdmin) => {
  if (!isAdmin) return [];
  return Object.entries(history)
    .filter(([username]) => username)
    .map(([username, entries]) => ({
      username,
      movements: (entries || []).length,
    }))
    .sort((a, b) => b.movements - a.movements);
};
