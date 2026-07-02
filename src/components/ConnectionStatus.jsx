import { useEffect, useState } from "react";
import PropTypes from "prop-types";

export default function ConnectionStatus({ lastSync }) {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  return (
    <div className={`rounded-xl border px-3 py-2 text-xs ${isOnline ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200" : "border-amber-500/40 bg-amber-500/10 text-amber-200"}`}>
      <p className="font-medium">{isOnline ? "Online" : "Offline"}</p>
      <p>Last Sync: {lastSync ? new Date(lastSync).toLocaleString() : "Not synced yet"}</p>
    </div>
  );
}

ConnectionStatus.propTypes = {
  lastSync: PropTypes.string,
};
