const Spinner = ({ size = "md", className = "" }) => {
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
};

export const LoadingOverlay = ({ message = "Loading..." }) => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
      <div className="text-center">
        <Spinner size="xl" />
        <p className="mt-4 text-slate-600 font-medium">{message}</p>
      </div>
    </div>
  );
};

export const InlineSpinner = ({ message, size = "sm" }) => {
  return (
    <div className="flex items-center space-x-2">
      <Spinner size={size} />
      {message && <span className="text-slate-600 text-sm">{message}</span>}
    </div>
  );
};

export default Spinner;
