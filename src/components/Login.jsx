import { useState } from "react";

const Login = ({ onLogin, onRegister }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("");

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
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          {isRegistering && (
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
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {isRegistering ? "Register" : "Login"}
          </button>
        </form>
        <button
          onClick={() => setIsRegistering(!isRegistering)}
          className="w-full mt-4 text-blue-500 hover:text-blue-600"
        >
          {isRegistering ? "Already have an account? Login" : "Need an account? Register"}
        </button>
      </div>
    </div>
  );
};

export default Login;