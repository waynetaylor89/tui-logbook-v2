import { useState, useEffect } from "react";

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

  // Load saved credentials on component mount
  useEffect(() => {
    const savedUsername = localStorage.getItem('tui-logbook-remember-username');
    const savedPassword = localStorage.getItem('tui-logbook-remember-password');
    const savedRememberMe = localStorage.getItem('tui-logbook-remember-me') === 'true';
    
    if (savedUsername) setUsername(savedUsername);
    if (savedPassword) setPassword(savedPassword);
    setRememberMe(savedRememberMe);
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

    if (isRegistering) {
      if (password !== confirmPassword) {
        setMessage("Passwords do not match.");
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
        // Save credentials if remember me is checked
        if (rememberMe) {
          localStorage.setItem('tui-logbook-remember-username', username.trim());
          localStorage.setItem('tui-logbook-remember-password', password);
          localStorage.setItem('tui-logbook-remember-me', 'true');
        } else {
          // Clear saved credentials if remember me is unchecked
          localStorage.removeItem('tui-logbook-remember-username');
          localStorage.removeItem('tui-logbook-remember-password');
          localStorage.removeItem('tui-logbook-remember-me');
        }
        setMessage("");
      } else {
        setMessage("Invalid username or password.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-sky-200 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isRegistering ? "Register" : "Login"}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required={!forgotMode}
            />
          </div>
          {!forgotMode && (
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={!forgotMode}
              />
            </div>
          )}
          {isRegistering && !forgotMode && (
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}
          {message && (
            <div className="mb-4 text-sm text-red-600">
              {message}
            </div>
          )}
          {recoveryResult && (
            <div className="mb-4 text-sm text-slate-700 bg-slate-100 rounded-md p-3">
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
                <span className="text-gray-700">Remember username and password</span>
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
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {forgotMode
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
            className="w-full mt-4 text-blue-500 hover:text-blue-600"
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
            className="w-full mt-4 text-blue-500 hover:text-blue-600"
          >
            Back to login
          </button>
        )}
        {!forgotMode && (
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="w-full mt-4 text-blue-500 hover:text-blue-600"
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
            className="w-full mt-4 text-blue-500 hover:text-blue-600"
          >
            Forgot username?
          </button>
        )}
      </div>
    </div>
  );
};

export default Login;