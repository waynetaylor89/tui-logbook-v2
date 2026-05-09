# Updated App.jsx

```jsx
import React, { useEffect, useMemo, useState } from "react";

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
    "G-TUMM - Boeing 737 MAX 8",
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
  ].sort();

  const [fleet, setFleet] = useState(() => {
    const savedFleet = localStorage.getItem("aircraft-logbook-fleet");
    return savedFleet ? JSON.parse(savedFleet) : initialFleet;
  });

  const [history, setHistory] = useState(() => {
    const savedHistory = localStorage.getItem("aircraft-logbook-history");
    return savedHistory ? JSON.parse(savedHistory) : [];
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

  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("ALL");

  const recordsPerPage = 10;

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

  const filteredAircraftOptions = useMemo(() => {
    if (!aircraft.trim()) return fleet.slice(0, 12);

    return fleet
      .filter((plane) =>
        plane.toLowerCase().includes(aircraft.toLowerCase())
      )
      .slice(0, 12);
  }, [aircraft, fleet]);

  const filteredHistory = useMemo(() => {
    return history.filter((entry) => {
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
  }, [history, searchTerm]);

  const typeFilteredHistory = useMemo(() => {
    if (activeTab === "ALL") return filteredHistory;

    return filteredHistory.filter((entry) =>
      entry.aircraft.includes(activeTab)
    );
  }, [filteredHistory, activeTab]);

  const totalPages = Math.max(
    1,
    Math.ceil(typeFilteredHistory.length / recordsPerPage)
  );

  const paginatedHistory = typeFilteredHistory.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

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

    setHistory([entry, ...history]);

    setAircraft("");
    setFromStand("");
    setToStand("");
    setNotes("");
    setMovementType("Tow");
  };

  const deleteEntry = (index) => {
    if (window.confirm("Delete this movement?")) {
      setHistory(history.filter((_, i) => i !== index));
    }
  };

  const exportLogbook = () => {
    const rows = [
      [
        "Aircraft",
        "Movement Type",
        "From Stand",
        "To Stand",
        "Date",
        "Time",
        "Notes",
      ],

      ...typeFilteredHistory.map((entry) => [
        entry.aircraft,
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

  return (
    <div className="min-h-screen bg-sky-200">
      <div className="min-h-screen bg-sky-100 p-3 lg:p-6">
        <div className="max-w-7xl mx-auto space-y-4">

          {/* Sticky Header */}
          <div className="sticky top-0 z-50 bg-sky-100 pb-2">
            <div className="bg-white rounded-2xl shadow-lg p-4 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  MAN Aircraft Movement Logbook
                </h1>

                <div className="text-sm text-slate-500 mt-1">
                  {fleet.length} aircraft loaded
                </div>
              </div>

              <div className="text-sm font-medium text-slate-600">
                {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <div className="bg-white rounded-2xl shadow-lg p-4">
              <div className="text-sm text-slate-500 mb-1">
                Total Movements
              </div>

              <div className="text-4xl font-bold text-blue-600">
                {stats.totalMovements}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-4">
              <div className="text-sm text-slate-500 mb-3">
                Top Aircraft
              </div>

              <div className="space-y-2 text-sm">
                {stats.topAircraft.map(([name, count]) => (
                  <div
                    key={name}
                    className="flex justify-between"
                  >
                    <span className="truncate mr-2">
                      {name}
                    </span>

                    <span className="font-bold text-blue-600">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-4">
              <div className="text-sm text-slate-500 mb-3">
                Most Used Stands
              </div>

              <div className="space-y-2 text-sm">
                {stats.topStands.map(([name, count]) => (
                  <div
                    key={name}
                    className="flex justify-between"
                  >
                    <span>{name}</span>

                    <span className="font-bold text-emerald-600">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-3 gap-4">

            {/* Fleet Manager */}
            <div className="bg-white rounded-2xl shadow-lg p-4 space-y-4">
              <h2 className="text-xl font-bold text-slate-800">
                Fleet Manager
              </h2>

              <input
                value={newReg}
                onChange={(e) =>
                  setNewReg(e.target.value.toUpperCase())
                }
                placeholder="Aircraft Registration"
                className="w-full border rounded-xl px-4 py-3 bg-slate-50"
              />

              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="w-full border rounded-xl px-4 py-3 bg-slate-50"
              >
                <option value="">
                  Select Aircraft Type
                </option>

                {tuiAircraftTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              <button
                onClick={addAircraftToFleet}
                className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold"
              >
                Add Aircraft
              </button>
            </div>

            {/* Movement Entry */}
            <div className="bg-white rounded-2xl shadow-lg p-4 space-y-4">
              <h2 className="text-xl font-bold text-slate-800">
                New Movement
              </h2>

              <input
                type="date"
                value={movementDate}
                onChange={(e) =>
                  setMovementDate(e.target.value)
                }
                className="w-full border rounded-xl px-4 py-3 bg-slate-50"
              />

              <div className="relative">
                <input
                  value={aircraft}
                  onChange={(e) => {
                    setAircraft(e.target.value);
                    setShowAircraftSuggestions(true);
                  }}
                  onFocus={() =>
                    setShowAircraftSuggestions(true)
                  }
                  onBlur={() =>
                    setTimeout(
                      () => setShowAircraftSuggestions(false),
                      200
                    )
                  }
                  placeholder="Aircraft Registration"
                  className="w-full border rounded-xl px-4 py-3 bg-slate-50"
                />

                {showAircraftSuggestions && (
                  <div className="absolute z-20 w-full mt-1 bg-white border rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {filteredAircraftOptions.map((plane) => (
                      <button
                        key={plane}
                        type="button"
                        onMouseDown={() => {
                          setAircraft(plane);
                          setShowAircraftSuggestions(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-blue-100"
                      >
                        {plane}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <select
                value={movementType}
                onChange={(e) =>
                  setMovementType(e.target.value)
                }
                className="w-full border rounded-xl px-4 py-3 bg-slate-50"
              >
                {movementTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              <input
                value={fromStand}
                onChange={(e) =>
                  setFromStand(e.target.value.toUpperCase())
                }
                placeholder="From Stand"
                list="from-stands"
                className="w-full border rounded-xl px-4 py-3 bg-slate-50"
              />

              <datalist id="from-stands">
                {airportStands.MAN.map((stand) => (
                  <option key={stand} value={stand} />
                ))}
              </datalist>

              <input
                value={toStand}
                onChange={(e) =>
                  setToStand(e.target.value.toUpperCase())
                }
                placeholder="To Stand"
                list="to-stands"
                className="w-full border rounded-xl px-4 py-3 bg-slate-50"
              />

              <datalist id="to-stands">
                {airportStands.MAN.map((stand) => (
                  <option key={stand} value={stand} />
                ))}
              </datalist>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Movement Notes"
                rows={3}
                className="w-full border rounded-xl px-4 py-3 bg-slate-50 resize-none"
              />

              <button
                onClick={addLogEntry}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold"
              >
                Add Movement
              </button>

              <button
                onClick={exportLogbook}
                className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold"
              >
                Export CSV
              </button>
            </div>

            {/* Records */}
            <div className="bg-white rounded-2xl shadow-lg p-4 lg:col-span-1">

              <div className="flex flex-col gap-4 mb-4">

                <div className="flex justify-between items-center flex-wrap gap-3">
                  <h2 className="text-2xl font-bold text-slate-800">
```
