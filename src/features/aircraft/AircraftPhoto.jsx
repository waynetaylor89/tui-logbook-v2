import PropTypes from "prop-types";

export default function AircraftPhoto({ registration, aircraftType }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-700 bg-gradient-to-br from-sky-500/20 via-cyan-500/10 to-slate-900/60 p-4">
      <div className="pointer-events-none absolute -right-10 -top-8 h-24 w-24 rounded-full bg-cyan-300/20 blur-2xl" />
      <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Aircraft Photo</p>
      <div className="mt-3 grid min-h-28 place-items-center rounded-xl border border-dashed border-slate-600 bg-slate-950/35">
        <div className="text-center">
          <p className="text-2xl text-slate-200">✈</p>
          <p className="mt-1 text-xs text-slate-400">{registration || "Unknown"}</p>
          <p className="text-xs text-slate-500">{aircraftType || "Type not set"}</p>
        </div>
      </div>
    </div>
  );
}

AircraftPhoto.propTypes = {
  registration: PropTypes.string,
  aircraftType: PropTypes.string,
};
