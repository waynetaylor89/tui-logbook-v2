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
    return savedFleet
      ? JSON.parse(savedFleet)
      : initialFleet;
  });

  const [history, setHistory] = useState(() => {
    const savedHistory = localStorage.getItem("aircraft-logbook-history");
    return savedHistory ? JSON.parse(savedHistory) : [];
  });

  const [airport, setAirport] = useState("MAN");
  const [aircraft, setAircraft] = useState("");
  const [movementType, setMovementType] = useState("Tow");
  const [fromStand, setFromStand] = useState("");
  const [toStand, setToStand] = useState("");
  const [notes, setNotes] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAircraftSuggestions, setShowAircraftSuggestions] = useState(false);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);

  const [movementDate, setMovementDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  const [newReg, setNewReg] = useState("");
  const [newType, setNewType] = useState("");

  const [editingIndex, setEditingIndex] = useState(null);
  const [editingData, setEditingData] = useState(null);

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

  const filteredAircraftSuggestions = useMemo(() => {
    if (!searchTerm.trim()) return [];

    return fleet
      .filter((plane) =>
        plane.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, 8);
  }, [searchTerm, fleet]);

  const filteredHistory = useMemo(() => {
    return history.filter((entry) => {
      const searchable = `
        ${entry.aircraft}
        ${entry.fromStand}
        ${entry.toStand}
        ${entry.airport}
        ${entry.movementType}
        ${entry.notes}
      `;

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

  const monthlyMovements = useMemo(() => {
    const monthly = {};

    history.forEach((entry) => {
      const month = entry.date.split("/").slice(1).join("/");
      monthly[month] = (monthly[month] || 0) + 1;
    });

    return Object.entries(monthly).slice(-6);
  }, [history]);

  const addAircraftToFleet = () => {
    if (!newReg || !newType) {
      alert("Please enter both registration and aircraft type.");
      return;
    }

    const formattedAircraft = `${newReg.toUpperCase()} - ${newType}`;

    setFleet(
      [...new Set([...fleet, formattedAircraft])].sort()
    );

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

    setHistory(
      [entry, ...history].sort(
        (a, b) =>
          new Date(`${b.date} ${b.time}`) -
          new Date(`${a.date} ${a.time}`)
      )
    );

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

  return (
    <div className="min-h-screen bg-sky-200">
      <div className="min-h-screen bg-sky-100 p-2 sm:p-4 lg:p-6">

        <div className="max-w-7xl mx-auto space-y-4">

          {/* Sticky Header */}
          <div className="sticky top-0 z-40 bg-sky-100 pb-2">
            <div className="bg-white rounded-2xl shadow-lg p-3 flex flex-wrap gap-2 justify-between items-center">

              <div className="flex gap-2 flex-wrap">
                {airports.map((code) => (
                  <button
                    key={code}
                    onClick={() => setAirport(code)}
                    className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
                      airport === code
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {code}
                  </button>
                ))}
              </div>

              <div className="text-sm text-slate-600 font-medium">
                {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

            <div className="bg-white rounded-2xl shadow-lg p-4">
              <div className="text-sm text-slate-500 mb-1">
                Total Movements
              </div>

              <div className="text-3xl font-bold text-blue-600">
                {stats.totalMovements}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-4">
              <div className="text-sm text-slate-500 mb-2">
                Top Aircraft
              </div>

              <div className="space-y-1 text-sm">
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
              <div className="text-sm text-slate-500 mb-2">
                Most Used Stands
              </div>

              <div className="space-y-1 text-sm">
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
          </div>{/* ADD THESE STATES WITH YOUR OTHER useState DECLARATIONS */}

const [currentPage, setCurrentPage] = useState(1);

const recordsPerPage = 10;


{/* ADD THIS BELOW filteredHistory */}

const totalPages = Math.ceil(
  filteredHistory.length / recordsPerPage
);

const paginatedHistory = filteredHistory.slice(
  (currentPage - 1) * recordsPerPage,
  currentPage * recordsPerPage
);


{/* REPLACE YOUR CURRENT STICKY HEADER WITH THIS */}

<div className="sticky top-0 z-50 bg-sky-100 pb-3">

  <div className="bg-white rounded-2xl shadow-lg p-3 flex flex-col gap-3">

    <div className="flex justify-between items-center">

      <div>
        <h1 className="text-xl font-bold text-slate-800">
          TUI Aircraft Logbook
        </h1>

        <div className="text-sm text-slate-500">
          {fleet.length} aircraft loaded
        </div>
      </div>

      <div className="text-sm font-medium text-slate-600">
        {new Date().toLocaleTimeString()}
      </div>

    </div>

    <div className="flex gap-2 flex-wrap">

      {airports.map((code) => (
        <button
          key={code}
          onClick={() => setAirport(code)}
          className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
            airport === code
              ? "bg-blue-600 text-white"
              : "bg-slate-100 text-slate-700"
          }`}
        >
          {code}
        </button>
      ))}

    </div>

  </div>

</div>


{/* REPLACE THIS */}

filteredHistory.map((item, index) => (


{/* WITH THIS */}

paginatedHistory.map((item, index) => (


{/* ADD THIS BELOW THE MOVEMENT RECORDS SECTION */}

<div className="flex justify-center items-center gap-2 mt-4 flex-wrap">

  <button
    onClick={() =>
      setCurrentPage((prev) =>
        Math.max(prev - 1, 1)
      )
    }
    className="bg-white border px-4 py-2 rounded-xl shadow-sm text-sm font-semibold"
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
      className={`px-4 py-2 rounded-xl text-sm font-semibold ${
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
    className="bg-white border px-4 py-2 rounded-xl shadow-sm text-sm font-semibold"
  >
    Next
  </button>

</div>