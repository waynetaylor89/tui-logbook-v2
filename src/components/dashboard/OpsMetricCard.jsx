import PropTypes from "prop-types";

const toneMap = {
  sky: "from-sky-500/25 via-sky-500/10 to-transparent border-sky-400/35",
  emerald: "from-emerald-500/25 via-emerald-500/10 to-transparent border-emerald-400/35",
  amber: "from-amber-500/25 via-amber-500/10 to-transparent border-amber-400/35",
  rose: "from-rose-500/25 via-rose-500/10 to-transparent border-rose-400/35",
  cyan: "from-cyan-500/25 via-cyan-500/10 to-transparent border-cyan-400/35",
};

export default function OpsMetricCard({ title, value, detail, icon, tone = "sky" }) {
  return (
    <article className={`rounded-2xl border bg-gradient-to-br p-4 sm:p-5 ${toneMap[tone] || toneMap.sky}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-50 sm:text-4xl">{value}</p>
          {detail ? <p className="mt-2 text-sm text-slate-300">{detail}</p> : null}
        </div>
        {icon ? <div className="grid h-12 w-12 place-items-center rounded-xl bg-slate-900/60 text-xl">{icon}</div> : null}
      </div>
    </article>
  );
}

OpsMetricCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  detail: PropTypes.string,
  icon: PropTypes.node,
  tone: PropTypes.oneOf(["sky", "emerald", "amber", "rose", "cyan"]),
};
