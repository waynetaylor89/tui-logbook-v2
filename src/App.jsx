import { useState } from "react";
import Login from "./components/Login.jsx";

export default function AircraftMovementLogbook() {
  console.log("App component is rendering!");

  // Use local state instead of Zustand to isolate the issue
  const [currentUser, setCurrentUser] = useState(null);
  
  // Simple login function for testing
  const handleLogin = async (username, password) => {
    console.log("Login attempt:", username, password);
    
    // Simple admin login for testing
    if (username === "wayne" && password === "admin") {
      setCurrentUser(username);
      return true;
    }
    
    // For any other username, just accept it for testing
    if (username && password) {
      setCurrentUser(username);
      return true;
    }
    
    return false;
  };
  
  const handleLogout = () => {
    setCurrentUser(null);
  };

  const isAdmin = currentUser === "wayne";

  // Bypass hydration check to prevent white screen issue
  if (!currentUser) {
    console.log("Showing login screen - currentUser:", currentUser);
    return (
      <Login
        onLogin={handleLogin}
        onRegister={() => {}}
        onRecoverPassword={() => {}}
        onListUsernames={() => []}
      />
    );
  }

  console.log("Rendering main app - currentUser:", currentUser);

  // Simple test to see if the issue is with complex components
  return (
    <div style={{ padding: '20px', backgroundColor: 'lightgreen', minHeight: '100vh' }}>
      <h1>TUI Logbook - Main App</h1>
      <p>Logged in as: {currentUser}</p>
      <p>Admin: {isAdmin ? 'Yes' : 'No'}</p>
      <button onClick={handleLogout} style={{ marginTop: '20px', padding: '10px 20px' }}>
        Logout
      </button>
    </div>
  );
}