import { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./components/Login.jsx";
import AppShell from "./layouts/AppShell.jsx";
import HomePage from "./pages/HomePage.jsx";
import MovementsPage from "./pages/MovementsPage.jsx";
import RecordsPage from "./pages/RecordsPage.jsx";
import UsersPage from "./pages/UsersPage.jsx";
import { exportLogbookCSV } from "./utils/exportCSV.js";
import { AIRPORT, AIRPORT_STANDS, MOVEMENT_TYPES, TUI_AIRCRAFT_TYPES } from "./config/logbookConfig.js";

// Default TUI fleet data
const DEFAULT_FLEET = [
  "G-TUIAB - Airbus A320",
  "G-TUIAC - Airbus A320", 
  "G-TUIAD - Airbus A320",
  "G-TUIAE - Airbus A320",
  "G-TUIAF - Airbus A320",
  "G-TUIAG - Airbus A321",
  "G-TUIAH - Airbus A321",
  "G-TUIAI - Airbus A321",
  "G-TUIAJ - Airbus A321",
  "G-TUIAK - Boeing 737",
  "G-TUIAL - Boeing 737",
  "G-TUIAM - Boeing 737",
];

export default function AircraftMovementLogbook() {
  console.log("App component is rendering!");

  // Local state management instead of Zustand
  const [currentUser, setCurrentUser] = useState(null);
  const [fleet, setFleet] = useState(DEFAULT_FLEET);
  const [history, setHistory] = useState({});
  const [users, setUsers] = useState({});
  
  // Login function using local state
  const handleLogin = async (username, password) => {
    console.log("Login attempt:", username, password);
    
    // Simple admin login
    if (username === "wayne" && password === "admin") {
      setCurrentUser(username);
      return true;
    }
    
    // Check if user exists
    const user = users[username];
    if (user && user.password === password) {
      setCurrentUser(username);
      return true;
    }
    
    return false;
  };
  
  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleRegister = async (username, password) => {
    if (users[username]) return false;
    setUsers(prev => ({ ...prev, [username]: { password } }));
    return true;
  };

  const handleDeleteUser = (username) => {
    if (username === "wayne") return;
    setUsers(prev => {
      const newUsers = { ...prev };
      delete newUsers[username];
      return newUsers;
    });
    setHistory(prev => {
      const newHistory = { ...prev };
      delete newHistory[username];
      return newHistory;
    });
  };

  const addLogEntryToHistory = (entry) => {
    setHistory(prev => ({
      ...prev,
      [currentUser]: [...(prev[currentUser] || []), entry]
    }));
  };

  const handleDeleteEntry = (id, owner) => {
    if (owner !== currentUser && currentUser !== "wayne") return;
    
    setHistory(prev => ({
      ...prev,
      [owner]: prev[owner].filter(item => item.id !== id)
    }));
  };

  const handleUpdateEntry = (id, owner, updates) => {
    if (owner !== currentUser && currentUser !== "wayne") return false;
    
    setHistory(prev => ({
      ...prev,
      [owner]: prev[owner].map(item => 
        item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString(), updatedBy: currentUser } : item
      )
    }));
    return true;
  };

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

  const currentUserHistory = useMemo(() => history[currentUser] || [], [history, currentUser]);

  const userOptions = useMemo(() => {
    const keys = [...Object.keys(users), ...Object.keys(history)];
    return ["ALL_USERS", ...Array.from(new Set(keys)).filter(Boolean)];
  }, [history, users]);

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

  const allHistory = useMemo(() => {
    if (!isAdmin) return [];
    return Object.values(history).flat();
  }, [history, isAdmin]);

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

  const stats = useMemo(() => {
    const data = isAdmin ? allHistory : currentUserHistory;
    const aircraftCounts = {};
    const standCounts = {};
    const userMovements = {};

    data.forEach((entry) => {
      aircraftCounts[entry.aircraft] = (aircraftCounts[entry.aircraft] || 0) + 1;
      standCounts[entry.fromStand] = (standCounts[entry.fromStand] || 0) + 1;
      standCounts[entry.toStand] = (standCounts[entry.toStand] || 0) + 1;
      userMovements[entry.createdBy] = (userMovements[entry.createdBy] || 0) + 1;
    });

    return {
      totalMovements: data.length,
      topAircraft: Object.entries(aircraftCounts).sort((a, b) => b[1] - a[1]).slice(0, 3),
      topStands: Object.entries(standCounts).sort((a, b) => b[1] - a[1]).slice(0, 3),
      topUsers: Object.entries(userMovements).sort((a, b) => b[1] - a[1]).slice(0, 3),
    };
  }, [allHistory, currentUserHistory]);

  const userSummary = useMemo(() => {
    if (!isAdmin) return [];
    
    return Object.entries(history).map(([username, userHistory]) => ({
      username,
      movements: userHistory.length,
    }));
  }, [history, isAdmin]);

  const handleResetFleet = () => {
    if (window.confirm("Reset fleet to default TUI Airways list? This will remove any custom additions.")) {
      setFleet(DEFAULT_FLEET);
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
    setFleet(prev => [...prev, newAircraft]);
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

    addLogEntryToHistory(entry);
    setAircraft("");
    setFromStand("");
    setToStand("");
    setNotes("");
    setMovementType("Tow");
    setShowAircraftSuggestions(false);
    setSuccessMessage("Movement added successfully.");
  };

  const exportLogbook = () => {
    const exportData = isAdmin ? allHistory : filteredHistory;
    exportLogbookCSV(exportData);
  };

  if (!currentUser) {
    console.log("Showing login screen - currentUser:", currentUser);
    return (
      <Login
        onLogin={handleLogin}
        onRegister={handleRegister}
        onRecoverPassword={() => {}}
        onListUsernames={() => Object.keys(users)}
      />
    );
  }

  console.log("Rendering main app - currentUser:", currentUser);

  return (
    <Routes>
      <Route
        element={<AppShell fleetCount={fleet.length} currentUser={currentUser} isAdmin={isAdmin} onLogout={handleLogout} />}
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
              handleEditEntry={handleUpdateEntry}
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
                resetUserPassword={() => {}}
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