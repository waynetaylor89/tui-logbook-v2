import PropTypes from "prop-types";

export default function DailyImportButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500"
    >
      Import Today's Flights
    </button>
  );
}

DailyImportButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};
