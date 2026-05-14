import { useState } from "react";

const UserSettings = ({ 
  currentUser, 
  hasBiometricCredential, 
  isBiometricSupported,
  onRegisterBiometric,
  onDeleteBiometricCredential 
}) => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegisterBiometric = async () => {
    setLoading(true);
    setMessage("");
    try {
      await onRegisterBiometric(currentUser);
      setMessage("Biometric credential registered successfully!");
    } catch (error) {
      setMessage(error.message || "Failed to register biometric credential.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBiometric = () => {
    if (window.confirm("Are you sure you want to remove your biometric credential? You will need to use your password to login.")) {
      const success = onDeleteBiometricCredential(currentUser);
      if (success) {
        setMessage("Biometric credential removed successfully.");
      } else {
        setMessage("Failed to remove biometric credential.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-sky-200 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-6">User Settings</h1>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Methods</h2>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
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

          {isBiometricSupported && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-medium text-gray-900">Biometric Authentication</h3>
                  <p className="text-sm text-gray-600">
                    {hasBiometricCredential(currentUser) 
                      ? "Fingerprint or Face ID is enabled" 
                      : "Not configured"}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  hasBiometricCredential(currentUser)
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}>
                  {hasBiometricCredential(currentUser) ? "Active" : "Inactive"}
                </span>
              </div>

              {hasBiometricCredential(currentUser) ? (
                <button
                  onClick={handleDeleteBiometric}
                  className="w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Remove Biometric Credential
                </button>
              ) : (
                <button
                  onClick={handleRegisterBiometric}
                  disabled={loading}
                  className="w-full bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {loading ? "Registering..." : "Register Biometric Credential"}
                </button>
              )}
            </div>
          )}

          {!isBiometricSupported && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                Biometric authentication is not supported on this device or browser.
              </p>
            </div>
          )}
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
