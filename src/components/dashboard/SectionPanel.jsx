import PropTypes from "prop-types";

export default function SectionPanel({ title, subtitle, rightContent, children, className = "" }) {
  return (
    <section className={`ops-panel rounded-2xl p-4 sm:p-5 ${className}`}>
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-semibold tracking-tight text-slate-100">{title}</h3>
          {subtitle ? <p className="mt-1 text-xs sm:text-sm text-slate-400">{subtitle}</p> : null}
        </div>
        {rightContent ? <div className="shrink-0">{rightContent}</div> : null}
      </header>
      {children}
    </section>
  );
}

SectionPanel.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  rightContent: PropTypes.node,
  children: PropTypes.node,
  className: PropTypes.string,
};
