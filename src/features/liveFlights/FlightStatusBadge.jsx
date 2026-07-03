import PropTypes from "prop-types";

const tones = {
  completed: "border-emerald-500/45 bg-emerald-500/15 text-emerald-200",
  delayed: "border-amber-500/45 bg-amber-500/15 text-amber-200",
  cancelled: "border-rose-500/45 bg-rose-500/15 text-rose-200",
  active: "border-sky-500/45 bg-sky-500/15 text-sky-200",
  default: "border-slate-600 bg-slate-700/50 text-slate-200",
};

export default function FlightStatusBadge({ status }) {
  const value = String(status || "Scheduled").trim();
  const normalized = value.toLowerCase();

  let tone = tones.default;
  if (/delay/.test(normalized)) tone = tones.delayed;
  else if (/cancel/.test(normalized)) tone = tones.cancelled;
  else if (/(landed|arriv|departed|complete|closed)/.test(normalized)) tone = tones.completed;
  else if (/(active|board|sched|gate|final call)/.test(normalized)) tone = tones.active;

  return <span className={`rounded-full border px-2 py-1 text-[11px] font-medium ${tone}`}>{value}</span>;
}

FlightStatusBadge.propTypes = {
  status: PropTypes.string,
};
