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
import { LoadingOverlay } from "./components/Spinner.jsx";

// Default TUI fleet data - Actual TUI Airways fleet from Planespotters.net
const DEFAULT_FLEET = [
  // Boeing 737-800 Family
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
  "G-TUKF - Boeing 737-800",
  "G-TUKO - Boeing 737-800",
  "G-TUKR - Boeing 737-800",
  "G-TUKS - Boeing 737-800",
  "G-TUKT - Boeing 737-800",
  "G-TUKW - Boeing 737-800",
  "G-TUKX - Boeing 737-800",
  
  // Boeing 737 MAX 8 Family
  "G-TUMA - Boeing 737 MAX 8",
  "G-TUMB - Boeing 737 MAX 8",
  "G-TUMC - Boeing 737 MAX 8",
  "G-TUMD - Boeing 737 MAX 8",
  "G-TUMF - Boeing 737 MAX 8",
  "G-TUMG - Boeing 737 MAX 8",
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
  "G-TUPG - Boeing 737 MAX 8",
  "G-TUPH - Boeing 737 MAX 8",
  
  // Boeing 787-8 Dreamliner
  "G-TUIA - Boeing 787-8 Dreamliner",
  "G-TUIB - Boeing 787-8 Dreamliner",
  "G-TUIC - Boeing 787-8 Dreamliner",
  "G-TUID - Boeing 787-8 Dreamliner",
  "G-TUIE - Boeing 787-8 Dreamliner",
  "G-TUIF - Boeing 787-8 Dreamliner",
  "G-TUIH - Boeing 787-8 Dreamliner",
  "G-TUII - Boeing 787-8 Dreamliner",
  "G-TUIP - Boeing 787-8 Dreamliner",
  
  // Boeing 787-9 Dreamliner
  "G-TUIJ - Boeing 787-9 Dreamliner",
  "G-TUIL - Boeing 787-9 Dreamliner",
  "G-TUIM - Boeing 787-9 Dreamliner",
  "G-TUIN - Boeing 787-9 Dreamliner",
  "G-TUIO - Boeing 787-9 Dreamliner"
];

export default function AircraftMovementLogbook() {
  console.log("App component is rendering!");

  // Load saved data with try-catch to avoid errors
  const getSavedData = (key, defaultValue) => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (error) {
      console.error('Error loading saved data:', error);
      return defaultValue;
    }
  };

  // Local state management with initial values from localStorage
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return localStorage.getItem('tui-logbook-currentUser') || null;
    } catch (error) {
      return null;
    }
  });
  
  const [fleet, setFleet] = useState(() => getSavedData('tui-logbook-fleet', DEFAULT_FLEET));
  const [history, setHistory] = useState(() => getSavedData('tui-logbook-history', {}));
  const [users, setUsers] = useState(() => getSavedData('tui-logbook-users', {}));

  // Simple save functions
  const saveCurrentUser = (user) => {
    try {
      if (user) {
        localStorage.setItem('tui-logbook-currentUser', user);
      } else {
        localStorage.removeItem('tui-logbook-currentUser');
      }
    } catch (error) {
      console.error('Error saving current user:', error);
    }
  };

  const saveUsers = (usersData) => {
    try {
      localStorage.setItem('tui-logbook-users', JSON.stringify(usersData));
    } catch (error) {
      console.error('Error saving users:', error);
    }
  };

  const saveHistory = (historyData) => {
    try {
      localStorage.setItem('tui-logbook-history', JSON.stringify(historyData));
    } catch (error) {
      console.error('Error saving history:', error);
    }
  };

  const saveFleet = (fleetData) => {
    try {
      localStorage.setItem('tui-logbook-fleet', JSON.stringify(fleetData));
    } catch (error) {
      console.error('Error saving fleet:', error);
    }
  };

  // Login function using local state
  const handleLogin = async (username, password) => {
    console.log("Login attempt:", username, password);
    setIsLoading(true);
    setLoadingMessage("Authenticating...");
    
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simple admin login
    if (username === "wayne" && password === "admin") {
      setCurrentUser(username);
      saveCurrentUser(username);
      setIsLoading(false);
      return true;
    }
    
    // Check if user exists
    const user = users[username];
    if (user && user.password === password) {
      setCurrentUser(username);
      saveCurrentUser(username);
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };
  
  const handleLogout = () => {
    setCurrentUser(null);
    saveCurrentUser(null);
  };

  const handleRegister = async (username, password) => {
    if (users[username]) return false;
    const newUsers = { ...users, [username]: { password } };
    setUsers(newUsers);
    saveUsers(newUsers);
    return true;
  };

  const handleDeleteUser = (username) => {
    if (username === "wayne") return;
    const newUsers = { ...users };
    delete newUsers[username];
    setUsers(newUsers);
    saveUsers(newUsers);
    
    const newHistory = { ...history };
    delete newHistory[username];
    setHistory(newHistory);
    saveHistory(newHistory);
  };

  const addLogEntryToHistory = (entry) => {
    const newHistory = {
      ...history,
      [currentUser]: [...(history[currentUser] || []), entry]
    };
    setHistory(newHistory);
    saveHistory(newHistory);
  };

  const handleDeleteEntry = (id, owner) => {
    if (owner !== currentUser && currentUser !== "wayne") return;
    
    const newHistory = {
      ...history,
      [owner]: history[owner].filter(item => item.id !== id)
    };
    setHistory(newHistory);
    saveHistory(newHistory);
  };

  const handleUpdateEntry = (id, owner, updates) => {
    if (owner !== currentUser && currentUser !== "wayne") return false;
    
    const newHistory = {
      ...history,
      [owner]: history[owner].map(item => 
        item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString(), updatedBy: currentUser } : item
      )
    };
    setHistory(newHistory);
    saveHistory(newHistory);
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
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

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
      saveFleet(DEFAULT_FLEET);
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
    const newFleet = [...fleet, newAircraft];
    setFleet(newFleet);
    saveFleet(newFleet);
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
    <>
      {isLoading && <LoadingOverlay message={loadingMessage} />}
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
              history={history}
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
              currentUser={currentUser}
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
              history={history}
              fleet={fleet}
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
    </>
  );
}