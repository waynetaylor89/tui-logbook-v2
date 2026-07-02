import PropTypes from "prop-types";

const CHECKLIST_FIELDS = [
  ["marshall", "Marshall"],
  ["chocksOn", "Chocks On"],
  ["conesPlaced", "Cones Placed"],
  ["gpuConnected", "GPU Connected"],
  ["beltLoader", "Belt Loader"],
  ["bagsUnloaded", "Bags Unloaded"],
  ["bagsLoaded", "Bags Loaded"],
  ["refuel", "Refuel"],
  ["waterService", "Water Service"],
  ["toiletService", "Toilet Service"],
  ["catering", "Catering"],
  ["cleaning", "Cleaning"],
  ["prm", "PRM"],
  ["pushback", "Pushback"],
  ["walkaroundComplete", "Walkaround Complete"],
  ["headsetConnected", "Headset Connected"],
  ["doorsClosed", "Doors Closed"],
];

export default function JobChecklist({ checklist, onToggle }) {
  return (
    <section>
      <h4 className="text-sm font-semibold text-slate-200">Checklist</h4>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {CHECKLIST_FIELDS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => onToggle(key)}
            className={`min-h-12 rounded-xl border px-3 py-3 text-left text-sm ${checklist?.[key] ? "border-emerald-400/50 bg-emerald-500/15 text-emerald-100" : "border-slate-700 bg-slate-900/55 text-slate-200"}`}
          >
            <span className="mr-2 inline-block text-base">{checklist?.[key] ? "☑" : "□"}</span>
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}

JobChecklist.propTypes = {
  checklist: PropTypes.object,
  onToggle: PropTypes.func.isRequired,
};
