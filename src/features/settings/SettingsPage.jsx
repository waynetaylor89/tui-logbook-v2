import UserSettings from "../../components/UserSettings.jsx";
import useLogbookStore from "../../store/useLogbookStore.js";

export default function SettingsPage() {
  const notificationPreferences = useLogbookStore((state) => state.getNotificationPreferences());
  const updateNotificationPreferences = useLogbookStore((state) => state.updateNotificationPreferences);
  const darkMode = useLogbookStore((state) => state.getDarkMode());
  const toggleDarkMode = useLogbookStore((state) => state.toggleDarkMode);
  const selectedAirline = useLogbookStore((state) => state.getSelectedAirline());
  const showOtherAirlines = useLogbookStore((state) => state.getShowOtherAirlines());
  const setShowOtherAirlines = useLogbookStore((state) => state.setShowOtherAirlines);

  return (
    <UserSettings
      notificationPreferences={notificationPreferences}
      onUpdateNotificationPreferences={updateNotificationPreferences}
      darkMode={darkMode}
      onToggleDarkMode={toggleDarkMode}
      selectedAirline={selectedAirline}
      showOtherAirlines={showOtherAirlines}
      onSetShowOtherAirlines={setShowOtherAirlines}
    />
  );
}
