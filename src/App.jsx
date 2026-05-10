import { useEffect, useMemo, useState } from "react";
import Header from "./components/Header.jsx";
import Login from "./components/Login.jsx";
import FleetManager from "./components/FleetManager.jsx";
import MovementForm from "./components/MovementForm.jsx";
import RecordsPanel from "./components/RecordsPanel.jsx";
import StatsCards from "./components/StatsCards.jsx";
import AdminUsersPanel from "./components/AdminUsersPanel.jsx";
import { exportLogbookCSV } from "./utils/exportCSV.js";
import useLogbookStore from "./store/useLogbookStore.js";

export default function AircraftMovementLogbook() {
  const airport = "MAN";

  const airportStands = {
    MAN: ["1", "2", "5", "12", "20", "21", "22", "23", "24", "25", "R1", "R2", "R3"],
  };

  const movementTypes = ["Tow", "Power Move", "Engineering", "Remote Stand", "Night Stop"];
  const tuiAircraftTypes = [
    "Boeing 737-800",
    "Boeing 737 MAX 8",
    "Boeing 787-8 Dreamliner",
    "Boeing 787-9 Dreamliner",
  ];

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
    login,
    logout,
    register,
    recoverPassword,
    listUsernames,
    deleteUser: deleteUserInStore,
    resetUserPassword,
  } = useLogbookStore();

  const isAdmin = currentUser === "wayne";

  const [activePage, setActivePage] = useState("home");
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
  }, [activeTab, activePage, searchTerm, selectedUser]);

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
    if (!currentUser) return [];
    return history[currentUser] || [];
  }, [currentUser, history]);

  const userOptions = useMemo(() => {
    const keys = [...Object.keys(users), ...Object.keys(history)];
    return ["ALL_USERS", ...Array.from(new Set(keys)).filter(Boolean)];
  }, [history, users]);

  const filteredHistory = useMemo(() => {
    return currentUserHistory.filter((entry) => {
      const searchable = `${entry.aircraft} ${entry.fromStand} ${entry.toStand} ${entry.movementType} ${entry.notes || ""}`;
      return searchable.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [currentUserHistory, searchTerm]);

  const allHistory = useMemo(() => {
    if (!isAdmin) return [];
    return Object.values(history).flat();
  }, [history, isAdmin]);

  const typeFilteredHistory = useMemo(() => {
    let baseHistory = isAdmin ? allHistory : filteredHistory;
    if (isAdmin && selectedUser !== "ALL_USERS") {
      baseHistory = baseHistory.filter((entry) => entry.createdBy === selectedUser);
    }
    if (activeTab === "ALL") return baseHistory;
    return baseHistory.filter((entry) => entry.aircraft.includes(activeTab));
  }, [activeTab, allHistory, filteredHistory, isAdmin, selectedUser]);

  const totalPages = Math.max(1, Math.ceil(typeFilteredHistory.length / recordsPerPage));
  const paginatedHistory = typeFilteredHistory.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

  const stats = useMemo(() => {
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
  }, [allHistory, currentUserHistory, isAdmin, users]);

  const userSummary = useMemo(() => {
    if (!isAdmin) return [];
    return Object.entries(history)
      .filter(([username]) => username)
      .map(([username, entries]) => ({
        username,
        movements: (entries || []).length,
      }))
      .sort((a, b) => b.movements - a.movements);
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
      airport,
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
    if (window.confirm("Delete this movement?")) {
      deleteEntryInStore(id, owner);
    }
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
    <div className="min-h-screen bg-sky-200">
      <div className="min-h-screen bg-sky-100 p-3 lg:p-6">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="bg-white rounded-2xl shadow-lg p-4 flex flex-wrap gap-2">
            <button
              onClick={() => setActivePage("home")}
              className={`px-4 py-2 rounded-xl font-semibold ${
                activePage === "home" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setActivePage("movements")}
              className={`px-4 py-2 rounded-xl font-semibold ${
                activePage === "movements" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              Aircraft Movements
            </button>
            <button
              onClick={() => setActivePage("records")}
              className={`px-4 py-2 rounded-xl font-semibold ${
                activePage === "records" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              Movement Records
            </button>
            {isAdmin && (
              <button
                onClick={() => setActivePage("users")}
                className={`px-4 py-2 rounded-xl font-semibold ${
                  activePage === "users" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"
                }`}
              >
                Manage Users
              </button>
            )}
          </div>

          <Header fleetCount={fleet.length} currentUser={currentUser} isAdmin={isAdmin} onLogout={logout} />

          {activePage === "home" ? (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-slate-800">Statistics Overview</h2>
                  <div className="text-sm text-slate-500">Live movement tracking</div>
                </div>
                <StatsCards stats={stats} />
                {isAdmin && userSummary.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-slate-800">User Movement Summary</h3>
                        <div className="text-sm text-slate-500">Ranked by total movements logged.</div>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-left text-sm text-slate-700">
                        <thead>
                          <tr>
                            <th className="px-4 py-3 font-medium text-slate-500">User</th>
                            <th className="px-4 py-3 font-medium text-slate-500">Movements</th>
                          </tr>
                        </thead>
                        <tbody>
                          {userSummary.map((row) => (
                            <tr key={row.username} className="border-t">
                              <td className="px-4 py-3">{row.username}</td>
                              <td className="px-4 py-3 font-semibold text-slate-800">{row.movements}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
              <div className="grid lg:grid-cols-3 gap-4">
                <FleetManager
                  newReg={newReg}
                  setNewReg={setNewReg}
                  newType={newType}
                  setNewType={setNewType}
                  tuiAircraftTypes={tuiAircraftTypes}
                  addAircraftToFleet={handleAddAircraftToFleet}
                  resetFleet={handleResetFleet}
                />
                <div className="hidden lg:block"></div>
              </div>
            </>
          ) : activePage === "users" ? (
            <AdminUsersPanel
              users={users}
              history={history}
              userSummary={userSummary}
              onDeleteUser={handleDeleteUser}
              onResetPassword={resetUserPassword}
            />
          ) : activePage === "movements" ? (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl shadow-lg p-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">Aircraft Movements</h2>
                    <div className="text-sm text-slate-500">Log new movements here.</div>
                  </div>
                  <div className="text-sm text-slate-500">
                    {isAdmin ? allHistory.length : currentUserHistory.length} records total
                  </div>
                </div>
              </div>
              <MovementForm
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
                movementTypes={movementTypes}
                airportStands={airportStands}
                filteredAircraftOptions={filteredAircraftOptions}
                showAircraftSuggestions={showAircraftSuggestions}
                setShowAircraftSuggestions={setShowAircraftSuggestions}
                addLogEntry={handleAddLogEntry}
                successMessage={successMessage}
                clearSuccessMessage={() => setSuccessMessage("")}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl shadow-lg p-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">Movement Records</h2>
                    <div className="text-sm text-slate-500">View all saved records in one place.</div>
                  </div>
                  <div className="text-sm text-slate-500">
                    {isAdmin ? allHistory.length : currentUserHistory.length} records total
                  </div>
                </div>
              </div>
              <RecordsPanel
                paginatedHistory={paginatedHistory}
                deleteEntry={handleDeleteEntry}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                tuiAircraftTypes={tuiAircraftTypes}
                totalPages={totalPages}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                typeFilteredHistory={typeFilteredHistory}
                exportLogbook={exportLogbook}
                isAdmin={isAdmin}
                selectedUser={selectedUser}
                setSelectedUser={setSelectedUser}
                userOptions={userOptions}
                stats={stats}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}