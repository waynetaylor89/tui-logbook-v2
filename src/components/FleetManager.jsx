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
    <div className="space-y-4 rounded-2xl border border-slate-700 bg-slate-950/50 p-4">

      <h2 className="text-xl font-semibold text-slate-100">
        Fleet Manager
      </h2>

      <input
        value={newReg}
        onChange={(e) =>
          setNewReg(e.target.value.toUpperCase())
        }
        placeholder="Aircraft Registration"
        className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-slate-100 placeholder:text-slate-500"
      />

      <select
        value={newType}
        onChange={(e) => setNewType(e.target.value)}
        className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-slate-100"
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
        className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white"
      >
        Add Aircraft
      </button>

      <button
        onClick={resetFleet}
        className="w-full rounded-xl bg-rose-700 py-3 font-semibold text-white"
      >
        Reset Fleet to Default
      </button>

    </div>
  );
}