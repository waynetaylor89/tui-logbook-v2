import { useState, useEffect } from "react";
import PropTypes from "prop-types";

const Login = ({ onLogin, onRegister, onRecoverPassword, onListUsernames, onRegisterBiometric, onLoginWithBiometric, hasBiometricCredential, isBiometricSupported }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [forgotMode, setForgotMode] = useState(null);
  const [recoveryResult, setRecoveryResult] = useState("");
  const [message, setMessage] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // Load saved username on component mount (password not stored for security)
  useEffect(() => {
    try {
      const savedUsername = localStorage.getItem('tui-logbook-remember-username');
      const savedRememberMe = localStorage.getItem('tui-logbook-remember-me') === 'true';
      
      if (savedUsername) setUsername(savedUsername);
      setRememberMe(savedRememberMe);
    } catch (error) {
      console.error('Failed to load saved username:', error);
    }
  }, []);

  const handleBiometricLogin = async () => {
    if (!username.trim()) {
      setMessage("Please enter your username first.");
      return;
    }
    setBiometricLoading(true);
    setMessage("");
    try {
      await onLoginWithBiometric(username.trim());
      setMessage("");
    } catch (error) {
      setMessage(error.message || "Biometric authentication failed.");
    } finally {
      setBiometricLoading(false);
    }
  };

  const handleBiometricRegister = async () => {
    if (!username.trim()) {
      setMessage("Please enter your username first.");
      return;
    }
    setBiometricLoading(true);
    setMessage("");
    try {
      await onRegisterBiometric(username.trim());
      setMessage("Biometric registration successful! You can now use biometric login.");
    } catch (error) {
      setMessage(error.message || "Biometric registration failed.");
    } finally {
      setBiometricLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setRecoveryResult("");

    if (forgotMode) {
      if (forgotMode === "password") {
        if (!username.trim()) {
          setMessage("Enter your username to recover the password.");
          return;
        }
        const passwordResult = await onRecoverPassword(username.trim());
        if (passwordResult) {
          setRecoveryResult(`Password for ${username.trim()}: ${passwordResult}`);
        } else {
          setRecoveryResult("Password recovery is disabled for security. Contact admin for a reset.");
        }
      } else if (forgotMode === "username") {
        const usernames = onListUsernames();
        setRecoveryResult(
          usernames.length > 0
            ? `Registered usernames: ${usernames.join(", ")}`
            : "No registered usernames yet."
        );
      }
      return;
    }

    if (!username.trim() || !password.trim()) {
      setMessage("Please enter both username and password.");
      return;
    }

    setAuthLoading(true);
    if (isRegistering) {
      if (password !== confirmPassword) {
        setMessage("Passwords do not match.");
        setAuthLoading(false);
        return;
      }
      if (await onRegister(username.trim(), password)) {
        setMessage("Registration successful! Please login.");
        setIsRegistering(false);
        setPassword("");
        setConfirmPassword("");
      } else {
        setMessage("Username already exists.");
      }
    } else {
      if (await onLogin(username.trim(), password)) {
        // Save only username if remember me is checked (password not stored for security)
        try {
          if (rememberMe) {
            localStorage.setItem('tui-logbook-remember-username', username.trim());
            localStorage.setItem('tui-logbook-remember-me', 'true');
          } else {
            // Clear saved credentials if remember me is unchecked
            localStorage.removeItem('tui-logbook-remember-username');
            localStorage.removeItem('tui-logbook-remember-me');
          }
        } catch (error) {
          console.error('Failed to save username preference:', error);
        }
        setMessage("");
      } else {
        setMessage("Invalid username or password.");
      }
    }
    setAuthLoading(false);
  };

  return (
    <div className="min-h-screen bg-sky-200 dark:bg-slate-900 flex items-center justify-center">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isRegistering ? "Register" : "Login"}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-slate-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required={!forgotMode}
            />
          </div>
          {!forgotMode && (
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-slate-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={!forgotMode}
              />
            </div>
          )}
          {isRegistering && !forgotMode && (
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-slate-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}
          {message && (
            <div className="mb-4 text-sm text-red-600 dark:text-red-400">
              {message}
            </div>
          )}
          {recoveryResult && (
            <div className="mb-4 text-sm text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-md p-3">
              {recoveryResult}
            </div>
          )}
          {!isRegistering && !forgotMode && (
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-gray-700 dark:text-gray-300">Remember username</span>
              </label>
            </div>
          )}
          {!isRegistering && !forgotMode && isBiometricSupported && (
            <div className="mb-4">
              <button
                type="button"
                onClick={handleBiometricLogin}
                disabled={biometricLoading || !username.trim()}
                className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {biometricLoading ? "Verifying..." : "Login with Biometrics"}
              </button>
            </div>
          )}
          {!isRegistering && !forgotMode && isBiometricSupported && !hasBiometricCredential(username) && (
            <div className="mb-4">
              <button
                type="button"
                onClick={handleBiometricRegister}
                disabled={biometricLoading || !username.trim()}
                className="w-full bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {biometricLoading ? "Registering..." : "Register Biometrics"}
              </button>
            </div>
          )}
          <button
            type="submit"
            disabled={authLoading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {authLoading
              ? "Processing..."
              : forgotMode
              ? "Recovery Info"
              : isRegistering
              ? "Register"
              : "Login"}
          </button>
        </form>
        {!forgotMode && (
          <button
            onClick={() => {
              setForgotMode("password");
              setMessage("");
              setRecoveryResult("");
            }}
            className="w-full mt-4 text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300"
          >
            Forgot password?
          </button>
        )}
        {forgotMode && (
          <button
            onClick={() => {
              setForgotMode(null);
              setMessage("");
              setRecoveryResult("");
            }}
            className="w-full mt-4 text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300"
          >
            Back to login
          </button>
        )}
        {!forgotMode && (
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="w-full mt-4 text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300"
          >
            {isRegistering ? "Already have an account? Login" : "Need an account? Register"}
          </button>
        )}
        {!forgotMode && (
          <button
            onClick={() => {
              setForgotMode("username");
              setMessage("");
              setRecoveryResult(onListUsernames().length
                ? `Registered usernames: ${onListUsernames().join(", ")}`
                : "No registered usernames yet.");
            }}
            className="w-full mt-4 text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300"
          >
            Forgot username?
          </button>
        )}
      </div>
    </div>
  );
};

Login.propTypes = {
  onLogin: PropTypes.func.isRequired,
  onRegister: PropTypes.func.isRequired,
  onRecoverPassword: PropTypes.func.isRequired,
  onListUsernames: PropTypes.func.isRequired,
  onRegisterBiometric: PropTypes.func.isRequired,
  onLoginWithBiometric: PropTypes.func.isRequired,
  hasBiometricCredential: PropTypes.func.isRequired,
  isBiometricSupported: PropTypes.bool.isRequired,
};

export default Login;