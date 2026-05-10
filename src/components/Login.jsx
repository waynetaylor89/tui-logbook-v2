import { useState } from "react";

const Login = ({ onLogin, onRegister, onRecoverPassword, onListUsernames }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [forgotMode, setForgotMode] = useState(null);
  const [recoveryResult, setRecoveryResult] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("");
    setRecoveryResult("");

    if (forgotMode) {
      if (forgotMode === "password") {
        if (!username.trim()) {
          setMessage("Enter your username to recover the password.");
          return;
        }
        const passwordResult = onRecoverPassword(username.trim());
        if (passwordResult) {
          setRecoveryResult(`Password for ${username.trim()}: ${passwordResult}`);
        } else {
          setRecoveryResult("No user found with that username.");
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
      if (onRegister(username.trim(), password)) {
        setMessage("Registration successful! Please login.");
        setIsRegistering(false);
        setPassword("");
        setConfirmPassword("");
      } else {
        setMessage("Username already exists.");
      }
    } else {
      if (onLogin(username.trim(), password)) {
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
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {forgotMode
              ? "Recover Password"
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