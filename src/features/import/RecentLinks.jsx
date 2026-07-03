import PropTypes from "prop-types";

export default function RecentLinks({ items, onReuse, onDelete, onClear }) {
  return (
    <section className="mt-4 rounded-xl border border-slate-700 bg-slate-900/55 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-slate-100">Recent Imports</p>
        <button
          type="button"
          onClick={onClear}
          className="rounded-lg border border-slate-600 px-2.5 py-1 text-xs text-slate-300"
        >
          Clear History
        </button>
      </div>

      {!items.length ? (
        <p className="mt-2 text-xs text-slate-400">No recent links yet.</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {items.map((item) => (
            <li key={item.id} className="rounded-lg border border-slate-700 bg-slate-950/50 p-2 text-xs text-slate-300">
              <p className="truncate text-slate-200">{item.url}</p>
              <p className="mt-1 text-slate-500">
                {item.provider} • {item.status} • {formatTime(item.importedAt)}
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => onReuse(item)}
                  className="min-h-10 rounded-lg border border-slate-600 px-2.5 py-1 text-xs text-slate-200"
                >
                  Reuse
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(item.id)}
                  className="min-h-10 rounded-lg border border-rose-400/40 px-2.5 py-1 text-xs text-rose-200"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

RecentLinks.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    provider: PropTypes.string,
    status: PropTypes.string,
    importedAt: PropTypes.string,
  })).isRequired,
  onReuse: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
};

function formatTime(value) {
  if (!value) return "Unknown time";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown time";
  return date.toLocaleString();
}
