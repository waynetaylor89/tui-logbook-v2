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
    "G-TUKL - Boeing 737 MAX 8",
    "G-TUKM - Boeing 737 MAX 8",
    "G-TUMF - Boeing 737 MAX 8",
    "G-TAWA - Boeing 737-800",
    "G-TAWB - Boeing 737-800",
  ];

  const [fleet, setFleet] = useState(initialFleet);
  const [aircraft, setAircraft] = useState("");
  const [fromStand, setFromStand] = useState("");
  const [toStand, setToStand] = useState("");
  const [notes, setNotes] = useState("");
  const [airport, setAirport] = useState("MAN");
  const [movementType, setMovementType] = useState("Tow");
  const [searchTerm, setSearchTerm] = useState("");
  const [darkMode, setDarkMode] = useState(false);
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
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 p-6 transition-colors">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="bg-slate-800 text-white px-4 py-2 rounded-xl"
            >
              {darkMode ? "Light Mode" : "Dark Mode"}
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white rounded-3xl shadow-xl p-5">
              <div className="text-sm text-slate-500 mb-2">
                Total Movements
              </div>
              <div className="text-4xl font-bold text-blue-600">
                {stats.totalMovements}
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl p-5">
              <div className="text-sm text-slate-500 mb-3">
                Top Aircraft
              </div>

              <div className="space-y-2 text-sm">
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

            <div className="bg-white rounded-3xl shadow-xl p-5">
              <div className="text-sm text-slate-500 mb-3">
                Most Used Stands
              </div>

              <div className="space-y-2 text-sm">
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

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl shadow-xl p-6 space-y-4">
              <h2 className="text-2xl font-bold text-slate-800">
                Fleet Manager
              </h2>

              <input
                value={newReg}
                onChange={(e) => setNewReg(e.target.value.toUpperCase())}
                placeholder="Aircraft Registration"
                className="w-full border rounded-2xl px-4 py-3"
              />

              <input
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                placeholder="Aircraft Type"
                className="w-full border rounded-2xl px-4 py-3"
              />

              <button
                onClick={addAircraftToFleet}
                className="w-full bg-emerald-600 text-white rounded-2xl py-3 font-semibold"
              >
                Add Aircraft
              </button>
            </div>

            <div className="bg-white rounded-3xl shadow-xl p-6 space-y-4">
              <h2 className="text-2xl font-bold text-slate-800">
                New Movement Entry
              </h2>

              <select
                value={airport}
                onChange={(e) => setAirport(e.target.value)}
                className="w-full border rounded-2xl px-4 py-3"
              >
                {airports.map((airportCode) => (
                  <option key={airportCode} value={airportCode}>
                    {airportCode}
                  </option>
                ))}
              </select>

              <select
                value={aircraft}
                onChange={(e) => setAircraft(e.target.value)}
                className="w-full border rounded-2xl px-4 py-3"
              >
                <option value="">Select Aircraft</option>
                {fleet.map((plane) => (
                  <option key={plane} value={plane}>
                    {plane}
                  </option>
                ))}
              </select>

              {is7878Selected && (
                <div className="bg-amber-100 border border-amber-300 text-amber-900 rounded-2xl p-4 text-sm font-semibold">
                  ⚠️ Boeing 787-8 aircraft can not be brake ridden. Please see engineering.
                </div>
              )}

              <input
                value={fromStand}
                onChange={(e) => setFromStand(e.target.value.toUpperCase())}
                placeholder="From Stand"
                className="w-full border rounded-2xl px-4 py-3"
              />

              <input
                value={toStand}
                onChange={(e) => setToStand(e.target.value.toUpperCase())}
                placeholder="To Stand"
                className="w-full border rounded-2xl px-4 py-3"
              />

              <select
                value={movementType}
                onChange={(e) => setMovementType(e.target.value)}
                className="w-full border rounded-2xl px-4 py-3"
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
                rows={4}
                className="w-full border rounded-2xl px-4 py-3 resize-none"
              />

              <button
                onClick={addLogEntry}
                className="w-full bg-blue-600 text-white rounded-2xl py-3 font-semibold"
              >
                Add To Logbook
              </button>

              <button
                onClick={exportLogbook}
                className="w-full bg-emerald-600 text-white rounded-2xl py-3 font-semibold"
              >
                Export CSV
              </button>

              <button
                onClick={clearLogbook}
                className="w-full bg-red-100 text-red-700 rounded-2xl py-3 font-semibold"
              >
                Clear Logbook
              </button>
            </div>

            <div className="bg-white rounded-3xl shadow-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-slate-800">
                  Movement Records
                </h2>

                <span className="text-sm text-slate-500">
                  {filteredHistory.length} entries
                </span>
              </div>

              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search records..."
                className="w-full border rounded-2xl px-4 py-3 mb-4"
              />

              <div className="space-y-4 max-h-[700px] overflow-y-auto">
                {filteredHistory.length === 0 ? (
                  <div className="border-2 border-dashed rounded-2xl p-8 text-center text-slate-400">
                    No records found.
                  </div>
                ) : (
                  filteredHistory.map((item, index) => (
                    <div
                      key={`${item.aircraft}-${index}`}
                      className="border rounded-2xl p-4 bg-slate-50"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <div className="font-bold text-lg text-slate-800">
                            {item.aircraft}
                          </div>

                          <div className="text-sm text-slate-500 mt-1">
                            {item.date} • {item.time}
                          </div>

                          <div className="text-sm font-medium text-blue-600 mt-1">
                            {item.airport} • {item.movementType}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm text-slate-500">
                            Stand Move
                          </div>

                          <div className="font-semibold text-slate-700">
                            {item.fromStand} → {item.toStand}
                          </div>
                        </div>
                      </div>

                      {item.notes && (
                        <div className="mt-4 bg-white border rounded-xl p-3 text-sm text-slate-700 whitespace-pre-wrap">
                          {item.notes}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl p-4">
                <h3 className="font-semibold text-slate-800 mb-2">
                  Test Cases
                </h3>

                <ul className="text-sm text-slate-600 list-disc pl-5 space-y-1">
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
