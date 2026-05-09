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
    "G-TUMF - Boeing 737 MAX 8",
    "G-TAWA - Boeing 737-800",
    "G-TAWB - Boeing 737-800",
    "G-TAWC - Boeing 737-800",
    "G-TAWD - Boeing 737-800",
    "G-TAWE - Boeing 737-800",
    "G-TAWF - Boeing 737-800",
    "G-TAWG - Boeing 737-800",
    "G-TAWH - Boeing 737-800",
    "G-TAWI - Boeing 737-800",
    "G-TAWJ - Boeing 737-800",
    "G-TAWK - Boeing 737-800",
  ];

  const [fleet, setFleet] = useState(() => {
    const savedFleet = localStorage.getItem("aircraft-logbook-fleet");
    return savedFleet ? JSON.parse(savedFleet) : initialFleet;
  });
  const [aircraft, setAircraft] = useState("");
  const [fromStand, setFromStand] = useState("");
  const [toStand, setToStand] = useState("");
  const [notes, setNotes] = useState("");
  const [airport, setAirport] = useState("MAN");
  const [movementType, setMovementType] = useState("Tow");
  const [searchTerm, setSearchTerm] = useState("");
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("aircraft-logbook-theme");
    return savedTheme ? JSON.parse(savedTheme) : false;
  });
  const [newReg, setNewReg] = useState("");
  const [newType, setNewType] = useState("");

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

    const entry = {
      aircraft,
      airport,
      movementType,
      fromStand,
      toStand,
      notes,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
    };

    setHistory([entry, ...history]);

    setAircraft("");
    setFromStand("");
    setToStand("");
    setNotes("");
    setMovementType("Tow");
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

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 sm:p-6 p-3 transition-colors">
        <div className="max-w-7xl mx-auto sm:space-y-6 space-y-3">
          <div className="flex justify-end">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="bg-slate-800 text-white sm:px-4 px-3 sm:py-2 py-1 rounded-xl text-sm sm:text-base"
            >
              {darkMode ? "Light Mode" : "Dark Mode"}
            </button>
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
                list="aircraft-list"
                value={aircraft}
                onChange={(e) => setAircraft(e.target.value)}
                placeholder="Select Aircraft"
                className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-2xl sm:px-4 px-3 sm:py-3 py-2 text-sm transition-colors"
              />
              <datalist id="aircraft-list">
                {fleet.map((plane) => (
                  <option key={plane} value={plane} />
                ))}
              </datalist>

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
                {filteredHistory.length === 0 ? (
                  <div className="border-2 border-dashed dark:border-slate-600 rounded-2xl p-8 text-center text-slate-400 dark:text-slate-500 transition-colors">
                    No records found.
                  </div>
                ) : (
                  filteredHistory.map((item, index) => (
                    <div
                      key={`${item.aircraft}-${index}`}
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
                    </div>
                  ))
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

