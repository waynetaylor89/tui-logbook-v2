import PropTypes from "prop-types";

export default function AircraftTimeline({ timeline }) {
  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900/55 p-4">
      <h4 className="text-sm font-semibold text-slate-200">Timeline</h4>
      <ol className="mt-3 space-y-3">
        {(timeline || []).map((item) => (
          <li key={item.id} className="relative rounded-xl border border-slate-700 bg-slate-950/45 p-3 pl-4">
            <span className="absolute left-1 top-4 h-2 w-2 rounded-full bg-cyan-300" />
            <p className="text-xs text-slate-400">{item.at}</p>
            <p className="mt-1 text-sm text-slate-200">{item.label}</p>
          </li>
        ))}
        {(timeline || []).length === 0 ? (
          <li className="rounded-xl border border-dashed border-slate-700 p-3 text-sm text-slate-400">
            No timeline events yet.
          </li>
        ) : null}
      </ol>
    </section>
  );
}

AircraftTimeline.propTypes = {
  timeline: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    at: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  })),
};
