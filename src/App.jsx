import React, { useEffect, useMemo, useState } from "react";

export default function AircraftMovementLogbook() {
  const airports = ["MAN", "LGW", "BHX", "BRS", "EMA", "NCL"];

  const movementTypes = [
    "Tow",
    "Power Move",
    "Engineering",
    "Remote Stand",
    "Night Stop",
  ];

  const initialFleet = [
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
    "G-TAWJ - Boeing 737-800",
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
    "G-TUPH - Boeing 737 MAX 8",
    "G-TUIA - Boeing 787-8 Dreamliner",
    "G-TUIB - Boeing 787-8 Dreamliner",
    "G-TUIC - Boeing 787-8 Dreamliner",
    "G-TUIE - Boeing 787-8 Dreamliner",
    "G-TUIF - Boeing 787-8 Dreamliner",
    "G-TUIH - Boeing 787-8 Dreamliner",
    "G-TUII - Boeing 787-8 Dreamliner",
    "G-TUIP - Boeing 787-8 Dreamliner",
    "G-TUIJ - Boeing 787-9 Dreamliner",
    "G-TUIL - Boeing 787-9 Dreamliner",
    "G-TUIM - Boeing 787-9 Dreamliner",
    "G-TUIN - Boeing 787-9 Dreamliner",
    "G-TUIO - Boeing 787-9 Dreamliner",
  ].sort();

  const [fleet, setFleet] = useState(() => {
    const savedFleet = localStorage.getItem("aircraft-logbook-fleet");
    const fleetData = savedFleet ? JSON.parse(savedFleet) : initialFleet;
    return Array.from(new Set(fleetData)).sort();
  });
  const [aircraft, setAircraft] = useState("");
  const [showAircraftDropdown, setShowAircraftDropdown] = useState(false);
  const [editingShowAircraftDropdown, setEditingShowAircraftDropdown] = useState(false);
  const [fromStand, setFromStand] = useState("");
  const [toStand, setToStand] = useState("");
  const [notes, setNotes] = useState("");
  const [airport, setAirport] = useState("MAN");
  const [movementType, setMovementType] = useState("Tow");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("aircraft-logbook-theme");
    return savedTheme ? JSON.parse(savedTheme) : false;
  });
  const [newReg, setNewReg] = useState("");
  const [newType, setNewType] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingData, setEditingData] = useState(null);

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem("aircraft-logbook-history");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(
      "aircraft-logbook-history",
      JSON.stringify(history)
    );
  }, [history]);

  useEffect(() => {
    localStorage.setItem(
      "aircraft-logbook-fleet",
      JSON.stringify(fleet)
    );
  }, [fleet]);

  useEffect(() => {
    localStorage.setItem(
      "aircraft-logbook-theme",
      JSON.stringify(darkMode)
    );
  }, [darkMode]);

  const is7878Selected = aircraft.includes("787-8");

  const filteredAircraft = useMemo(() => {
    if (!aircraft.trim()) return fleet;
    return fleet.filter((plane) =>
      plane.toLowerCase().includes(aircraft.toLowerCase())
    );
  }, [aircraft, fleet]);

  const filteredHistory = useMemo(() => {
    return history.filter((entry) => {
      const searchable = `${entry.aircraft} ${entry.fromStand} ${entry.toStand} ${entry.airport} ${entry.movementType}`;

      return searchable
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    });
  }, [history, searchTerm]);

  const stats = useMemo(() => {
    const aircraftCounts = {};
    const standCounts = {};

    history.forEach((entry) => {
      aircraftCounts[entry.aircraft] =
        (aircraftCounts[entry.aircraft] || 0) + 1;

      standCounts[entry.fromStand] =
        (standCounts[entry.fromStand] || 0) + 1;

      standCounts[entry.toStand] =
        (standCounts[entry.toStand] || 0) + 1;
    });

    return {
      totalMovements: history.length,
      topAircraft: Object.entries(aircraftCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3),
      topStands: Object.entries(standCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3),
    };
  }, [history]);

  const addAircraftToFleet = () => {
    if (!newReg || !newType) {
      alert("Please enter both registration and aircraft type.");
      return;
    }

    const formattedAircraft = `${newReg.toUpperCase()} - ${newType}`;

    if (fleet.includes(formattedAircraft)) {
      alert("Aircraft already exists in fleet.");
      return;
    }

    setFleet([...fleet, formattedAircraft].sort());
    setNewReg("");
    setNewType("");
  };

  const addLogEntry = () => {
    if (!aircraft || !fromStand || !toStand) {
      alert("Please complete all required fields.");
      return;
    }

    const dateObj = new Date(selectedDate);
    const entry = {
      aircraft,
      airport,
      movementType,
      fromStand,
      toStand,
      notes,
      date: dateObj.toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
    };

    setHistory([entry, ...history]);

    setAircraft("");
    setFromStand("");
    setToStand("");
    setNotes("");
    setMovementType("Tow");
    const today = new Date();
    setSelectedDate(today.toISOString().split('T')[0]);
  };

  const exportLogbook = () => {
    const rows = [
      [
        "Aircraft",
        "Airport",
        "Movement Type",
        "From Stand",
        "To Stand",
        "Date",
        "Time",
        "Notes",
      ],
      ...filteredHistory.map((entry) => [
        entry.aircraft,
        entry.airport,
        entry.movementType,
        entry.fromStand,
        entry.toStand,
        entry.date,
        entry.time,
        entry.notes,
      ]),
    ];

    const csv = rows
      .map((row) => row.map((item) => `"${item}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "aircraft-logbook.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const clearLogbook = () => {
    if (window.confirm("Clear all logbook records?")) {
      setHistory([]);
    }
  };

  const startEdit = (index) => {
    setEditingIndex(index);
    setEditingData({ ...history[index] });
  };

  const saveEdit = () => {
    if (!editingData.aircraft || !editingData.fromStand || !editingData.toStand) {
      alert("Please complete all required fields.");
      return;
    }
    const updatedHistory = [...history];
    updatedHistory[editingIndex] = editingData;
    setHistory(updatedHistory);
    setEditingIndex(null);
    setEditingData(null);
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditingData(null);
  };

  const deleteEntry = (index) => {
    if (window.confirm("Delete this movement record?")) {
      const updatedHistory = history.filter((_, i) => i !== index);
      setHistory(updatedHistory);
      setEditingIndex(null);
      setEditingData(null);
    }
  };

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 sm:p-6 p-3 transition-colors">
        <div className="max-w-7xl mx-auto sm:space-y-6 space-y-3">
          <div className="flex justify-end">
            <div className="flex gap-1 bg-slate-200 dark:bg-slate-700 rounded-2xl p-1">
              <button
                onClick={() => setDarkMode(false)}
                className={`sm:px-4 px-3 sm:py-2 py-1 rounded-lg font-semibold text-sm sm:text-base transition-all ${
                  !darkMode
                    ? "bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-md"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100"
                }`}
              >
                ☀️ Light
              </button>
              <button
                onClick={() => setDarkMode(true)}
                className={`sm:px-4 px-3 sm:py-2 py-1 rounded-lg font-semibold text-sm sm:text-base transition-all ${
                  darkMode
                    ? "bg-slate-800 text-white shadow-md"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100"
                }`}
              >
                🌙 Dark
              </button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl sm:p-5 p-3 transition-colors">
              <div className="sm:text-sm text-xs text-slate-500 dark:text-slate-300 sm:mb-2 mb-1">
                Total Movements
              </div>
              <div className="sm:text-4xl text-2xl font-bold text-blue-600">
                {stats.totalMovements}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl sm:p-5 p-3 transition-colors">
              <div className="sm:text-sm text-xs text-slate-500 dark:text-slate-300 sm:mb-3 mb-2">
                Top Aircraft
              </div>

              <div className="sm:space-y-2 space-y-1 sm:text-sm text-xs">
                {stats.topAircraft.length === 0 ? (
                  <div className="text-slate-400">No data yet.</div>
                ) : (
                  stats.topAircraft.map(([name, count]) => (
                    <div
                      key={name}
                      className="flex justify-between"
                    >
                      <span className="truncate mr-2">{name}</span>
                      <span className="font-bold text-blue-600">
                        {count}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl sm:p-5 p-3 transition-colors">
              <div className="sm:text-sm text-xs text-slate-500 dark:text-slate-300 sm:mb-3 mb-2">
                Most Used Stands
              </div>

              <div className="sm:space-y-2 space-y-1 sm:text-sm text-xs">
                {stats.topStands.length === 0 ? (
                  <div className="text-slate-400">No data yet.</div>
                ) : (
                  stats.topStands.map(([name, count]) => (
                    <div
                      key={name}
                      className="flex justify-between"
                    >
                      <span>{name}</span>
                      <span className="font-bold text-emerald-600">
                        {count}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl sm:p-6 p-4 sm:space-y-4 space-y-3 transition-colors">
              <h2 className="sm:text-2xl text-lg font-bold text-slate-800 dark:text-white">
                Fleet Manager
              </h2>

              <input
                value={newReg}
                onChange={(e) => setNewReg(e.target.value.toUpperCase())}
                placeholder="Aircraft Registration"
                className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-2xl sm:px-4 px-3 sm:py-3 py-2 text-sm transition-colors"
              />

              <input
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                placeholder="Aircraft Type"
                className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-2xl sm:px-4 px-3 sm:py-3 py-2 text-sm transition-colors"
              />

              <button
                onClick={addAircraftToFleet}
                className="w-full bg-emerald-600 text-white rounded-2xl sm:py-3 py-2 font-semibold text-sm sm:text-base"
              >
                Add Aircraft
              </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl sm:p-6 p-4 sm:space-y-4 space-y-3 transition-colors">
              <h2 className="sm:text-2xl text-lg font-bold text-slate-800 dark:text-white">
                New Movement Entry
              </h2>

              <div className="grid sm:grid-cols-2 gap-3">
                <select
                  value={airport}
                  onChange={(e) => setAirport(e.target.value)}
                  className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-2xl sm:px-4 px-3 sm:py-3 py-2 text-sm transition-colors"
                >
                  {airports.map((airportCode) => (
                    <option key={airportCode} value={airportCode}>
                      {airportCode}
                    </option>
                  ))}
                </select>

                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-2xl sm:px-4 px-3 sm:py-3 py-2 text-sm transition-colors"
                />
              </div>

              <div className="relative">
                <input
                  value={aircraft}
                  onChange={(e) => {
                    setAircraft(e.target.value);
                    setShowAircraftDropdown(true);
                  }}
                  onFocus={() => setShowAircraftDropdown(true)}
                  onBlur={() => setTimeout(() => setShowAircraftDropdown(false), 200)}
                  placeholder="Select Aircraft"
                  className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-2xl sm:px-4 px-3 sm:py-3 py-2 text-sm transition-colors"
                />
                {showAircraftDropdown && filteredAircraft.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-700 border dark:border-slate-600 rounded-2xl shadow-lg max-h-[250px] overflow-y-auto">
                    {filteredAircraft.map((plane) => (
                      <div
                        key={plane}
                        onClick={() => {
                          setAircraft(plane);
                          setShowAircraftDropdown(false);
                        }}
                        className="px-4 py-2 hover:bg-blue-100 dark:hover:bg-slate-600 cursor-pointer text-slate-800 dark:text-white text-sm transition-colors"
                      >
                        {plane}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {is7878Selected && (
                <div className="bg-amber-100 border border-amber-300 text-amber-900 rounded-2xl sm:p-4 p-3 sm:text-sm text-xs font-semibold">
                  ⚠️ Boeing 787-8 aircraft can not be brake ridden. Please see engineering.
                </div>
              )}

              <input
                value={fromStand}
                onChange={(e) => setFromStand(e.target.value.toUpperCase())}
                placeholder="From Stand"
                className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-2xl sm:px-4 px-3 sm:py-3 py-2 text-sm transition-colors"
              />

              <input
                value={toStand}
                onChange={(e) => setToStand(e.target.value.toUpperCase())}
                placeholder="To Stand"
                className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-2xl sm:px-4 px-3 sm:py-3 py-2 text-sm transition-colors"
              />

              <select
                value={movementType}
                onChange={(e) => setMovementType(e.target.value)}
                className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-2xl sm:px-4 px-3 sm:py-3 py-2 text-sm transition-colors"
              >
                {movementTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Movement Notes"
                rows={3}
                className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-2xl sm:px-4 px-3 sm:py-3 py-2 text-sm resize-none transition-colors"
              />

              <button
                onClick={addLogEntry}
                className="w-full bg-blue-600 text-white rounded-2xl sm:py-3 py-2 font-semibold text-sm sm:text-base"
              >
                Add To Logbook
              </button>

              <button
                onClick={exportLogbook}
                className="w-full bg-emerald-600 text-white rounded-2xl sm:py-3 py-2 font-semibold text-sm sm:text-base"
              >
                Export CSV
              </button>

              <button
                onClick={clearLogbook}
                className="w-full bg-red-100 text-red-700 rounded-2xl sm:py-3 py-2 font-semibold text-sm sm:text-base"
              >
                Clear Logbook
              </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl sm:p-6 p-4 transition-colors">
              <div className="flex justify-between items-center sm:mb-4 mb-2 gap-2">
                <h2 className="sm:text-2xl text-lg font-bold text-slate-800 dark:text-white">
                  Movement Records
                </h2>

                <span className="sm:text-sm text-xs text-slate-500 dark:text-slate-300 whitespace-nowrap">
                  {filteredHistory.length} entries
                </span>
              </div>

              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search records..."
                className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-2xl sm:px-4 px-3 sm:py-3 py-2 sm:mb-4 mb-2 text-sm transition-colors"
              />

              <div className="space-y-2 sm:space-y-4 max-h-[50vh] sm:max-h-[700px] overflow-y-auto">
                {editingIndex !== null && editingData && (
                  <div className="border-2 border-blue-400 dark:border-blue-500 rounded-2xl sm:p-4 p-3 bg-blue-50 dark:bg-slate-800 transition-colors">
                    <h3 className="font-bold sm:text-lg text-base text-slate-800 dark:text-white mb-3">
                      Edit Movement Record
                    </h3>
                    <div className="space-y-3">
                      <div className="relative">
                        <input
                          value={editingData.aircraft}
                          onChange={(e) => {
                            setEditingData({ ...editingData, aircraft: e.target.value });
                            setEditingShowAircraftDropdown(true);
                          }}
                          onFocus={() => setEditingShowAircraftDropdown(true)}
                          onBlur={() => setTimeout(() => setEditingShowAircraftDropdown(false), 200)}
                          placeholder="Select Aircraft"
                          className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-2xl sm:px-4 px-3 sm:py-3 py-2 text-sm transition-colors"
                        />
                        {editingShowAircraftDropdown && filteredAircraft.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-700 border dark:border-slate-600 rounded-2xl shadow-lg max-h-[250px] overflow-y-auto">
                            {filteredAircraft.map((plane) => (
                              <div
                                key={plane}
                                onClick={() => {
                                  setEditingData({ ...editingData, aircraft: plane });
                                  setEditingShowAircraftDropdown(false);
                                }}
                                className="px-4 py-2 hover:bg-blue-100 dark:hover:bg-slate-600 cursor-pointer text-slate-800 dark:text-white text-sm transition-colors"
                              >
                                {plane}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <select
                          value={editingData.airport}
                          onChange={(e) =>
                            setEditingData({ ...editingData, airport: e.target.value })
                          }
                          className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-2xl sm:px-4 px-3 sm:py-3 py-2 text-sm transition-colors"
                        >
                          {airports.map((airportCode) => (
                            <option key={airportCode} value={airportCode}>
                              {airportCode}
                            </option>
                          ))}
                        </select>
                        <select
                          value={editingData.movementType}
                          onChange={(e) =>
                            setEditingData({ ...editingData, movementType: e.target.value })
                          }
                          className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-2xl sm:px-4 px-3 sm:py-3 py-2 text-sm transition-colors"
                        >
                          {movementTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <input
                          value={editingData.fromStand}
                          onChange={(e) =>
                            setEditingData({ ...editingData, fromStand: e.target.value.toUpperCase() })
                          }
                          placeholder="From Stand"
                          className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-2xl sm:px-4 px-3 sm:py-3 py-2 text-sm transition-colors"
                        />
                        <input
                          value={editingData.toStand}
                          onChange={(e) =>
                            setEditingData({ ...editingData, toStand: e.target.value.toUpperCase() })
                          }
                          placeholder="To Stand"
                          className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-2xl sm:px-4 px-3 sm:py-3 py-2 text-sm transition-colors"
                        />
                      </div>
                      <textarea
                        value={editingData.notes}
                        onChange={(e) =>
                          setEditingData({ ...editingData, notes: e.target.value })
                        }
                        placeholder="Movement Notes"
                        rows={3}
                        className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-2xl sm:px-4 px-3 sm:py-3 py-2 text-sm resize-none transition-colors"
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={saveEdit}
                          className="flex-1 bg-blue-600 text-white rounded-2xl sm:py-3 py-2 font-semibold text-sm sm:text-base"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="flex-1 bg-slate-400 text-white rounded-2xl sm:py-3 py-2 font-semibold text-sm sm:text-base"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {filteredHistory.length === 0 ? (
                  <div className="border-2 border-dashed dark:border-slate-600 rounded-2xl p-8 text-center text-slate-400 dark:text-slate-500 transition-colors">
                    No records found.
                  </div>
                ) : (
                  filteredHistory.map((item) => {
                    const actualIndex = history.indexOf(item);
                    return (
                      <div
                        key={`${item.aircraft}-${actualIndex}`}
                        className="border dark:border-slate-700 rounded-2xl sm:p-4 p-2 bg-slate-50 dark:bg-slate-900 transition-colors"
                      >
                        <div className="flex justify-between items-start sm:gap-4 gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="font-bold sm:text-lg text-base text-slate-800 dark:text-white truncate">
                              {item.aircraft}
                            </div>

                            <div className="sm:text-sm text-xs text-slate-500 dark:text-slate-300 mt-0.5">
                              {item.date} • {item.time}
                            </div>

                            <div className="sm:text-sm text-xs font-medium text-blue-600 mt-0.5">
                              {item.airport} • {item.movementType}
                            </div>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <div className="sm:text-sm text-xs text-slate-500 dark:text-slate-300">
                              Stand
                            </div>

                            <div className="font-semibold sm:text-base text-sm text-slate-700 dark:text-slate-200 whitespace-nowrap">
                              {item.fromStand}→{item.toStand}
                            </div>
                          </div>
                        </div>

                        {item.notes && (
                          <div className="sm:mt-4 mt-2 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl sm:p-3 p-2 sm:text-sm text-xs text-slate-700 dark:text-slate-200 whitespace-pre-wrap transition-colors">
                            {item.notes}
                          </div>
                        )}

                        <div className="flex gap-2 sm:mt-4 mt-2 pt-2 sm:pt-4 border-t dark:border-slate-700">
                          <button
                            onClick={() => startEdit(actualIndex)}
                            className="flex-1 bg-amber-500 text-white rounded-lg sm:px-3 px-2 sm:py-2 py-1 font-semibold text-xs sm:text-sm hover:bg-amber-600 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteEntry(actualIndex)}
                            className="flex-1 bg-red-500 text-white rounded-lg sm:px-3 px-2 sm:py-2 py-1 font-semibold text-xs sm:text-sm hover:bg-red-600 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="sm:mt-6 mt-3 bg-blue-50 dark:bg-slate-900 border border-blue-100 dark:border-slate-700 rounded-2xl sm:p-4 p-2 transition-colors hidden sm:block">
                <h3 className="sm:text-base text-sm font-semibold text-slate-800 dark:text-white sm:mb-2 mb-1">
                  Test Cases
                </h3>

                <ul className="sm:text-sm text-xs text-slate-600 list-disc pl-5 sm:space-y-1 space-y-0.5">
                  <li>Add a new aircraft and confirm it appears.</li>
                  <li>Create a movement entry and verify save.</li>
                  <li>Refresh page and ensure persistence.</li>
                  <li>Search aircraft or airport records.</li>
                  <li>Export CSV successfully.</li>
                  <li>Toggle dark mode correctly.</li>
                  <li>Select 787-8 and confirm warning appears.</li>
                  <li>Verify stats update after movements.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
// add delete button to movement entries  

