import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function Dashboard({ token, onLogout }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setUser(response.data.user);
    } catch (err) {
      setError('Failed to fetch profile');
      if (err.response?.status === 401) {
        onLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <h2>Dashboard</h2>
      {error && <p style={styles.error}>{error}</p>}
      
      {user && (
        <div style={styles.profile}>
          <h3>Welcome, {user.username}!</h3>
          <p><strong>User ID:</strong> {user.id}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Member since:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
        </div>
      )}

      <div style={styles.info}>
        <h3>About Password Hashing</h3>
        <ul>
          <li>Passwords are never stored in plain text</li>
          <li>We use bcrypt - a strong password hashing algorithm</li>
          <li>Each password gets a unique salt</li>
          <li>Even identical passwords produce different hashes</li>
          <li>The hash includes version, cost factor, salt, and hash</li>
        </ul>
      </div>

      <button onClick={onLogout} style={styles.button}>
        Logout
      </button>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '600px',
    margin: '50px auto',
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '5px'
  },
  loading: {
    textAlign: 'center',
    fontSize: '18px',
    marginTop: '50px'
  },
  profile: {
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: '#e3f2fd',
    border: '1px solid #90caf9',
    borderRadius: '5px'
  },
  info: {
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: '#f3e5f5',
    border: '1px solid #ce93d8',
    borderRadius: '5px'
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer'
  },
  error: {
    color: 'red',
    marginBottom: '10px'
  }
};

export default Dashboard;