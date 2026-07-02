import PropTypes from "prop-types";

export default function RefreshButton({ refreshing, onRefresh }) {
  return (
    <button
      type="button"
      onClick={onRefresh}
      disabled={refreshing}
      className="min-h-11 rounded-xl border border-cyan-400/50 bg-cyan-500/15 px-4 py-2 text-sm font-semibold text-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {refreshing ? "Refreshing..." : "Refresh Flights"}
    </button>
  );
}

RefreshButton.propTypes = {
  refreshing: PropTypes.bool,
  onRefresh: PropTypes.func.isRequired,
};
