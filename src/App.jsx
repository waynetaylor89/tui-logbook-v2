import { useState } from "react";
import Login from "./components/Login.jsx";
import useLogbookStore from "./store/useLogbookStore.js";

export default function AircraftMovementLogbook() {
  const [currentUser, setCurrentUser] = useState(null);
  const { login } = useLogbookStore();
  
  console.log("App component is rendering!");
  
  if (!currentUser) {
    return <Login onLogin={(username, password) => {
      login(username, password).then(success => {
        if (success) setCurrentUser(username);
      });
    }} />;
  }
  
  return (
    <div style={{ padding: '20px', backgroundColor: 'lightblue', minHeight: '100vh' }}>
      <h1>TUI Logbook - Main App</h1>
      <p>Logged in as: {currentUser}</p>
      <button onClick={() => setCurrentUser(null)}>Logout</button>
    </div>
  );
}