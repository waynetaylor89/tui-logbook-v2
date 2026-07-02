import PropTypes from "prop-types";

const delayCodes = ["", "WX", "ATC", "MX", "CREW", "RAMP", "SEC"];

export default function MyShiftPanel({
  shiftJobs,
  onStartJob,
  onCompleteJob,
  onRemoveJob,
  onUpdateJob,
}) {
  return (
    <section className="ops-panel rounded-2xl p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-100">My Shift</h3>
          <p className="text-xs text-slate-400">Selected flights moved here for execution.</p>
        </div>
        <div className="ops-pill rounded-xl px-3 py-1.5 text-xs text-slate-300">{shiftJobs.length} jobs</div>
      </div>

      {shiftJobs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-700 p-6 text-center text-sm text-slate-400">
          No jobs in My Shift yet. Select flights from Flight Board to add them.
        </div>
      ) : (
        <div className="space-y-3">
          {shiftJobs.map((job) => (
            <ShiftJobCard
              key={job.id}
              job={job}
              onStartJob={onStartJob}
              onCompleteJob={onCompleteJob}
              onRemoveJob={onRemoveJob}
              onUpdateJob={onUpdateJob}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ShiftJobCard({ job, onStartJob, onCompleteJob, onRemoveJob, onUpdateJob }) {
  const inputClass =
    "w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-400/50 focus:outline-none";

  const stateTone = {
    Queued: "text-amber-200 border-amber-400/40 bg-amber-500/15",
    "In Progress": "text-sky-200 border-sky-400/40 bg-sky-500/15",
    Completed: "text-emerald-200 border-emerald-400/40 bg-emerald-500/15",
  };

  const updateField = (field, value) => {
    onUpdateJob(job.id, { [field]: value });
  };

  return (
    <article className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-slate-100">{job.flightNumber}</p>
          <p className="text-xs text-slate-400">{job.aircraftRegistration} • {job.aircraftType}</p>
          <p className="mt-1 text-xs text-slate-300">
            {job.movement} • {job.origin} {" -> "} {job.destination}
          </p>
        </div>
        <span className={`rounded-full border px-2 py-1 text-[11px] font-medium ${stateTone[job.jobState] || "text-slate-200 border-slate-600 bg-slate-700/50"}`}>
          {job.jobState}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-[11px] uppercase tracking-[0.14em] text-slate-500">Stand</label>
          <input
            className={inputClass}
            value={job.stand}
            onChange={(event) => updateField("stand", event.target.value.toUpperCase())}
          />
        </div>

        <div>
          <label className="mb-1 block text-[11px] uppercase tracking-[0.14em] text-slate-500">Delay Code</label>
          <select
            className={inputClass}
            value={job.delayCode}
            onChange={(event) => updateField("delayCode", event.target.value)}
          >
            {delayCodes.map((code) => (
              <option key={code || "none"} value={code}>
                {code || "None"}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-[11px] uppercase tracking-[0.14em] text-slate-500">Pushback Time</label>
          <input
            type="time"
            className={inputClass}
            value={job.pushbackTime}
            onChange={(event) => updateField("pushbackTime", event.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-[11px] uppercase tracking-[0.14em] text-slate-500">Marshall Time</label>
          <input
            type="time"
            className={inputClass}
            value={job.marshallTime}
            onChange={(event) => updateField("marshallTime", event.target.value)}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-[11px] uppercase tracking-[0.14em] text-slate-500">Notes</label>
          <textarea
            rows={2}
            className={`${inputClass} resize-none`}
            placeholder="Ramp notes, handover details, restrictions"
            value={job.notes}
            onChange={(event) => updateField("notes", event.target.value)}
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
        <span>Scheduled: {job.scheduledTime}</span>
        <span>•</span>
        <span>Start: {job.startedAt || "--:--"}</span>
        <span>•</span>
        <span>Complete: {job.completedAt || "--:--"}</span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => onStartJob(job.id)}
          disabled={job.jobState === "Completed"}
          className="rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-700"
        >
          Start
        </button>
        <button
          type="button"
          onClick={() => onCompleteJob(job.id)}
          className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white"
        >
          Complete
        </button>
        <button
          type="button"
          onClick={() => onRemoveJob(job.id)}
          className="rounded-lg bg-rose-700 px-3 py-2 text-sm font-medium text-white"
        >
          Remove
        </button>
      </div>
    </article>
  );
}

MyShiftPanel.propTypes = {
  shiftJobs: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    flightNumber: PropTypes.string.isRequired,
    aircraftRegistration: PropTypes.string.isRequired,
    aircraftType: PropTypes.string.isRequired,
    movement: PropTypes.string.isRequired,
    origin: PropTypes.string.isRequired,
    destination: PropTypes.string.isRequired,
    scheduledTime: PropTypes.string.isRequired,
    stand: PropTypes.string.isRequired,
    delayCode: PropTypes.string,
    pushbackTime: PropTypes.string,
    marshallTime: PropTypes.string,
    notes: PropTypes.string,
    startedAt: PropTypes.string,
    completedAt: PropTypes.string,
    jobState: PropTypes.string,
  })).isRequired,
  onStartJob: PropTypes.func.isRequired,
  onCompleteJob: PropTypes.func.isRequired,
  onRemoveJob: PropTypes.func.isRequired,
  onUpdateJob: PropTypes.func.isRequired,
};
