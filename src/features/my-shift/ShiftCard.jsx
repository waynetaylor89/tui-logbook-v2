import PropTypes from "prop-types";
import JobChecklist from "./JobChecklist.jsx";
import JobNotes from "./JobNotes.jsx";

export default function ShiftCard({
  job,
  onStart,
  onComplete,
  onPause,
  onReopen,
  onToggleChecklist,
  onAddNote,
  onRemoveNote,
  onUpdateField,
  onAcceptSuggestions,
}) {
  const actionClass =
    "min-h-12 rounded-xl px-3 py-3 text-sm font-semibold text-white";
  const inputClass =
    "min-h-11 w-full rounded-xl border border-slate-700 bg-slate-900/55 px-3 py-2 text-sm text-slate-100";
  const hasSuggestions = (job.suggestionMeta?.basedOnCount || 0) > 0;
  const confidenceLabel = `${Math.round((job.suggestionMeta?.confidence || 0) * 100)}%`;

  return (
    <article className="ops-panel rounded-2xl p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-slate-100">{job.flightNumber}</p>
          <p className="text-sm text-slate-300">{job.arrivalDeparture} • {job.origin} {" -> "} {job.destination}</p>
          <p className="text-xs text-slate-400">{job.registration} • {job.aircraftType}</p>
          <p className="mt-1 text-xs text-slate-400">STD {job.scheduledTime || "--:--"} • ETD/ETA {job.estimatedTime || "--:--"} • Stand {job.stand || "--"}</p>
        </div>
        <div className="rounded-full border border-slate-600 bg-slate-900/65 px-3 py-1 text-xs text-slate-200">
          {job.status}
        </div>
      </div>

      {hasSuggestions ? (
        <div className="mt-3 rounded-xl border border-cyan-400/35 bg-cyan-500/10 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-cyan-100">Based on previous jobs</p>
            <p className="text-xs text-cyan-200">Confidence {confidenceLabel}</p>
          </div>
          <p className="mt-1 text-xs text-cyan-200/90">{job.suggestionMeta?.basedOnCount} historical matches found.</p>
          {!job.suggestionAccepted ? (
            <button
              type="button"
              onClick={onAcceptSuggestions}
              className="mt-2 min-h-10 rounded-lg bg-cyan-600 px-3 py-2 text-xs font-semibold text-white hover:bg-cyan-500"
            >
              Accept Suggestions
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <label>
          <span className="mb-1 block text-[11px] uppercase tracking-[0.14em] text-slate-500">Arrival/Departure</span>
          <select className={inputClass} value={job.arrivalDeparture || "Departure"} onChange={(e) => onUpdateField("arrivalDeparture", e.target.value)}>
            <option value="Arrival">Arrival</option>
            <option value="Departure">Departure</option>
          </select>
        </label>
        <label>
          <span className="mb-1 block text-[11px] uppercase tracking-[0.14em] text-slate-500">Destination</span>
          <input className={inputClass} value={job.destination || ""} onChange={(e) => onUpdateField("destination", e.target.value)} />
        </label>
        <label>
          <span className="mb-1 block text-[11px] uppercase tracking-[0.14em] text-slate-500">Stand</span>
          <input className={inputClass} value={job.stand || ""} onChange={(e) => onUpdateField("stand", e.target.value.toUpperCase())} />
        </label>
        <label>
          <span className="mb-1 block text-[11px] uppercase tracking-[0.14em] text-slate-500">Registration</span>
          <input className={inputClass} value={job.registration || ""} onChange={(e) => onUpdateField("registration", e.target.value.toUpperCase())} />
        </label>
        <label>
          <span className="mb-1 block text-[11px] uppercase tracking-[0.14em] text-slate-500">Aircraft Type</span>
          <input className={inputClass} value={job.aircraftType || ""} onChange={(e) => onUpdateField("aircraftType", e.target.value)} />
        </label>
        <label>
          <span className="mb-1 block text-[11px] uppercase tracking-[0.14em] text-slate-500">Turnaround Time</span>
          <input className={inputClass} value={job.turnaroundTime || ""} onChange={(e) => onUpdateField("turnaroundTime", e.target.value)} placeholder="e.g. 45 min" />
        </label>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <button type="button" onClick={onStart} className={`${actionClass} bg-sky-600 hover:bg-sky-500`}>Start Job</button>
        <button type="button" onClick={onComplete} className={`${actionClass} bg-emerald-600 hover:bg-emerald-500`}>Complete Job</button>
        <button type="button" onClick={onPause} className={`${actionClass} bg-amber-600 hover:bg-amber-500`}>Pause Job</button>
        <button type="button" onClick={onReopen} className={`${actionClass} bg-slate-600 hover:bg-slate-500`}>Reopen Job</button>
      </div>

      <div className="mt-2 text-xs text-slate-400">
        Started: {job.startedAt || "--:--"} • Completed: {job.completedAt || "--:--"}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <JobChecklist checklist={job.checklist} onToggle={onToggleChecklist} />
        <JobNotes notes={job.notes} onAddNote={onAddNote} onRemoveNote={onRemoveNote} />
      </div>
    </article>
  );
}

ShiftCard.propTypes = {
  job: PropTypes.shape({
    id: PropTypes.string.isRequired,
    flightNumber: PropTypes.string.isRequired,
    arrivalDeparture: PropTypes.string.isRequired,
    origin: PropTypes.string.isRequired,
    destination: PropTypes.string.isRequired,
    registration: PropTypes.string.isRequired,
    aircraftType: PropTypes.string.isRequired,
    scheduledTime: PropTypes.string,
    estimatedTime: PropTypes.string,
    stand: PropTypes.string,
    status: PropTypes.string.isRequired,
    startedAt: PropTypes.string,
    completedAt: PropTypes.string,
    checklist: PropTypes.object,
    notes: PropTypes.array,
    turnaroundTime: PropTypes.string,
    suggestionAccepted: PropTypes.bool,
    suggestionMeta: PropTypes.shape({
      basedOnCount: PropTypes.number,
      confidence: PropTypes.number,
    }),
  }).isRequired,
  onStart: PropTypes.func.isRequired,
  onComplete: PropTypes.func.isRequired,
  onPause: PropTypes.func.isRequired,
  onReopen: PropTypes.func.isRequired,
  onToggleChecklist: PropTypes.func.isRequired,
  onAddNote: PropTypes.func.isRequired,
  onRemoveNote: PropTypes.func.isRequired,
  onUpdateField: PropTypes.func.isRequired,
  onAcceptSuggestions: PropTypes.func.isRequired,
};
