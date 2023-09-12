// App.js
import React from 'react';
import './App.css'; // Import your CSS styles here
import MyRoutes from './Routes';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>My Blog</h1>
      </header>
      <div className="App-content">
        <MyRoutes />
      </div>
    </div>
  );
}

export default App;
