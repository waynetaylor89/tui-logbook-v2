import { useState, useMemo } from "react";

export const useMovementFilters = (currentUserHistory, allHistory, isAdmin, currentUser) => {
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState("ALL_USERS");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const filteredHistory = useMemo(() => {
    return currentUserHistory.filter((entry) => {
      const searchable = `
        ${entry.aircraft}
        ${entry.fromStand}
        ${entry.toStand}
        ${entry.notes}
        ${entry.date}
        ${entry.time}
      `.toLowerCase();
      return searchable.includes(searchTerm.toLowerCase());
    });
  }, [currentUserHistory, searchTerm]);

  const typeFilteredHistory = useMemo(() => {
    let filtered = isAdmin ? allHistory : filteredHistory;
    
    if (selectedUser !== "ALL_USERS" && isAdmin) {
      filtered = filtered.filter(entry => entry.createdBy === selectedUser);
    }
    
    if (activeTab !== "ALL") {
      filtered = filtered.filter(entry => {
        const aircraftType = entry.aircraft.split(' - ')[1];
        return aircraftType === activeTab;
      });
    }
    
    return filtered;
  }, [activeTab, allHistory, filteredHistory, isAdmin, selectedUser]);

  const totalPages = Math.max(1, Math.ceil(typeFilteredHistory.length / recordsPerPage));
  const paginatedHistory = typeFilteredHistory.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

  const userOptions = useMemo(() => {
    const keys = [...Object.keys(allHistory?.reduce((acc, entry) => {
      if (!acc[entry.createdBy]) acc[entry.createdBy] = true;
      return acc;
    }, {}))];
    return ["ALL_USERS", ...Array.from(new Set(keys)).filter(Boolean)];
  }, [allHistory]);

  // Reset page when filters change
  const resetPage = () => setCurrentPage(1);

  return {
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    selectedUser,
    setSelectedUser,
    currentPage,
    setCurrentPage,
    filteredHistory,
    typeFilteredHistory,
    paginatedHistory,
    totalPages,
    userOptions,
    resetPage,
  };
};
