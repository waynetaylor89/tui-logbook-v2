import { useMemo } from "react";
import PropTypes from "prop-types";
import ShiftCard from "./ShiftCard.jsx";
import ShiftSummary from "./ShiftSummary.jsx";

export default function MyShift({
  jobs,
  isLoading,
  error,
  onRetry,
  onStartJob,
  onCompleteJob,
  onPauseJob,
  onReopenJob,
  onToggleChecklist,
  onAddNote,
  onRemoveNote,
  onUpdateField,
  onAcceptSuggestions,
}) {
  const summary = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const jobsStartedToday = jobs.filter((job) => (job.startedAt || "").startsWith(today)).length;
    const jobsCompletedToday = jobs.filter((job) => (job.completedAt || "").startsWith(today)).length;
    const active = jobs.find((job) => job.status === "In Progress");

    const sorted = jobs
      .map((job) => ({
        ...job,
        startedAtMs: job.startedAt ? new Date(job.startedAt).getTime() : null,
      }))
      .filter((job) => Number.isFinite(job.startedAtMs));

    let shiftDuration = "0h 0m";
    if (sorted.length > 0) {
      const first = Math.min(...sorted.map((job) => job.startedAtMs));
      const diffMinutes = Math.max(Math.floor((Date.now() - first) / 60000), 0);
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      shiftDuration = `${hours}h ${minutes}m`;
    }

    return {
      jobsStartedToday,
      jobsCompletedToday,
      currentActiveJob: active?.flightNumber || "None",
      shiftDuration,
    };
  }, [jobs]);

  if (isLoading) {
    return (
      <section className="ops-panel rounded-2xl p-6 text-center text-slate-300">
        Loading My Shift...
      </section>
    );
  }

  if (error) {
    return (
      <section className="ops-panel rounded-2xl border border-rose-500/40 bg-rose-500/10 p-6 text-center">
        <p className="text-sm text-rose-200">{error}</p>
        <button type="button" onClick={onRetry} className="mt-3 min-h-12 rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white">
          Retry
        </button>
      </section>
    );
  }

  if (jobs.length === 0) {
    return (
      <section className="ops-panel rounded-2xl p-6 text-center text-slate-300">
        <h3 className="text-lg font-semibold text-slate-100">No claimed flights yet</h3>
        <p className="mt-2 text-sm text-slate-400">Claim a flight from the Flight Board to automatically create a shift job.</p>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      <ShiftSummary
        jobsStartedToday={summary.jobsStartedToday}
        jobsCompletedToday={summary.jobsCompletedToday}
        currentActiveJob={summary.currentActiveJob}
        shiftDuration={summary.shiftDuration}
      />

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {jobs.map((job) => (
          <ShiftCard
            key={job.id}
            job={job}
            onStart={() => onStartJob(job.id)}
            onComplete={() => onCompleteJob(job.id)}
            onPause={() => onPauseJob(job.id)}
            onReopen={() => onReopenJob(job.id)}
            onToggleChecklist={(key) => onToggleChecklist(job.id, key)}
            onAddNote={(text) => onAddNote(job.id, text)}
            onRemoveNote={(noteId) => onRemoveNote(job.id, noteId)}
            onUpdateField={(field, value) => onUpdateField(job.id, field, value)}
            onAcceptSuggestions={() => onAcceptSuggestions(job.id)}
          />
        ))}
      </section>
    </div>
  );
}

MyShift.propTypes = {
  jobs: PropTypes.arrayOf(PropTypes.object).isRequired,
  isLoading: PropTypes.bool,
  error: PropTypes.string,
  onRetry: PropTypes.func.isRequired,
  onStartJob: PropTypes.func.isRequired,
  onCompleteJob: PropTypes.func.isRequired,
  onPauseJob: PropTypes.func.isRequired,
  onReopenJob: PropTypes.func.isRequired,
  onToggleChecklist: PropTypes.func.isRequired,
  onAddNote: PropTypes.func.isRequired,
  onRemoveNote: PropTypes.func.isRequired,
  onUpdateField: PropTypes.func.isRequired,
  onAcceptSuggestions: PropTypes.func.isRequired,
};
