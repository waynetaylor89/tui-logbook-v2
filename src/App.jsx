import { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./components/Login.jsx";
import AppShell from "./layouts/AppShell.jsx";
import HomePage from "./pages/HomePage.jsx";
import MovementsPage from "./pages/MovementsPage.jsx";
import RecordsPage from "./pages/RecordsPage.jsx";
import UsersPage from "./pages/UsersPage.jsx";
import { exportLogbookCSV } from "./utils/exportCSV.js";
import useLogbookStore from "./store/useLogbookStore.js";
import { AIRPORT, AIRPORT_STANDS, MOVEMENT_TYPES, TUI_AIRCRAFT_TYPES } from "./config/logbookConfig.js";
import {
  computeStats,
  computeUserSummary,
  filterHistoryBySearch,
  filterHistoryByTabAndUser,
  getAllHistory,
  getCurrentUserHistory,
  getUserOptions,
} from "./store/selectors.js";

export default function AircraftMovementLogbook() {
  const {
    fleet,
    history,
    users,
    currentUser,
    hasHydrated,
    addAircraftToFleet: addAircraftToFleetInStore,
    resetFleet: resetFleetInStore,
    addLogEntry: addLogEntryInStore,
    deleteEntry: deleteEntryInStore,
    updateEntry: updateEntryInStore,
    login,
    logout,
    register,
    recoverPassword,
    listUsernames,
    deleteUser: deleteUserInStore,
    resetUserPassword,
  } = useLogbookStore();

  const isAdmin = currentUser === "wayne";

  const [activeTab, setActiveTab] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState("ALL_USERS");

  const [movementDate, setMovementDate] = useState(new Date().toISOString().slice(0, 10));
  const [aircraft, setAircraft] = useState("");
  const [movementType, setMovementType] = useState("Tow");
  const [fromStand, setFromStand] = useState("");
  const [toStand, setToStand] = useState("");
  const [notes, setNotes] = useState("");
  const [showAircraftSuggestions, setShowAircraftSuggestions] = useState(false);

  const [newReg, setNewReg] = useState("");
  const [newType, setNewType] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const recordsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm, selectedUser]);

  useEffect(() => {
    if (!successMessage) return;
    const timeout = setTimeout(() => setSuccessMessage(""), 5000);
    return () => clearTimeout(timeout);
  }, [successMessage]);

  const filteredAircraftOptions = useMemo(() => {
    if (!aircraft.trim()) return fleet.slice(0, 12);
    return fleet.filter((plane) => plane.toLowerCase().includes(aircraft.toLowerCase())).slice(0, 12);
  }, [aircraft, fleet]);

  const currentUserHistory = useMemo(() => {
    return getCurrentUserHistory(history, currentUser);
  }, [currentUser, history]);

  const userOptions = useMemo(() => {
    return getUserOptions(users, history);
  }, [history, users]);

  const filteredHistory = useMemo(() => {
    return filterHistoryBySearch(currentUserHistory, searchTerm);
  }, [currentUserHistory, searchTerm]);

  const allHistory = useMemo(() => {
    return getAllHistory(history, isAdmin);
  }, [history, isAdmin]);

  const typeFilteredHistory = useMemo(() => {
    return filterHistoryByTabAndUser({
      isAdmin,
      allHistory,
      filteredHistory,
      selectedUser,
      activeTab,
    });
  }, [activeTab, allHistory, filteredHistory, isAdmin, selectedUser]);

  const totalPages = Math.max(1, Math.ceil(typeFilteredHistory.length / recordsPerPage));
  const paginatedHistory = typeFilteredHistory.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

  const stats = useMemo(() => {
    return computeStats({ isAdmin, allHistory, currentUserHistory, users });
  }, [allHistory, currentUserHistory, isAdmin, users]);

  const userSummary = useMemo(() => {
    return computeUserSummary(history, isAdmin);
  }, [history, isAdmin]);

  const handleResetFleet = () => {
    if (window.confirm("Reset fleet to default TUI Airways list? This will remove any custom additions.")) {
      resetFleetInStore();
      setSuccessMessage("Fleet reset to default.");
    }
  };

  const handleAddAircraftToFleet = () => {
    if (!newReg.trim() || !newType) {
      alert("Please enter both registration and type.");
      return;
    }
    const newAircraft = `${newReg.toUpperCase()} - ${newType}`;
    if (fleet.includes(newAircraft)) {
      alert("Aircraft already exists in fleet.");
      return;
    }
    addAircraftToFleetInStore(newReg.trim(), newType);
    setNewReg("");
    setNewType("");
    setSuccessMessage("Aircraft added to fleet.");
  };

  const handleAddLogEntry = () => {
    if (!aircraft || !fromStand || !toStand) {
      alert("Please complete all required fields.");
      return;
    }
    if (fromStand === toStand) {
      alert("From Stand and To Stand cannot match.");
      return;
    }

    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdBy: currentUser,
      aircraft,
      airport: AIRPORT,
      movementType,
      fromStand,
      toStand,
      notes,
      date: movementDate,
      time: new Date().toLocaleTimeString(),
    };

    addLogEntryInStore(entry);
    setAircraft("");
    setFromStand("");
    setToStand("");
    setNotes("");
    setMovementType("Tow");
    setShowAircraftSuggestions(false);
    setSuccessMessage("Movement added successfully.");
  };

  const handleDeleteEntry = (id, owner) => {
    if (!id) return;
    const canModify = isAdmin || owner === currentUser;
    if (!canModify) {
      alert("You can only delete your own records.");
      return;
    }
    if (window.confirm("Delete this movement?")) {
      deleteEntryInStore(id, owner);
    }
  };

  const handleEditEntry = (id, owner, updates) => {
    if (!id) return;
    const canModify = isAdmin || owner === currentUser;
    if (!canModify) {
      alert("You can only edit your own records.");
      return false;
    }
    if (!updates.aircraft || !updates.fromStand || !updates.toStand) {
      alert("Aircraft, From Stand, and To Stand are required.");
      return false;
    }
    if (updates.fromStand === updates.toStand) {
      alert("From Stand and To Stand cannot match.");
      return false;
    }
    updateEntryInStore(id, owner, updates);
    return true;
  };

  const handleDeleteUser = (username) => {
    if (!username || username === "wayne") return;
    if (!window.confirm(`Delete user ${username} and all associated records?`)) return;
    deleteUserInStore(username);
    if (selectedUser === username) {
      setSelectedUser("ALL_USERS");
    }
  };

  const exportLogbook = () => {
    const exportData = isAdmin ? allHistory : filteredHistory;
    exportLogbookCSV(exportData);
  };

  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-sky-200 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg px-6 py-4 text-slate-700 font-medium">
          Loading saved logbook data...
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <Login
        onLogin={login}
        onRegister={register}
        onRecoverPassword={recoverPassword}
        onListUsernames={listUsernames}
      />
    );
  }

  return (
    <Routes>
      <Route
        element={<AppShell fleetCount={fleet.length} currentUser={currentUser} isAdmin={isAdmin} onLogout={logout} />}
      >
        <Route
          path="/"
          element={
            <HomePage
              isAdmin={isAdmin}
              userSummary={userSummary}
              stats={stats}
              newReg={newReg}
              setNewReg={setNewReg}
              newType={newType}
              setNewType={setNewType}
              tuiAircraftTypes={TUI_AIRCRAFT_TYPES}
              handleAddAircraftToFleet={handleAddAircraftToFleet}
              handleResetFleet={handleResetFleet}
            />
          }
        />
        <Route
          path="/movements"
          element={
            <MovementsPage
              isAdmin={isAdmin}
              currentUser={currentUser}
              allHistoryLength={allHistory.length}
              currentUserHistoryLength={currentUserHistory.length}
              movementDate={movementDate}
              setMovementDate={setMovementDate}
              aircraft={aircraft}
              setAircraft={setAircraft}
              movementType={movementType}
              setMovementType={setMovementType}
              fromStand={fromStand}
              setFromStand={setFromStand}
              toStand={toStand}
              setToStand={setToStand}
              notes={notes}
              setNotes={setNotes}
              movementTypes={MOVEMENT_TYPES}
              airportStands={AIRPORT_STANDS}
              filteredAircraftOptions={filteredAircraftOptions}
              showAircraftSuggestions={showAircraftSuggestions}
              setShowAircraftSuggestions={setShowAircraftSuggestions}
              handleAddLogEntry={handleAddLogEntry}
              successMessage={successMessage}
              clearSuccessMessage={() => setSuccessMessage("")}
            />
          }
        />
        <Route
          path="/records"
          element={
            <RecordsPage
              isAdmin={isAdmin}
              allHistoryLength={allHistory.length}
              currentUserHistoryLength={currentUserHistory.length}
              paginatedHistory={paginatedHistory}
              handleDeleteEntry={handleDeleteEntry}
              handleEditEntry={handleEditEntry}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              tuiAircraftTypes={TUI_AIRCRAFT_TYPES}
              totalPages={totalPages}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              typeFilteredHistory={typeFilteredHistory}
              exportLogbook={exportLogbook}
              selectedUser={selectedUser}
              setSelectedUser={setSelectedUser}
              userOptions={userOptions}
              stats={stats}
            />
          }
        />
        <Route
          path="/users"
          element={
            isAdmin ? (
              <UsersPage
                users={users}
                history={history}
                userSummary={userSummary}
                handleDeleteUser={handleDeleteUser}
                resetUserPassword={resetUserPassword}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Route>
    </Routes>
  );
}