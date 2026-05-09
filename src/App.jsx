import React, { useEffect, useMemo, useState } from "react";

export default function AircraftMovementLogbook() {
  const airports = ["MAN", "LGW", "BHX", "BRS", "EMA", "NCL"];

  const airportStands = {
    MAN: ["1", "2", "5", "12", "20", "21", "22", "23", "24", "25", "R1", "R2", "R3"],
    LGW: ["101", "102", "103", "104", "105", "106", "551", "552"],
    BHX: ["40", "41", "42", "54", "55", "56"],
    BRS: ["10", "11", "12", "14", "16"],
    EMA: ["1", "2", "3", "4", "5"],
    NCL: ["20", "21", "22", "23", "24"],
  };

  const movementTypes = [
    "Tow",
    "Power Move",
    "Engineering",
    "Remote Stand",
    "Night Stop",
  ];

  const initialFleet = [
    "G-TUMM - Boeing 737 MAX 8",
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
  ];

  const [fleet, setFleet] = useState(() => {
    const savedFleet = localStorage.getItem("aircraft-logbook-fleet");
    return savedFleet ? JSON.parse(savedFleet) : initialFleet;
  });
  const [aircraft, setAircraft] = useState("");
  const [showAircraftSuggestions, setShowAircraftSuggestions] = useState(false);
  const [fromStand, setFromStand] = useState("");
  const [toStand, setToStand] = useState("");
  const [notes, setNotes] = useState("");
  const [airport, setAirport] = useState("MAN");
  const [movementType, setMovementType] = useState("Tow");
  const [movementDate, setMovementDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [Mode, setMode] = useState(() => {
  const savedTheme = localStorage.getItem("aircraft-logbook-theme");
  return savedTheme ? JSON.parse(savedTheme) : false;
});
  const [newReg, setNewReg] = useState("");
  const tuiAircraftTypes = [
    "Boeing 737-800",
    "Boeing 737 MAX 8",
    "Boeing 787-8 Dreamliner",
    "Boeing 787-9 Dreamliner",
  ];

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
    JSON.stringify(Mode)
  );
}, [Mode]);

  const filteredAircraftOptions = useMemo(() => {
    if (!aircraft.trim()) return fleet.slice(0, 12);

    return fleet
      .filter((plane) =>
        plane.toLowerCase().includes(aircraft.toLowerCase())
      )
      .slice(0, 12);
  }, [aircraft, fleet]);

  const is7878Selected = aircraft.includes("787-8");

  const filteredAircraftSuggestions = useMemo(() => {
    if (!searchTerm.trim()) return [];

    return fleet.filter((plane) =>
      plane.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 8);
  }, [searchTerm, fleet]);

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

    const selectedDate = new Date(movementDate);

    const entry = {
      aircraft,
      airport,
      movementType,
      fromStand,
      toStand,
      notes,
      date: selectedDate.toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
    };

    setHistory([entry, ...history]);

    setAircraft("");
    setFromStand("");
    setToStand("");
    setNotes("");
    setMovementType("Tow");
    setMovementDate(new Date().toISOString().split("T")[0]);
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
    const updated = [...history];
    updated[editingIndex] = editingData;
    setHistory(updated);
    setEditingIndex(null);
    setEditingData(null);
  };

  const deleteEntry = (index) => {
    if (window.confirm("Delete this movement?")) {
      setHistory(history.filter((_, i) => i !== index));
    }
  };

  const monthlyMovements = useMemo(() => {
    const monthly = {};

    history.forEach((entry) => {
      const month = entry.date.split("/").slice(1).join("/");
      monthly[month] = (monthly[month] || 0) + 1;
    });

    return Object.entries(monthly).slice(-6);
  }, [history]);

  return (
  <div className="min-h-screen bg-sky-200">
    <div className="min-h-screen bg-sky-100 p-2 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-3 sm:space-y-6">

        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-xl p-3 sm:p-5 transition-colors">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800">
              Monthly Movement Trend
            </h2>

            <span className="text-sm text-slate-700">
              Last 6 Months
            </span>
          </div>

          <div className="space-y-3">
            {monthlyMovements.length === 0 ? (
              <div className="text-slate-600 text-sm">
                No movement data yet.
              </div>
            ) : (
              monthlyMovements.map(([month, count]) => (
                <div key={month}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-700">{month}</span>

                    <span className="font-bold text-blue-600">
                      {count}
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-blue-600 h-3 rounded-full"
                      style={{
                        width: `${Math.min(count * 10, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-white :bg-slate-800 rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-xl p-3 sm:p-5 transition-colors">
              <div className="text-sm text-slate-700 :text-slate-300 mb-2">
                Total Movements
              </div>
              <div className="text-2xl sm:text-4xl font-bold text-blue-600">
                {stats.totalMovements}
              </div>
            </div>

            <div className="bg-white :bg-slate-800 rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-xl p-3 sm:p-5 transition-colors">
              <div className="text-sm text-slate-700 :text-slate-300 mb-3">
                Top Aircraft
              </div>

              <div className="space-y-2 text-sm">
                {stats.topAircraft.length === 0 ? (
                  <div className="text-slate-600">No data yet.</div>
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

            <div className="bg-white :bg-slate-800 rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-xl p-3 sm:p-5 transition-colors">
              <div className="text-sm text-slate-700 :text-slate-300 mb-3">
                Most Used Stands
              </div>

              <div className="space-y-2 text-sm">
                {stats.topStands.length === 0 ? (
                  <div className="text-slate-600">No data yet.</div>
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
            <div className="bg-white :bg-slate-800 rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-xl p-3 sm:p-6 space-y-4 transition-colors">
              <h2 className="text-lg sm:text-2xl font-bold text-slate-800 :text-white">
                Fleet Manager
              </h2>

              <input
                value={newReg}
                onChange={(e) => setNewReg(e.target.value.toUpperCase())}
                placeholder="Aircraft Registration"
                className="w-full border :border-slate-600 bg-slate-100 :bg-slate-700 text-slate-900 :text-white rounded-2xl px-3 sm:px-4 py-2 sm:py-3 transition-colors"
              />

              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="w-full border :border-slate-600 bg-slate-100 :bg-slate-700 text-slate-900 :text-white rounded-2xl px-3 sm:px-4 py-2 sm:py-3 text-sm transition-colors"
              >
                <option value="">Select Aircraft Type</option>
                {tuiAircraftTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              <button
                onClick={addAircraftToFleet}
                className="w-full bg-emerald-600 text-white rounded-xl sm:rounded-2xl py-2.5 sm:py-3 font-semibold text-sm sm:text-base"
              >
                Add Aircraft
              </button>
            </div>

            <div className="bg-white :bg-slate-800 rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-xl p-3 sm:p-6 space-y-4 transition-colors">
              <h2 className="text-lg sm:text-2xl font-bold text-slate-800 :text-white">
                New Movement Entry
              </h2>

              <input
                type="date"
                value={movementDate}
                onChange={(e) => setMovementDate(e.target.value)}
                className="w-full border :border-slate-600 bg-slate-100 :bg-slate-700 text-slate-900 :text-white rounded-2xl px-3 sm:px-4 py-2 sm:py-3 transition-colors"
              />

              <select
                value={airport}
                onChange={(e) => setAirport(e.target.value)}
                className="w-full border :border-slate-600 bg-slate-100 :bg-slate-700 text-slate-900 :text-white rounded-2xl px-3 sm:px-4 py-2 sm:py-3 transition-colors"
              >
                {airports.map((airportCode) => (
                  <option key={airportCode} value={airportCode}>
                    {airportCode}
                  </option>
                ))}
              </select>

              <div className="relative">
                <input
                  value={aircraft}
                  onChange={(e) => {
                    setAircraft(e.target.value);
                    setShowAircraftSuggestions(true);
                  }}
                  onFocus={() => setShowAircraftSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowAircraftSuggestions(false), 200)}
                  placeholder="Start typing aircraft registration..."
                  className="w-full border :border-slate-600 bg-slate-100 :bg-slate-700 text-slate-900 :text-white rounded-2xl px-3 sm:px-4 py-2 sm:py-3 transition-colors"
                />

                {showAircraftSuggestions && filteredAircraftOptions.length > 0 && (
                  <div className="absolute z-20 w-full mt-1 bg-white :bg-slate-800 border :border-slate-700 rounded-2xl shadow-xl max-h-60 overflow-y-auto">
                    {filteredAircraftOptions.map((plane) => (
                      <button
                        key={plane}
                        type="button"
                        onMouseDown={() => {
                          setAircraft(plane);
                          setShowAircraftSuggestions(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-blue-100 :hover:bg-slate-700 text-slate-800 :text-white text-sm transition-colors"
                      >
                        {plane}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {is7878Selected && (
                <div className="bg-amber-100 border border-amber-300 text-amber-900 rounded-2xl p-4 text-sm font-semibold">
                  ⚠️ Boeing 787-8 aircraft can not be brake ridden. Please see engineering.
                </div>
              )}

              <div className="space-y-2">
                <input
                  value={fromStand}
                  onChange={(e) => setFromStand(e.target.value.toUpperCase())}
                  placeholder="From Stand"
                  list="from-stands"
                  className="w-full border :border-slate-600 bg-slate-100 :bg-slate-700 text-slate-900 :text-white rounded-2xl px-3 sm:px-4 py-2 sm:py-3 transition-colors"
                />

                <datalist id="from-stands">
                  {airportStands[airport].map((stand) => (
                    <option key={stand} value={stand} />
                  ))}
                </datalist>
              </div>

              <div className="space-y-2">
                <input
                  value={toStand}
                  onChange={(e) => setToStand(e.target.value.toUpperCase())}
                  placeholder="To Stand"
                  list="to-stands"
                  className="w-full border :border-slate-600 bg-slate-100 :bg-slate-700 text-slate-900 :text-white rounded-2xl px-3 sm:px-4 py-2 sm:py-3 transition-colors"
                />

                <datalist id="to-stands">
                  {airportStands[airport].map((stand) => (
                    <option key={stand} value={stand} />
                  ))}
                </datalist>
              </div>

              <select
                value={movementType}
                onChange={(e) => setMovementType(e.target.value)}
                className="w-full border :border-slate-600 bg-slate-100 :bg-slate-700 text-slate-900 :text-white rounded-2xl px-3 sm:px-4 py-2 sm:py-3 transition-colors"
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
                className="w-full border :border-slate-600 bg-slate-100 :bg-slate-700 text-slate-900 :text-white rounded-2xl px-3 sm:px-4 py-2 sm:py-3 resize-none transition-colors"
              />

              <button
                onClick={addLogEntry}
                className="w-full bg-blue-600 text-white rounded-xl sm:rounded-2xl py-2.5 sm:py-3 font-semibold text-sm sm:text-base"
              >
                Add To Logbook
              </button>

              <button
                onClick={exportLogbook}
                className="w-full bg-emerald-600 text-white rounded-xl sm:rounded-2xl py-2.5 sm:py-3 font-semibold text-sm sm:text-base"
              >
                Export CSV
              </button>

              <button
                onClick={clearLogbook}
                className="w-full bg-red-100 text-red-700 rounded-xl sm:rounded-2xl py-2.5 sm:py-3 font-semibold text-sm sm:text-base"
              >
                Clear Logbook
              </button>
            </div>

            <div className="bg-white :bg-slate-800 rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-xl p-3 sm:p-6 transition-colors">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg sm:text-2xl font-bold text-slate-800 :text-white">
                  Movement Records
                </h2>

                <span className="text-sm text-slate-700 :text-slate-300">
                  {filteredHistory.length} entries
                </span>
              </div>

              <div className="relative mb-4">
                <input
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowSearchSuggestions(true);
                  }}
                  onFocus={() => setShowSearchSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 200)}
                  placeholder="Search aircraft registration..."
                  className="w-full border :border-slate-600 bg-slate-100 :bg-slate-700 text-slate-900 :text-white rounded-2xl px-3 sm:px-4 py-2 sm:py-3 transition-colors"
                />

                {showSearchSuggestions && filteredAircraftSuggestions.length > 0 && (
                  <div className="absolute z-20 w-full mt-1 bg-white :bg-slate-800 border :border-slate-700 rounded-2xl shadow-xl max-h-60 overflow-y-auto">
                    {filteredAircraftSuggestions.map((plane) => (
                      <button
                        key={plane}
                        onMouseDown={() => {
                          setSearchTerm(plane);
                          setShowSearchSuggestions(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-blue-100 :hover:bg-slate-700 text-slate-800 :text-white text-sm transition-colors"
                      >
                        {plane}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2 sm:space-y-4 max-h-[60vh] sm:max-h-[700px] overflow-y-auto">
                {editingIndex !== null && editingData && (
                  <div className="border-2 border-amber-400 :border-amber-500 rounded-2xl p-3 sm:p-4 bg-amber-50 :bg-slate-900 transition-colors mb-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-base sm:text-lg font-bold text-slate-800 :text-white">
                        Edit Movement Record
                      </h3>

                      <button
                        onClick={() => {
                          setEditingIndex(null);
                          setEditingData(null);
                        }}
                        className="text-slate-500 hover:text-red-500 text-sm font-semibold"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="space-y-3">
                      <input
                        type="date"
                        value={editingData.date || ""}
                        onChange={(e) =>
                          setEditingData({
                            ...editingData,
                            date: e.target.value,
                          })
                        }
                        className="w-full border :border-slate-600 bg-slate-100 :bg-slate-700 text-slate-900 :text-white rounded-2xl px-3 sm:px-4 py-2 sm:py-3 transition-colors"
                      />

                      <select
                        value={editingData.aircraft}
                        onChange={(e) =>
                          setEditingData({
                            ...editingData,
                            aircraft: e.target.value,
                          })
                        }
                        className="w-full border :border-slate-600 bg-slate-100 :bg-slate-700 text-slate-900 :text-white rounded-2xl px-3 sm:px-4 py-2 sm:py-3 transition-colors"
                      >
                        {fleet.map((plane) => (
                          <option key={plane} value={plane}>
                            {plane}
                          </option>
                        ))}
                      </select>

                      <div className="grid grid-cols-2 gap-3">
                        <select
                          value={editingData.fromStand}
                          onChange={(e) =>
                            setEditingData({
                              ...editingData,
                              fromStand: e.target.value,
                            })
                          }
                          className="w-full border :border-slate-600 bg-slate-100 :bg-slate-700 text-slate-900 :text-white rounded-2xl px-3 sm:px-4 py-2 sm:py-3 transition-colors"
                        >
                          {airportStands[editingData.airport || airport].map((stand) => (
                            <option key={stand} value={stand}>
                              {stand}
                            </option>
                          ))}
                        </select>

                        <select
                          value={editingData.toStand}
                          onChange={(e) =>
                            setEditingData({
                              ...editingData,
                              toStand: e.target.value,
                            })
                          }
                          className="w-full border :border-slate-600 bg-slate-100 :bg-slate-700 text-slate-900 :text-white rounded-2xl px-3 sm:px-4 py-2 sm:py-3 transition-colors"
                        >
                          {airportStands[editingData.airport || airport].map((stand) => (
                            <option key={stand} value={stand}>
                              {stand}
                            </option>
                          ))}
                        </select>
                      </div>

                      <select
                        value={editingData.movementType}
                        onChange={(e) =>
                          setEditingData({
                            ...editingData,
                            movementType: e.target.value,
                          })
                        }
                        className="w-full border :border-slate-600 bg-slate-100 :bg-slate-700 text-slate-900 :text-white rounded-2xl px-3 sm:px-4 py-2 sm:py-3 transition-colors"
                      >
                        {movementTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>

                      <textarea
                        value={editingData.notes || ""}
                        onChange={(e) =>
                          setEditingData({
                            ...editingData,
                            notes: e.target.value,
                          })
                        }
                        rows={3}
                        placeholder="Edit movement notes"
                        className="w-full border :border-slate-600 bg-slate-100 :bg-slate-700 text-slate-900 :text-white rounded-2xl px-3 sm:px-4 py-2 sm:py-3 resize-none transition-colors"
                      />

                      <button
                        onClick={saveEdit}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-xl sm:rounded-2xl py-2.5 sm:py-3 font-semibold text-sm sm:text-base transition-colors"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                )}
                {filteredHistory.length === 0 ? (
                  <div className="border-2 border-dashed :border-slate-600 rounded-2xl p-8 text-center text-slate-600 :text-slate-500 transition-colors">
                    No records found.
                  </div>
                ) : (
                  filteredHistory.map((item, index) => (
                    <div
                      key={`${item.aircraft}-${index}`}
                      className="border :border-slate-700 rounded-xl sm:rounded-2xl p-2 sm:p-4 bg-white :bg-slate-900 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-4">
                        <div>
                          <div className="font-bold text-sm sm:text-lg text-slate-800 :text-white">
                            {item.aircraft}
                          </div>

                          <div className="text-xs sm:text-sm text-slate-700 :text-slate-300 mt-1">
                            {item.date} • {item.time}
                          </div>

                          <div className="text-xs sm:text-sm font-medium text-blue-600 mt-1">
                            {item.airport} • {item.movementType}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm text-slate-700 :text-slate-300">
                            Stand Move
                          </div>

                          <div className="font-semibold text-sm sm:text-base text-slate-700 :text-slate-200">
                            {item.fromStand} → {item.toStand}
                          </div>
                        </div>
                      </div>

                      {item.notes && (
                        <div className="mt-2 sm:mt-4 bg-white :bg-slate-800 border :border-slate-700 rounded-xl p-2 sm:p-3 text-xs sm:text-sm text-slate-700 :text-slate-200 whitespace-pre-wrap transition-colors">
                          {item.notes}
                        </div>
                      )}

                      <div className="flex gap-2 mt-2 sm:mt-4 pt-2 sm:pt-4 border-t :border-slate-700">
                        <button
                          onClick={() => startEdit(index)}
                          className="flex-1 bg-amber-500 hover:bg-amber-600 text-white rounded-xl py-2 font-semibold text-sm transition-colors"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => deleteEntry(index)}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl py-2 font-semibold text-sm transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-6 bg-white :bg-slate-900 border border-blue-100 :border-slate-700 rounded-2xl p-4 transition-colors">
                <h3 className="font-semibold text-slate-800 :text-white mb-2">
                  Test Cases
                </h3>

                <ul className="text-sm text-slate-600 list-disc pl-5 space-y-1">
                  <li>Add a new aircraft and confirm it appears.</li>
                  <li>Create a movement entry and verify save.</li>
                  <li>Refresh page and ensure persistence.</li>
                  <li>Search aircraft or airport records.</li>
                  <li>Export CSV successfully.</li>
                  <li>Toggle  mode correctly.</li>
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
