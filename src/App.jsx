import { useEffect, lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./layouts/AppShell.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { ToastContainer, useToast } from "./components/Toast.jsx";
import { LoadingOverlay } from "./components/Spinner.jsx";
import {
  requestNotificationPermission,
  checkAndNotifyInactivity,
  checkAndNotifyUpcomingInactivity,
  normalizeNotificationPreferences,
  evaluateReminderEngine,
  dispatchReminderNotifications,
} from "./utils/notifications.js";
import useLogbookStore from "./store/useLogbookStore.js";

const CURRENT_USER = "Wayne";

// Code split pages for better performance
const FlightBoardPage = lazy(() => import("./features/flights/FlightBoard.jsx"));
const FleetPage = lazy(() => import("./features/fleet/FleetPage.jsx"));
const MyShiftPage = lazy(() => import("./features/shift/MyShiftPage.jsx"));
const StatisticsPage = lazy(() => import("./features/statistics/StatisticsPage.jsx"));
const OperationsTimelinePage = lazy(() => import("./features/timeline/OperationsTimelinePage.jsx"));
const AnalyticsDashboard = lazy(() => import("./features/analytics/AnalyticsDashboard.jsx"));
const FlightImportPage = lazy(() => import("./features/import/flightradar24/components/FlightRadarImport.jsx"));
const HistoryPage = lazy(() => import("./features/history/HistoryPage.jsx"));
const SettingsPage = lazy(() => import("./features/settings/SettingsPage.jsx"));

export default function AircraftMovementLogbook() {
  const fleetCount = useLogbookStore((state) => (state.fleet || []).length);
  const history = useLogbookStore((state) => state.history);
  const shiftJobs = useLogbookStore((state) => state.shiftJobs);
  const hasHydrated = useLogbookStore((state) => state.hasHydrated);
  const getNotificationPreferences = useLogbookStore((state) => state.getNotificationPreferences);
  const getNotificationMeta = useLogbookStore((state) => state.getNotificationMeta);
  const darkMode = useLogbookStore((state) => Boolean(state.profile?.darkMode));

  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    if (history[CURRENT_USER] || (shiftJobs || []).length > 0) {
      const preferences = normalizeNotificationPreferences(getNotificationPreferences());
      requestNotificationPermission();
      checkAndNotifyInactivity(history[CURRENT_USER], CURRENT_USER, preferences);
      checkAndNotifyUpcomingInactivity(history[CURRENT_USER], CURRENT_USER, preferences);

      const runReminderEngine = () => {
        const reminders = evaluateReminderEngine({
          shiftJobs,
          historyEntries: history[CURRENT_USER] || [],
          preferences,
          username: CURRENT_USER,
          notificationMeta: getNotificationMeta?.(),
        });
        dispatchReminderNotifications(reminders);
      };

      runReminderEngine();
      const timerId = window.setInterval(runReminderEngine, 60 * 1000);
      return () => window.clearInterval(timerId);
    }
    return undefined;
  }, [history, shiftJobs, getNotificationPreferences, getNotificationMeta]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  if (!hasHydrated) {
    return <LoadingOverlay message="Loading logbook..." />;
  }

  return (
    <ErrorBoundary>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Suspense fallback={<LoadingOverlay message="Loading page..." />}>
        <Routes>
          <Route
            element={
              <AppShell
                fleetCount={fleetCount}
                currentUser={CURRENT_USER}
                darkMode={darkMode}
              />
            }
          >
            <Route path="/" element={<Navigate to="/statistics" replace />} />
            <Route path="/statistics" element={<StatisticsPage />} />
            <Route path="/flights" element={<FlightBoardPage />} />
            <Route path="/my-shift" element={<MyShiftPage />} />
            <Route path="/fleet" element={<FleetPage />} />
            <Route path="/timeline" element={<OperationsTimelinePage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/calendar" element={<AnalyticsDashboard />} />
            <Route path="/import" element={<FlightImportPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/statistics" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
