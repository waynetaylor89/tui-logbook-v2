import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

// Test Login component
function TestLogin() {
  return (
    <div style={{ padding: '20px', backgroundColor: 'lightgreen', minHeight: '100vh' }}>
      <h1>Test Login Page</h1>
      <p>Login component is working!</p>
    </div>
  );
}

export default function AircraftMovementLogbook() {
  const [currentUser, setCurrentUser] = useState(null);
  
  console.log("App component is rendering!");
  
  if (!currentUser) {
    return <TestLogin />;
  }
  
  return (
    <div style={{ padding: '20px', backgroundColor: 'lightblue', minHeight: '100vh' }}>
      <h1>TUI Logbook - Main App</h1>
      <p>Logged in as: {currentUser}</p>
      <button onClick={() => setCurrentUser(null)}>Logout</button>
    </div>
  );
}