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

// Default TUI fleet data - Current TUI Airways fleet
const DEFAULT_FLEET = [
  // Airbus A320 Family
  "G-TUIAB - Airbus A320-232",
  "G-TUIAC - Airbus A320-232",
  "G-TUIAD - Airbus A320-232", 
  "G-TUIAE - Airbus A320-232",
  "G-TUIAF - Airbus A320-232",
  "G-TUIAG - Airbus A320-232",
  "G-TUIAH - Airbus A320-232",
  "G-TUIAI - Airbus A320-232",
  "G-TUIAJ - Airbus A320-232",
  "G-TUIAK - Airbus A320-232",
  "G-TUIAL - Airbus A320-232",
  "G-TUIAM - Airbus A320-232",
  "G-TUIAN - Airbus A320-232",
  "G-TUIAO - Airbus A320-232",
  "G-TUIAP - Airbus A320-232",
  "G-TUIAQ - Airbus A320-232",
  "G-TUIAR - Airbus A320-232",
  "G-TUIAS - Airbus A320-232",
  "G-TUIAT - Airbus A320-232",
  "G-TUIAU - Airbus A320-232",
  "G-TUIAV - Airbus A320-232",
  "G-TUIAW - Airbus A320-232",
  "G-TUIAX - Airbus A320-232",
  "G-TUIAY - Airbus A320-232",
  "G-TUIAZ - Airbus A320-232",
  
  // Airbus A321 Family
  "G-TUIBA - Airbus A321-211",
  "G-TUIBB - Airbus A321-211",
  "G-TUIBC - Airbus A321-211",
  "G-TUIBD - Airbus A321-211",
  "G-TUIBE - Airbus A321-211",
  "G-TUIBF - Airbus A321-211",
  "G-TUIBG - Airbus A321-211",
  "G-TUIBH - Airbus A321-211",
  "G-TUIBI - Airbus A321-211",
  "G-TUIBJ - Airbus A321-211",
  "G-TUIBK - Airbus A321-211",
  "G-TUIBL - Airbus A321-211",
  "G-TUIBM - Airbus A321-211",
  "G-TUIBN - Airbus A321-211",
  "G-TUIBO - Airbus A321-211",
  "G-TUIBP - Airbus A321-211",
  "G-TUIBQ - Airbus A321-211",
  "G-TUIBR - Airbus A321-211",
  "G-TUIBS - Airbus A321-211",
  "G-TUIBT - Airbus A321-211",
  "G-TUIBU - Airbus A321-211",
  "G-TUIBV - Airbus A321-211",
  "G-TUIBW - Airbus A321-211",
  "G-TUIBX - Airbus A321-211",
  "G-TUBY - Airbus A321-211",
  "G-TUIBZ - Airbus A321-211",
  
  // Boeing 737 Family
  "G-TUICA - Boeing 737-800",
  "G-TUICB - Boeing 737-800",
  "G-TUICC - Boeing 737-800",
  "G-TUICD - Boeing 737-800",
  "G-TUICE - Boeing 737-800",
  "G-TUICF - Boeing 737-800",
  "G-TUICG - Boeing 737-800",
  "G-TUICH - Boeing 737-800",
  "G-TUICI - Boeing 737-800",
  "G-TUICJ - Boeing 737-800",
  "G-TUICK - Boeing 737-800",
  "G-TUICL - Boeing 737-800",
  "G-TUICM - Boeing 737-800",
  "G-TUICN - Boeing 737-800",
  "G-TUICO - Boeing 737-800",
  "G-TUICP - Boeing 737-800",
  "G-TUICQ - Boeing 737-800",
  "G-TUICR - Boeing 737-800",
  "G-TUICS - Boeing 737-800",
  "G-TUICT - Boeing 737-800",
  "G-TUICU - Boeing 737-800",
  "G-TUICV - Boeing 737-800",
  "G-TUICW - Boeing 737-800",
  "G-TUICX - Boeing 737-800",
  "G-TUICY - Boeing 737-800",
  "G-TUICZ - Boeing 737-800",
  
  // Boeing 737 MAX
  "G-TUIDA - Boeing 737 MAX 8",
  "G-TUIDB - Boeing 737 MAX 8",
  "G-TUIDC - Boeing 737 MAX 8",
  "G-TUIDD - Boeing 737 MAX 8",
  "G-TUIDE - Boeing 737 MAX 8",
  "G-TUIDF - Boeing 737 MAX 8",
  "G-TUIDG - Boeing 737 MAX 8",
  "G-TUIDH - Boeing 737 MAX 8",
  "G-TUIDI - Boeing 737 MAX 8",
  "G-TUIDJ - Boeing 737 MAX 8",
  "G-TUIDK - Boeing 737 MAX 8",
  "G-TUIDL - Boeing 737 MAX 8",
  "G-TUIDM - Boeing 737 MAX 8",
  "G-TUIDN - Boeing 737 MAX 8",
  "G-TUIDO - Boeing 737 MAX 8",
  "G-TUIDP - Boeing 737 MAX 8",
  "G-TUIDQ - Boeing 737 MAX 8",
  "G-TUIDR - Boeing 737 MAX 8",
  "G-TUIDS - Boeing 737 MAX 8",
  "G-TUIDT - Boeing 737 MAX 8",
  "G-TUIDU - Boeing 737 MAX 8",
  "G-TUIDV - Boeing 737 MAX 8",
  "G-TUIDW - Boeing 737 MAX 8",
  "G-TUIDX - Boeing 737 MAX 8",
  "G-TUIDY - Boeing 737 MAX 8",
  "G-TUIDZ - Boeing 737 MAX 8",
  
  // Boeing 787 Dreamliner
  "G-TUIEA - Boeing 787-9 Dreamliner",
  "G-TUIEB - Boeing 787-9 Dreamliner",
  "G-TUIEC - Boeing 787-9 Dreamliner",
  "G-TUIED - Boeing 787-9 Dreamliner",
  "G-TUIEE - Boeing 787-9 Dreamliner",
  "G-TUIEF - Boeing 787-9 Dreamliner",
  "G-TUIEG - Boeing 787-9 Dreamliner",
  "G-TUIEH - Boeing 787-9 Dreamliner",
  "G-TUIEI - Boeing 787-9 Dreamliner",
  "G-TUIEJ - Boeing 787-9 Dreamliner",
  "G-TUIEK - Boeing 787-9 Dreamliner",
  "G-TUIEL - Boeing 787-9 Dreamliner",
  "G-TUIEM - Boeing 787-9 Dreamliner",
  "G-TUIEN - Boeing 787-9 Dreamliner",
  "G-TUIEO - Boeing 787-9 Dreamliner",
  "G-TUIEP - Boeing 787-9 Dreamliner",
  "G-TUIEQ - Boeing 787-9 Dreamliner",
  "G-TUIER - Boeing 787-9 Dreamliner",
  "G-TUIES - Boeing 787-9 Dreamliner",
  "G-TUIET - Boeing 787-9 Dreamliner",
  "G-TUIEU - Boeing 787-9 Dreamliner",
  "G-TUIEV - Boeing 787-9 Dreamliner",
  "G-TUIEW - Boeing 787-9 Dreamliner",
  "G-TUIEX - Boeing 787-9 Dreamliner",
  "G-TUIEY - Boeing 787-9 Dreamliner",
  "G-TUIEZ - Boeing 787-9 Dreamliner"
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