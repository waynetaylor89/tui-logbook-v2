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
  const inputClass =
    "w-full rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-sky-400/60 focus:outline-none";

  return (
    <div className="ops-panel rounded-2xl p-4 space-y-4">

      <h2 className="text-xl font-semibold text-slate-100">
        New Movement
      </h2>

      <input
        type="date"
        value={movementDate}
        onChange={(e) => setMovementDate(e.target.value)}
        className={inputClass}
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
          className={inputClass}
        />

        {showAircraftSuggestions && (
          <div className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 shadow-lg">

            {filteredAircraftOptions.map((plane) => (
              <button
                key={plane}
                type="button"
                onMouseDown={() => {
                  setAircraft(plane);
                  setShowAircraftSuggestions(false);
                }}
                className="w-full px-4 py-3 text-left text-slate-100 hover:bg-slate-800"
              >
                {plane}
              </button>
            ))}

          </div>
        )}

      </div>

      {showWarning && (
        <div className="rounded-2xl border border-orange-300 bg-orange-50 dark:bg-orange-900/30 dark:border-orange-700 px-4 py-3 text-sm text-orange-800 dark:text-orange-300">
          Warning: Boeing 787-800 selected — See engineer for pins.
        </div>
      )}

      {successMessage && (
        <div className="rounded-2xl border border-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 dark:border-emerald-700 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-300 flex items-center justify-between gap-3">
          <span>{successMessage}</span>
          <button
            type="button"
            onClick={clearSuccessMessage}
            className="text-emerald-700 dark:text-emerald-400 font-semibold hover:text-emerald-900 dark:hover:text-emerald-300"
          >
            Dismiss
          </button>
        </div>
      )}

      <select
        value={movementType}
        onChange={(e) => setMovementType(e.target.value)}
        className={inputClass}
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
        className={inputClass}
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
        className={inputClass}
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
        className={`${inputClass} resize-none`}
      />

      <button
        onClick={addLogEntry}
        className="w-full rounded-xl border border-sky-400/50 bg-gradient-to-r from-sky-500 to-cyan-500 py-3 font-semibold text-slate-950 hover:brightness-110"
      >
        Add Movement
      </button>

    </div>
  );
}