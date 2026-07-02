import PropTypes from "prop-types";

export default function AirlineBadge({ airline }) {
  const value = airline || "Unknown Airline";
  return (
    <span className="inline-flex min-h-7 items-center rounded-full border border-sky-500/40 bg-sky-500/10 px-2 py-1 text-[11px] font-medium text-sky-200">
      {value}
    </span>
  );
}

AirlineBadge.propTypes = {
  airline: PropTypes.string,
};
