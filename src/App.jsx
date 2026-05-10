import React, { useEffect, useMemo, useState } from "react";

import Header from "./components/Header.jsx";
import Login from "./components/Login.jsx";
import FleetManager from "./components/FleetManager.jsx";
import MovementForm from "./components/MovementForm.jsx";
import RecordsPanel from "./components/RecordsPanel.jsx";
import StatsCards from "./components/StatsCards.jsx";

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
    "G-TUKA - Boeing 737 MAX 8",
    "G-TUKB - Boeing 737 MAX 8",
    "G-TUKC - Boeing 737 MAX 8",
  ].sort();

  const [fleet, setFleet] = useState(() => {
    const savedFleet = localStorage.getItem("aircraft-logbook-fleet");
    return savedFleet ? JSON.parse(savedFleet) : initialFleet;
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

  const [currentUser, setCurrentUser] = useState(() => {
    return localStorage.getItem("currentUser") || null;
  });

  const [users, setUsers] = useState(() => {
    const savedUsers = localStorage.getItem("users");
    return savedUsers ? JSON.parse(savedUsers) : {};
  });

  const [isAdmin, setIsAdmin] = useState(false);

  const [activePage, setActivePage] = useState("home");
  const [activeTab, setActiveTab] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  const recordsPerPage = 10;

  useEffect(() => {
    localStorage.setItem(
      "aircraft-logbook-history",
      JSON.stringify(history)
    );
  }, [history]);

  useEffect(() => {
    localStorage.setItem("currentUser", currentUser);
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem("users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, activePage, searchTerm]);

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

  const filteredHistory = useMemo(() => {
    const userHistory = history[currentUser] || [];
    return userHistory.filter((entry) => {
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
  }, [history, searchTerm, currentUser]);

  const typeFilteredHistory = useMemo(() => {
    const baseHistory = isAdmin ? allHistory : filteredHistory;
    if (activeTab === "ALL") return baseHistory;

    return baseHistory.filter((entry) =>
      entry.aircraft.includes(activeTab)
    );
  }, [filteredHistory, activeTab, isAdmin, allHistory]);

  const totalPages = Math.max(
    1,
    Math.ceil(typeFilteredHistory.length / recordsPerPage)
  );

  const paginatedHistory = typeFilteredHistory.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const stats = useMemo(() => {
    const userHistory = history[currentUser] || [];
    const aircraftCounts = {};
    const standCounts = {};

    userHistory.forEach((entry) => {
      aircraftCounts[entry.aircraft] =
        (aircraftCounts[entry.aircraft] || 0) + 1;

      standCounts[entry.fromStand] =
        (standCounts[entry.fromStand] || 0) + 1;

      standCounts[entry.toStand] =
        (standCounts[entry.toStand] || 0) + 1;
    });

    return {
      totalMovements: userHistory.length,

      topAircraft: Object.entries(aircraftCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3),

      topStands: Object.entries(standCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3),
    };
  }, [history, currentUser]);

  const allHistory = useMemo(() => {
    if (!isAdmin) return [];
    return Object.values(history).flat();
  }, [history, isAdmin]);

  const login = (username, password) => {
    if (username === "wayne" && password === "admin") {
      setCurrentUser(username);
      setIsAdmin(true);
      return true;
    }
    if (users[username] && users[username].password === password) {
      setCurrentUser(username);
      setIsAdmin(false);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAdmin(false);
  };

  const register = (username, password) => {
    if (users[username]) return false;
    setUsers({ ...users, [username]: { password, history: [] } });
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
  };

 const deleteEntry = (index) => {
  if (window.confirm("Delete this movement?")) {
    const userHistory = history[currentUser] || [];
    setHistory({ ...history, [currentUser]: userHistory.filter((_, i) => i !== index) });
  }
};

const exportLogbook = () => {
  exportLogbookCSV(typeFilteredHistory);
};

  if (!currentUser) {
    return <Login onLogin={login} onRegister={register} />;
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
                allHistory={allHistory}
              />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}