import { useState } from "react";
import PropTypes from "prop-types";

export default function JobNotes({ notes, onAddNote, onRemoveNote }) {
  const [draft, setDraft] = useState("");

  const submit = () => {
    const text = draft.trim();
    if (!text) return;
    onAddNote(text);
    setDraft("");
  };

  return (
    <section>
      <h4 className="text-sm font-semibold text-slate-200">Notes</h4>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Add operational note"
          className="min-h-12 w-full rounded-xl border border-slate-700 bg-slate-900/55 px-3 py-3 text-sm text-slate-100 placeholder:text-slate-500"
        />
        <button
          type="button"
          onClick={submit}
          className="min-h-12 rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white hover:bg-sky-500"
        >
          Add Note
        </button>
      </div>

      <ul className="mt-3 space-y-2">
        {(notes || []).map((note) => (
          <li key={note.id} className="rounded-xl border border-slate-700 bg-slate-900/55 p-3 text-sm text-slate-200">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p>{note.text}</p>
                <p className="mt-1 text-xs text-slate-500">{note.createdAtLabel}</p>
              </div>
              <button
                type="button"
                onClick={() => onRemoveNote(note.id)}
                className="min-h-10 rounded-lg border border-rose-500/50 bg-rose-500/15 px-3 text-xs font-semibold text-rose-200"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

JobNotes.propTypes = {
  notes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired,
      createdAtLabel: PropTypes.string.isRequired,
    })
  ),
  onAddNote: PropTypes.func.isRequired,
  onRemoveNote: PropTypes.func.isRequired,
};
