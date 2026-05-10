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
  successMessage,
  clearSuccessMessage,
}) {
  const normalizedAircraft = aircraft.toLowerCase();
  const showWarning = /787-8|787-800|boeing 787-800/i.test(normalizedAircraft);

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

      {showWarning && (
        <div className="rounded-2xl border border-orange-300 bg-orange-50 px-4 py-3 text-sm text-orange-800">
          Warning: Boeing 787-800 selected — See engineer for pins.
        </div>
      )}

      {successMessage && (
        <div className="rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 flex items-center justify-between gap-3">
          <span>{successMessage}</span>
          <button
            type="button"
            onClick={clearSuccessMessage}
            className="text-emerald-700 font-semibold hover:text-emerald-900"
          >
            Dismiss
          </button>
        </div>
      )}

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

    </div>
  );
}