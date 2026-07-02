import PropTypes from "prop-types";

export default function OfflineIndicator({ fromCache, cachedFlights, lastSync }) {
  if (!fromCache) return null;

  return (
    <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
      <p className="font-medium">Cached Flights</p>
      <p>{cachedFlights} available offline</p>
      <p>Last Sync: {lastSync ? new Date(lastSync).toLocaleString() : "Unknown"}</p>
    </div>
  );
}

OfflineIndicator.propTypes = {
  fromCache: PropTypes.bool,
  cachedFlights: PropTypes.number,
  lastSync: PropTypes.string,
};
