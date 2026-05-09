# App.jsx

```jsx
import React, { useEffect, useMemo, useState } from "react";

import Header from "./components/Header";
import StatsCards from "./components/StatsCards";
import FleetManager from "./components/FleetManager";
import MovementForm from "./components/MovementForm";
import RecordsPanel from "./components/RecordsPanel";

import { exportLogbookCSV } from "./utils/exportCSV";

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
  exportLogbookCSV(typeFilteredHistory);
};
  
  return (
    <div className="min-h-screen bg-sky-200">
      <div className="min-h-screen bg-sky-100 p-3 lg:p-6">
        <div className="max-w-7xl mx-auto space-y-4">

          <Header fleetCount={fleet.length} />

          <StatsCards stats={stats} />

          <div className="grid lg:grid-cols-3 gap-4">

            <FleetManager
              newReg={newReg}
              setNewReg={setNewReg}
              newType={newType}
              setNewType={setNewType}
              tuiAircraftTypes={tuiAircraftTypes}
              addAircraftToFleet={addAircraftToFleet}
            />

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
              exportLogbook={exportLogbook}
            />

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
            />

          </div>
        </div>
      </div>
    </div>
  );
}
```

---

# components/Header.jsx

```jsx
export default function Header({ fleetCount }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          MAN Aircraft Movement Logbook
        </h1>

        <div className="text-sm text-slate-500 mt-1">
          {fleetCount} aircraft loaded
        </div>
      </div>

      <div className="text-sm font-medium text-slate-600">
        {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
}
```

---

# components/StatsCards.jsx

```jsx
export default function StatsCards({ stats }) {
  return (
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
            <div key={name} className="flex justify-between">
              <span className="truncate mr-2">{name}</span>
              <span className="font-bold text-blue-600">{count}</span>
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
            <div key={name} className="flex justify-between">
              <span>{name}</span>
              <span className="font-bold text-emerald-600">{count}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
```

---

# components/FleetManager.jsx

```jsx
export default function FleetManager({
  newReg,
  setNewReg,
  newType,
  setNewType,
  tuiAircraftTypes,
  addAircraftToFleet,
}) {
  return (
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
        <option value="">Select Aircraft Type</option>

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
  );
}
```

---

# components/MovementForm.jsx

```jsx
export default function MovementForm({
  movementDate,
  setMovementDate,
  aircraft,
  setAircraft,
  movementType,
  setMovementType,
  fromStand,
  setFromStand,
  toStand,
  setToStand,
  notes,
  setNotes,
  movementTypes,
  airportStands,
  filteredAircraftOptions,
  showAircraftSuggestions,
  setShowAircraftSuggestions,
  addLogEntry,
  exportLogbook,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 space-y-4">
      <h2 className="text-xl font-bold text-slate-800">
        New Movement
      </h2>

      <input
        type="date"
        value={movementDate}
        onChange={(e) => setMovementDate(e.target.value)}
        className="w-full border rounded-xl px-4 py-3 bg-slate-50"
      />

      <div className="relative">
        <input
          value={aircraft}
          onChange={(e) => {
            setAircraft(e.target.value);
            setShowAircraftSuggestions(true);
          }}
          onFocus={() => setShowAircraftSuggestions(true)}
          onBlur={() =>
            setTimeout(() => setShowAircraftSuggestions(false), 200)
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
        onChange={(e) => setMovementType(e.target.value)}
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
  );
}
```

---

# components/RecordsPanel.jsx

```jsx
export default function RecordsPanel({
  paginatedHistory,
  deleteEntry,
  searchTerm,
  setSearchTerm,
  activeTab,
  setActiveTab,
  tuiAircraftTypes,
  totalPages,
  currentPage,
  setCurrentPage,
  typeFilteredHistory,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-4">

      <div className="flex flex-col gap-4 mb-4">

        <div className="flex justify-between items-center flex-wrap gap-3">
          <h2 className="text-2xl font-bold text-slate-800">
            Movement Records
          </h2>

          <div className="text-sm text-slate-500">
            {typeFilteredHistory.length} entries
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">

          <button
            onClick={() => {
              setActiveTab("ALL");
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-xl font-semibold ${
              activeTab === "ALL"
                ? "bg-blue-600 text-white"
                : "bg-slate-100"
            }`}
          >
            All
          </button>

          {tuiAircraftTypes.map((type) => (
            <button
              key={type}
              onClick={() => {
                setActiveTab(type);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-xl font-semibold ${
                activeTab === type
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100"
              }`}
            >
              {type}
            </button>
          ))}

        </div>

        <input
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search records..."
          className="w-full border rounded-xl px-4 py-3 bg-slate-50"
        />

      </div>

      <div className="space-y-3 max-h-[700px] overflow-y-auto">

        {paginatedHistory.map((item, index) => (
          <div
            key={`${item.aircraft}-${index}`}
            className="border rounded-xl p-4 bg-slate-50"
          >

            <div className="flex justify-between gap-3">

              <div>
                <div className="font-bold text-slate-800">
                  {item.aircraft}
                </div>

                <div className="text-sm text-blue-600 font-medium">
                  {item.movementType}
                </div>

                <div className="text-sm text-slate-500">
                  {item.date} • {item.time}
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm text-slate-500">
                  Stand Move
                </div>

                <div className="font-semibold">
                  {item.fromStand} → {item.toStand}
                </div>
              </div>

            </div>

            {item.notes && (
              <div className="mt-3 text-sm text-slate-700 bg-white rounded-lg p-3 border">
                {item.notes}
              </div>
            )}

            <button
              onClick={() => deleteEntry(index)}
              className="w-full mt-3 bg-red-500 text-white py-2 rounded-lg font-semibold"
            >
              Delete
            </button>

          </div>
        ))}

      </div>

      <div className="flex justify-center gap-2 mt-4 flex-wrap">

        <button
          onClick={() =>
            setCurrentPage((prev) => Math.max(prev - 1, 1))
          }
          className="px-4 py-2 rounded-xl border bg-white"
        >
          Previous
        </button>

        {Array.from(
          { length: totalPages },
          (_, i) => i + 1
        ).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-4 py-2 rounded-xl font-semibold ${
              currentPage === page
                ? "bg-blue-600 text-white"
                : "bg-white border"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() =>
            setCurrentPage((prev) =>
              Math.min(prev + 1, totalPages)
            )
          }
          className="px-4 py-2 rounded-xl border bg-white"
        >
          Next
        </button>

      </div>

    </div>
  );
}
```
