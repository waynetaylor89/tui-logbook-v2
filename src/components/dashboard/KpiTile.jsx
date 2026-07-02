import PropTypes from "prop-types";

export default function KpiTile({ label, value, detail, icon, tone = "sky" }) {
  const toneMap = {
    sky: "from-sky-500/25 via-sky-500/10 to-transparent border-sky-400/40",
    emerald: "from-emerald-500/25 via-emerald-500/10 to-transparent border-emerald-400/40",
    amber: "from-amber-500/25 via-amber-500/10 to-transparent border-amber-400/40",
    rose: "from-rose-500/25 via-rose-500/10 to-transparent border-rose-400/40",
  };

  return (
    <article className={`rounded-2xl border bg-gradient-to-br p-4 sm:p-5 ${toneMap[tone] || toneMap.sky}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-50">{value}</p>
          {detail ? <p className="mt-1 text-xs text-slate-300">{detail}</p> : null}
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-slate-900/50 text-xl">{icon}</div>
      </div>
    </article>
  );
}

KpiTile.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  detail: PropTypes.string,
  icon: PropTypes.node,
  tone: PropTypes.oneOf(["sky", "emerald", "amber", "rose"]),
};
