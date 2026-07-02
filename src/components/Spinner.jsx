import PropTypes from "prop-types";
import { memo } from "react";

const Spinner = memo(function Spinner({ size = "md", className = "" }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8",
    xl: "w-12 h-12"
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div 
        className={`${sizeClasses[size]} border-2 border-blue-600 border-t-transparent rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
});

Spinner.propTypes = {
  size: PropTypes.oneOf(["sm", "md", "lg", "xl"]),
  className: PropTypes.string,
};

export const LoadingOverlay = memo(function LoadingOverlay({ message = "Loading..." }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900/80 p-5 text-center shadow-2xl">
        <Spinner size="xl" />
        <p className="mt-4 text-sm font-medium text-slate-200">{message}</p>
        <div className="mt-4 space-y-2">
          <div className="h-2 animate-pulse rounded bg-slate-700/80" />
          <div className="h-2 w-5/6 animate-pulse rounded bg-slate-700/60" />
          <div className="h-2 w-2/3 animate-pulse rounded bg-slate-700/50" />
        </div>
      </div>
    </div>
  );
});

LoadingOverlay.propTypes = {
  message: PropTypes.string,
};

export const InlineSpinner = memo(function InlineSpinner({ message, size = "sm" }) {
  return (
    <div className="flex items-center space-x-2">
      <Spinner size={size} />
      {message && <span className="text-sm text-slate-300">{message}</span>}
    </div>
  );
});

InlineSpinner.propTypes = {
  message: PropTypes.string,
  size: PropTypes.oneOf(["sm", "md", "lg", "xl"]),
};

export default Spinner;
