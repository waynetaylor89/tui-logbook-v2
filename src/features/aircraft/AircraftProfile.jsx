import PropTypes from "prop-types";
import AircraftPhoto from "./AircraftPhoto.jsx";
import AircraftStatistics from "./AircraftStatistics.jsx";
import AircraftHistory from "./AircraftHistory.jsx";
import AircraftTimeline from "./AircraftTimeline.jsx";

export default function AircraftProfile({ profile }) {
  return (
    <article className="ops-panel overflow-hidden rounded-2xl p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Aircraft Profile</p>
          <h3 className="mt-1 text-xl font-semibold text-slate-100">{profile.registration || "Unknown"}</h3>
          <p className="text-sm text-slate-300">{profile.aircraftType || "Type not set"}</p>
        </div>
        <span className="rounded-full border border-slate-600 bg-slate-900/60 px-3 py-1 text-xs text-slate-200">
          {profile.status || "Active"}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <AircraftPhoto registration={profile.registration} aircraftType={profile.aircraftType} />
        <AircraftStatistics profile={profile} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <AircraftHistory recentFlights={profile.recentFlights || []} />
        <AircraftTimeline timeline={profile.timeline || []} />
      </div>
    </article>
  );
}

AircraftProfile.propTypes = {
  profile: PropTypes.object.isRequired,
};
