import { useState, useEffect } from "react";
import PropTypes from "prop-types";

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return { toasts, addToast, removeToast };
};

export const ToastContainer = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-4 py-3 rounded-lg shadow-lg text-white min-w-[300px] max-w-md flex items-center justify-between ${
            toast.type === "error" ? "bg-red-500" :
            toast.type === "success" ? "bg-green-500" :
            toast.type === "warning" ? "bg-yellow-500" :
            "bg-blue-500"
          }`}
        >
          <span className="text-sm">{toast.message}</span>
          <button
            onClick={() => onRemove(toast.id)}
            className="ml-3 text-white/80 hover:text-white"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};

ToastContainer.propTypes = {
  toasts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      message: PropTypes.string.isRequired,
      type: PropTypes.oneOf(["error", "success", "warning", "info"]).isRequired,
    })
  ).isRequired,
  onRemove: PropTypes.func.isRequired,
};

export const toast = {
  success: (message) => console.log("Toast success:", message),
  error: (message) => console.log("Toast error:", message),
  warning: (message) => console.log("Toast warning:", message),
  info: (message) => console.log("Toast info:", message),
};
