import PropTypes from "prop-types";
import { Link } from "react-router-dom";

export default function OpsQuickActionCard({ label, description, to, onClick, icon }) {
  const className =
    "group flex min-h-24 w-full items-center justify-between rounded-2xl border border-slate-700 bg-slate-900/55 px-4 py-4 text-left transition hover:border-sky-400/45 hover:bg-slate-900/85";

  const content = (
    <>
      <div>
        <p className="text-base font-semibold text-slate-100">{label}</p>
        <p className="mt-1 text-sm text-slate-400">{description}</p>
      </div>
      <div className="grid h-12 w-12 place-items-center rounded-xl bg-slate-800 text-xl text-slate-200 group-hover:bg-sky-500/25">
        {icon}
      </div>
    </>
  );

  if (to) {
    return (
      <Link to={to} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}

OpsQuickActionCard.propTypes = {
  label: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  to: PropTypes.string,
  onClick: PropTypes.func,
  icon: PropTypes.node,
};
