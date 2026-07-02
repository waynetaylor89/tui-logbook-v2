import { Component } from "react";
import PropTypes from "prop-types";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-8 shadow-xl">
            <h1 className="mb-4 text-2xl font-bold text-rose-300">Something went wrong</h1>
            <p className="mb-2 text-slate-200">
              An unexpected error occurred. Please refresh the page to try again.
            </p>
            <p className="mb-4 text-sm text-slate-400">
              If you are offline, reconnect briefly so the latest assets can sync, then reload.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full rounded-md bg-sky-600 px-4 py-2 text-white transition-colors hover:bg-sky-500"
            >
              Refresh Page
            </button>
            {process.env.NODE_ENV === "development" && (
              <details className="mt-4">
                <summary className="cursor-pointer text-slate-400">Error details</summary>
                <pre className="mt-2 overflow-auto rounded bg-slate-950 p-4 text-xs text-slate-300">
                  {this.state.error?.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ErrorBoundary;
