import MovementForm from "../components/MovementForm.jsx";

export default function MovementsPage({
  isAdmin,
  allHistoryLength,
  currentUserHistoryLength,
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
  handleAddLogEntry,
  successMessage,
  clearSuccessMessage,
}) {
  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              ✈️ Aircraft Movements
            </h2>
            <div className="text-sm text-slate-500 dark:text-slate-400">Log new movements here.</div>
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {isAdmin ? allHistoryLength : currentUserHistoryLength} records total
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
        addLogEntry={handleAddLogEntry}
        successMessage={successMessage}
        clearSuccessMessage={clearSuccessMessage}
      />
    </div>
  );
}
