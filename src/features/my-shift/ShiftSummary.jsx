import PropTypes from "prop-types";

export default function ShiftSummary({ jobsStartedToday, jobsCompletedToday, currentActiveJob, shiftDuration }) {
  return (
    <section className="ops-panel rounded-2xl p-4 sm:p-5">
      <h3 className="text-lg font-semibold text-slate-100">Shift Summary</h3>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Jobs Started Today" value={jobsStartedToday} />
        <StatCard label="Jobs Completed Today" value={jobsCompletedToday} />
        <StatCard label="Current Active Job" value={currentActiveJob || "None"} />
        <StatCard label="Shift Duration" value={shiftDuration} />
      </div>
    </section>
  );
}

function StatCard({ label, value }) {
  return (
    <article className="rounded-xl border border-slate-700 bg-slate-900/55 p-3">
      <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-2 text-xl font-semibold text-slate-100 sm:text-2xl">{value}</p>
    </article>
  );
}

ShiftSummary.propTypes = {
  jobsStartedToday: PropTypes.number.isRequired,
  jobsCompletedToday: PropTypes.number.isRequired,
  currentActiveJob: PropTypes.string,
  shiftDuration: PropTypes.string.isRequired,
};

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};
