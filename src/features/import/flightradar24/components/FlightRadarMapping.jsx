import PropTypes from "prop-types";

export default function FlightRadarMapping({ provider, sourceFormat, detectedFlightRadar, detectionConfidence, mappedColumns }) {
  return (
    <section className="ops-panel rounded-2xl p-4 sm:p-5">
      <h3 className="mb-3 text-lg font-semibold text-slate-100">Auto Detection & Mapping</h3>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <InfoTile label="Provider" value={provider || "Generic"} />
        <InfoTile label="Format" value={(sourceFormat || "").toUpperCase() || "Unknown"} />
        <InfoTile label="FlightRadar24" value={detectedFlightRadar ? "Detected" : "Not detected"} />
        <InfoTile label="Confidence" value={`${Math.round((detectionConfidence || 0) * 100)}%`} />
      </div>

      <div className="mt-3 rounded-xl border border-slate-700 bg-slate-900/50 p-3">
        <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Mapped Columns</p>
        {mappedColumns?.length ? (
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {mappedColumns.map((item) => (
              <p key={`${item.source}-${item.target}`} className="rounded-lg border border-slate-700 bg-slate-950/60 px-2 py-1 text-xs text-slate-200">
                {item.source} {"->"} {item.target}
              </p>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-xs text-slate-400">No mapped columns detected yet.</p>
        )}
      </div>
    </section>
  );
}

function InfoTile({ label, value }) {
  return (
    <article className="rounded-xl border border-slate-700 bg-slate-900/60 p-3">
      <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-100">{value}</p>
    </article>
  );
}

FlightRadarMapping.propTypes = {
  provider: PropTypes.string,
  sourceFormat: PropTypes.string,
  detectedFlightRadar: PropTypes.bool,
  detectionConfidence: PropTypes.number,
  mappedColumns: PropTypes.arrayOf(
    PropTypes.shape({
      source: PropTypes.string,
      target: PropTypes.string,
    })
  ),
};

InfoTile.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};
