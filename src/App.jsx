// Test component to diagnose white screen issue

export default function AircraftMovementLogbook() {
  console.log("App component is rendering!");
  
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: 'lightblue', 
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: 'darkblue', fontSize: '2rem' }}>
        TUI Logbook - Test Page
      </h1>
      <p style={{ fontSize: '1.2rem', marginTop: '20px' }}>
        If you can see this page, React is working correctly!
      </p>
      <p style={{ marginTop: '10px' }}>
        The white screen issue is likely caused by component imports or state management.
      </p>
      <div style={{ 
        marginTop: '20px', 
        padding: '10px', 
        backgroundColor: 'white', 
        border: '2px solid darkblue',
        borderRadius: '8px'
      }}>
        <h3>Debugging Info:</h3>
        <p>✅ React is rendering</p>
        <p>✅ CSS is working</p>
        <p>✅ JavaScript is executing</p>
      </div>
    </div>
  );
}