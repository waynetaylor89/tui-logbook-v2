import React, { useEffect, useMemo, useState } from "react";

import Header from "./components/Header.jsx";
import Login from "./components/Login.jsx";
import FleetManager from "./components/FleetManager.jsx";
import MovementForm from "./components/MovementForm.jsx";
import RecordsPanel from "./components/RecordsPanel.jsx";
import StatsCards from "./components/StatsCards.jsx";
import AdminUsersPanel from "./components/AdminUsersPanel.jsx";

import { exportLogbookCSV } from "./utils/exportCSV.js";

export default function AircraftMovementLogbook() {
  const airport = "MAN";

  const airportStands = {
    MAN: [
      "1",
      "2",
      "5",
      "12",
      "20",
      "21",
      "22",
      "23",
      "24",
      "25",
      "R1",
      "R2",
      "R3",
    ],
  };

  const movementTypes = [
    "Tow",
    "Power Move",
    "Engineering",
    "Remote Stand",
    "Night Stop",
  ];

  const tuiAircraftTypes = [
    "Boeing 737-800",
    "Boeing 737 MAX 8",
    "Boeing 787-8 Dreamliner",
    "Boeing 787-9 Dreamliner",
  ];

  const initialFleet = [
    "G-TUIA - Boeing 787-8 Dreamliner",
    "G-TUIB - Boeing 787-8 Dreamliner",
    "G-TUIC - Boeing 787-8 Dreamliner",
    "G-TUID - Boeing 787-8 Dreamliner",
    "G-TUIE - Boeing 787-8 Dreamliner",
    "G-TUIF - Boeing 787-8 Dreamliner",
    "G-TUIJ - Boeing 787-9 Dreamliner",
    "G-TUIK - Boeing 787-9 Dreamliner",
    "G-TUIL - Boeing 787-9 Dreamliner",
    "G-TUIM - Boeing 787-9 Dreamliner",
    "G-TUIN - Boeing 787-9 Dreamliner",
    "G-TUIO - Boeing 787-9 Dreamliner",
    "G-TUIP - Boeing 787-9 Dreamliner",
    "G-TUIQ - Boeing 787-9 Dreamliner",
    "G-TUIR - Boeing 787-9 Dreamliner",
    "G-TUIS - Boeing 787-9 Dreamliner",
    "G-TUIT - Boeing 787-9 Dreamliner",
    "G-TUKA - Boeing 737 MAX 8",
    "G-TUKB - Boeing 737 MAX 8",
    "G-TUKC - Boeing 737 MAX 8",
    "G-TUKD - Boeing 737 MAX 8",
    "G-TUKE - Boeing 737 MAX 8",
    "G-TUKF - Boeing 737 MAX 8",
    "G-TUKG - Boeing 737 MAX 8",
    "G-TUKH - Boeing 737 MAX 8",
    "G-TUKI - Boeing 737 MAX 8",
    "G-TUKJ - Boeing 737 MAX 8",
    "G-TUKK - Boeing 737 MAX 8",
    "G-TUKL - Boeing 737 MAX 8",
    "G-TUKM - Boeing 737 MAX 8",
    "G-TUKN - Boeing 737 MAX 8",
    "G-TUKO - Boeing 737 MAX 8",
    "G-TUKP - Boeing 737 MAX 8",
    "G-TUKQ - Boeing 737 MAX 8",
    "G-TUKR - Boeing 737 MAX 8",
    "G-TUKS - Boeing 737 MAX 8",
    "G-TUKT - Boeing 737 MAX 8",
    "G-TUKU - Boeing 737 MAX 8",
    "G-TUKV - Boeing 737 MAX 8",
    "G-TUKW - Boeing 737 MAX 8",
    "G-TUKX - Boeing 737 MAX 8",
    "G-TUKY - Boeing 737 MAX 8",
    "G-TUKZ - Boeing 737 MAX 8",
    "G-TUAA - Boeing 737-800",
    "G-TUAB - Boeing 737-800",
    "G-TUAC - Boeing 737-800",
    "G-TUAD - Boeing 737-800",
    "G-TUAE - Boeing 737-800",
    "G-TUAF - Boeing 737-800",
    "G-TUAG - Boeing 737-800",
    "G-TUAH - Boeing 737-800",
    "G-TUAI - Boeing 737-800",
    "G-TUAJ - Boeing 737-800",
    "G-TUAK - Boeing 737-800",
    "G-TUAL - Boeing 737-800",
    "G-TUAM - Boeing 737-800",
    "G-TUAN - Boeing 737-800",
    "G-TUAO - Boeing 737-800",
    "G-TUAP - Boeing 737-800",
    "G-TUAQ - Boeing 737-800",
    "G-TUAR - Boeing 737-800",
    "G-TUAS - Boeing 737-800",
    "G-TUAT - Boeing 737-800",
    "G-TUAU - Boeing 737-800",
    "G-TUAV - Boeing 737-800",
    "G-TUAW - Boeing 737-800",
    "G-TUAX - Boeing 737-800",
    "G-TUAY - Boeing 737-800",
    "G-TUAZ - Boeing 737-800",
    "G-TUBA - Boeing 737-800",
    "G-TUBB - Boeing 737-800",
    "G-TUBC - Boeing 737-800",
    "G-TUBD - Boeing 737-800",
    "G-TUBE - Boeing 737-800",
    "G-TUBF - Boeing 737-800",
    "G-TUBG - Boeing 737-800",
    "G-TUBH - Boeing 737-800",
    "G-TUBI - Boeing 737-800",
    "G-TUBJ - Boeing 737-800",
    "G-TUBK - Boeing 737-800",
    "G-TUBL - Boeing 737-800",
    "G-TUBM - Boeing 737-800",
    "G-TUBN - Boeing 737-800",
    "G-TUBO - Boeing 737-800",
    "G-TUBP - Boeing 737-800",
    "G-TUBQ - Boeing 737-800",
    "G-TUBR - Boeing 737-800",
    "G-TUBS - Boeing 737-800",
    "G-TUBT - Boeing 737-800",
    "G-TUBU - Boeing 737-800",
    "G-TUBV - Boeing 737-800",
    "G-TUBW - Boeing 737-800",
  ].sort();

  const [fleet, setFleet] = useState(() => {
    const savedFleet = localStorage.getItem("aircraft-logbook-fleet");
    if (savedFleet) {
      try {
        const parsedFleet = JSON.parse(savedFleet);
        const mergedFleet = Array.from(
          new Set([...(parsedFleet || []), ...initialFleet])
        ).sort();
        return mergedFleet;
      } catch {
        return initialFleet;
      }
    }
    return initialFleet;
  });

  const [history, setHistory] = useState(() => {
    const savedHistory = localStorage.getItem("aircraft-logbook-history");
    return savedHistory ? JSON.parse(savedHistory) : {};
  });

  const [aircraft, setAircraft] = useState("");
  const [movementType, setMovementType] = useState("Tow");
  const [fromStand, setFromStand] = useState("");
  const [toStand, setToStand] = useState("");
  const [notes, setNotes] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAircraftSuggestions, setShowAircraftSuggestions] =
    useState(false);

  const [movementDate, setMovementDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  const [newReg, setNewReg] = useState("");
  const [newType, setNewType] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [currentUser, setCurrentUser] = useState(() => {
    const savedCurrentUser = localStorage.getItem("currentUser");
    return savedCurrentUser && savedCurrentUser !== "null"
      ? savedCurrentUser
      : null;
  });

  const [users, setUsers] = useState(() => {
    const savedUsers = localStorage.getItem("users");
    return savedUsers ? JSON.parse(savedUsers) : {};
  });

  const isAdmin = currentUser === "wayne";

  const [activePage, setActivePage] = useState("home");
  const [activeTab, setActiveTab] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState("ALL_USERS");

  const recordsPerPage = 10;

  useEffect(() => {
    localStorage.setItem(
      "aircraft-logbook-history",
      JSON.stringify(history)
    );
  }, [history]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("currentUser", currentUser);
    } else {
      localStorage.removeItem("currentUser");
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem("users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, activePage, searchTerm, selectedUser]);

  useEffect(() => {
    if (!successMessage) return;
    const timeout = setTimeout(() => setSuccessMessage(""), 5000);
    return () => clearTimeout(timeout);
  }, [successMessage]);

  useEffect(() => {
    localStorage.setItem(
      "aircraft-logbook-fleet",
      JSON.stringify(fleet)
    );
  }, [fleet]);

  const filteredAircraftOptions = useMemo(() => {
    if (!aircraft.trim()) return fleet.slice(0, 12);

    return fleet
      .filter((plane) =>
        plane.toLowerCase().includes(aircraft.toLowerCase())
      )
      .slice(0, 12);
  }, [aircraft, fleet]);

  const currentUserHistory = history[currentUser] || [];

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
        ${entry.movementType}
        ${entry.notes}
      `;

      return searchable
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    });
  }, [currentUserHistory, searchTerm]);

  const allHistory = useMemo(() => {
    if (!isAdmin) return [];
    return Object.values(history).flat();
  }, [history, isAdmin]);

  const typeFilteredHistory = useMemo(() => {
    let baseHistory = isAdmin ? allHistory : filteredHistory;
    if (isAdmin && selectedUser !== "ALL_USERS") {
      baseHistory = baseHistory.filter(
        (entry) => entry.createdBy === selectedUser
      );
    }
    if (activeTab === "ALL") return baseHistory;

    return baseHistory.filter((entry) =>
      entry.aircraft.includes(activeTab)
    );
  }, [filteredHistory, activeTab, isAdmin, allHistory, selectedUser]);

  const totalPages = Math.max(
    1,
    Math.ceil(typeFilteredHistory.length / recordsPerPage)
  );

  const paginatedHistory = typeFilteredHistory.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const stats = useMemo(() => {
    const baseHistory = isAdmin ? allHistory : currentUserHistory;
    const aircraftCounts = {};
    const standCounts = {};

    baseHistory.forEach((entry) => {
      aircraftCounts[entry.aircraft] =
        (aircraftCounts[entry.aircraft] || 0) + 1;

      standCounts[entry.fromStand] =
        (standCounts[entry.fromStand] || 0) + 1;

      standCounts[entry.toStand] =
        (standCounts[entry.toStand] || 0) + 1;
    });

    return {
      totalMovements: baseHistory.length,

      topAircraft: Object.entries(aircraftCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3),

      topStands: Object.entries(standCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3),
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

  const login = (username, password) => {
    if (username === "wayne" && password === "admin") {
      setCurrentUser(username);
      return true;
    }
    if (users[username] && users[username].password === password) {
      setCurrentUser(username);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const register = (username, password) => {
    if (users[username]) return false;
    setUsers({ ...users, [username]: { password } });
    return true;
  };

  const recoverPassword = (username) => {
    return users[username] ? users[username].password : null;
  };

  const listUsernames = () => {
    return Object.keys(users).filter(Boolean);
  };

  const deleteUser = (username) => {
    if (!username || username === "wayne") return;
    if (!window.confirm(`Delete user ${username} and all associated records?`)) {
      return;
    }
    const updatedUsers = { ...users };
    delete updatedUsers[username];

    const updatedHistory = { ...history };
    delete updatedHistory[username];

    setUsers(updatedUsers);
    setHistory(updatedHistory);
    if (selectedUser === username) {
      setSelectedUser("ALL_USERS");
    }
  };

  const resetUserPassword = (username, newPassword) => {
    if (!username || !newPassword) return false;
    if (!users[username]) return false;

    setUsers({
      ...users,
      [username]: { password: newPassword },
    });
    return true;
  };

  const addAircraftToFleet = () => {
    if (!newReg || !newType) {
      alert("Please enter both registration and aircraft type.");
      return;
    }

    const formattedAircraft = `${newReg.toUpperCase()} - ${newType}`;

    setFleet([...new Set([...fleet, formattedAircraft])].sort());

    setNewReg("");
    setNewType("");
  };

  const addLogEntry = () => {
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

    const userHistory = history[currentUser] || [];
    setHistory({ ...history, [currentUser]: [entry, ...userHistory] });

    setAircraft("");
    setFromStand("");
    setToStand("");
    setNotes("");
    setMovementType("Tow");
    setSuccessMessage("Movement added successfully.");
  };

 const deleteEntry = (id, owner) => {
  if (!id) return;
  if (window.confirm("Delete this movement?")) {
    const targetUser = owner || currentUser;
    const userHistory = history[targetUser] || [];
    setHistory({
      ...history,
      [targetUser]: userHistory.filter((entry) => entry.id !== id),
    });
  }
};

const exportLogbook = () => {
  const exportData = isAdmin ? allHistory : filteredHistory;
  exportLogbookCSV(exportData);
};

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
                activePage === "home"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setActivePage("movements")}
              className={`px-4 py-2 rounded-xl font-semibold ${
                activePage === "movements"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              Aircraft Movements
            </button>
            <button
              onClick={() => setActivePage("records")}
              className={`px-4 py-2 rounded-xl font-semibold ${
                activePage === "records"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              Movement Records
            </button>
            {isAdmin && (
              <button
                onClick={() => setActivePage("users")}
                className={`px-4 py-2 rounded-xl font-semibold ${
                  activePage === "users"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-700"
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
                  <h2 className="text-2xl font-bold text-slate-800">
                    Statistics Overview
                  </h2>
                  <div className="text-sm text-slate-500">
                    Live movement tracking
                  </div>
                </div>

                <StatsCards stats={stats} />

                {isAdmin && userSummary.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-slate-800">
                          User Movement Summary
                        </h3>
                        <div className="text-sm text-slate-500">
                          Ranked by total movements logged.
                        </div>
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
                              <td className="px-4 py-3 font-semibold text-slate-800">
                                {row.movements}
                              </td>
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
                  addAircraftToFleet={addAircraftToFleet}
                />

                <div className="hidden lg:block"></div>
              </div>
            </>
          ) : activePage === "users" ? (
            <AdminUsersPanel
              users={users}
              history={history}
              userSummary={userSummary}
              onDeleteUser={deleteUser}
              onResetPassword={resetUserPassword}
            />
          ) : activePage === "movements" ? (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl shadow-lg p-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                      Aircraft Movements
                    </h2>
                    <div className="text-sm text-slate-500">
                      Log new movements here.
                    </div>
                  </div>
                  <div className="text-sm text-slate-500">
                    {isAdmin ? allHistory.length : (history[currentUser] || []).length} records total
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
                addLogEntry={addLogEntry}
                successMessage={successMessage}
                clearSuccessMessage={() => setSuccessMessage("")}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl shadow-lg p-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                      Movement Records
                    </h2>
                    <div className="text-sm text-slate-500">
                      View all saved records in one place.
                    </div>
                  </div>
                  <div className="text-sm text-slate-500">
                    {isAdmin ? allHistory.length : (history[currentUser] || []).length} records total
                  </div>
                </div>
              </div>

              <RecordsPanel
                paginatedHistory={paginatedHistory}
                deleteEntry={deleteEntry}
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