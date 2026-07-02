import PropTypes from "prop-types";

export default function ImportButton({ onFileSelected, disabled }) {
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelected(file);
      event.target.value = "";
    }
  };

  return (
    <label className={`inline-flex cursor-pointer items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold ${disabled ? "bg-slate-700 text-slate-400" : "bg-sky-600 text-white hover:bg-sky-500"}`}>
      Select File
      <input
        type="file"
        accept=".csv,.xlsx,.xls,.json"
        className="hidden"
        disabled={disabled}
        onChange={handleFileChange}
      />
    </label>
  );
}

ImportButton.propTypes = {
  onFileSelected: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};
