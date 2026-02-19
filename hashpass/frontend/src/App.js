import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const handleLogin = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <Router>
      <div style={styles.container}>
        <h1 style={styles.header}>Password Hashing Demo</h1>
        <Routes>
          <Route 
            path="/login" 
            element={
              token ? 
              <Navigate to="/dashboard" /> : 
              <Login onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/register" 
            element={
              token ? 
              <Navigate to="/dashboard" /> : 
              <Register />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              token ? 
              <Dashboard token={token} onLogout={handleLogout} /> : 
              <Navigate to="/login" />
            } 
          />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  },
  header: {
    textAlign: 'center',
    color: '#333',
    borderBottom: '2px solid #007bff',
    paddingBottom: '10px'
  }
};

export default App;