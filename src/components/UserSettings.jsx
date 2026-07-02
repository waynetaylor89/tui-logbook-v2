import { useState } from "react";

const UserSettings = ({ 
  currentUser, 
  notificationPreferences,
  onUpdateNotificationPreferences,
  darkMode,
  onToggleDarkMode
}) => {
  const [message, setMessage] = useState("");
  const [notificationEnabled, setNotificationEnabled] = useState(notificationPreferences?.enabled ?? true);
  const [notificationPeriod, setNotificationPeriod] = useState(notificationPreferences?.periodDays ?? 7);

  const handleNotificationPreferencesSave = () => {
    const success = onUpdateNotificationPreferences(currentUser, { enabled: notificationEnabled, periodDays: notificationPeriod });
    if (success) {
      setMessage("Notification preferences updated successfully.");
    } else {
      setMessage("Failed to update notification preferences.");
    }
  };

  return (
    <div className="min-h-screen bg-sky-200 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-6">User Settings</h1>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-medium text-gray-900">Inactivity Notifications</h3>
                <p className="text-sm text-gray-600">Get notified when you haven't logged movements for a while</p>
              </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={notificationEnabled}
                  onChange={(e) => setNotificationEnabled(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Enabled</span>
              </label>
            </div>
            
            {notificationEnabled && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notify after (days):
                </label>
                <select
                  value={notificationPeriod}
                  onChange={(e) => setNotificationPeriod(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={3}>3 days</option>
                  <option value={7}>7 days</option>
                  <option value={14}>14 days</option>
                  <option value={30}>30 days</option>
                </select>
              </div>
            )}
            
            <button
              onClick={handleNotificationPreferencesSave}
              className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Save Notification Preferences
            </button>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Appearance</h2>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Dark Mode</h3>
                <p className="text-sm text-gray-600">Switch between light and dark theme</p>
              </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={onToggleDarkMode}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Enable</span>
              </label>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Authentication</h2>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Password Authentication</h3>
                <p className="text-sm text-gray-600">Always enabled</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                Active
              </span>
            </div>
          </div>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-md ${
            message.includes("success") || message.includes("successfully")
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}>
            {message}
          </div>
        )}

        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold mb-4">Account Information</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700">
              <span className="font-medium">Username:</span> {currentUser}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
