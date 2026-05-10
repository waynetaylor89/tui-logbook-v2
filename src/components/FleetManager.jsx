export default function FleetManager({
  newReg,
  setNewReg,
  newType,
  setNewType,
  tuiAircraftTypes,
  addAircraftToFleet,
  resetFleet,
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

      <button
        onClick={resetFleet}
        className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold"
      >
        Reset Fleet to Default
      </button>

    </div>
  );
}