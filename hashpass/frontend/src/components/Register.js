import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [hashResult, setHashResult] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      // First, show how password hashing works
      const hashDemo = await axios.post(`${API_URL}/hash-demo`, {
        password: formData.password
      });
      setHashResult(hashDemo.data);

      // Then register the user
      const response = await axios.post(`${API_URL}/register`, {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });

      setSuccess('Registration successful! You can now login.');
      
      // Clear form
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      });

      // Redirect to login after 3 seconds
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label>Username:</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            style={styles.input}
          />
        </div>
        <div style={styles.formGroup}>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={styles.input}
          />
        </div>
        <div style={styles.formGroup}>
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            style={styles.input}
          />
        </div>
        <div style={styles.formGroup}>
          <label>Confirm Password:</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            style={styles.input}
          />
        </div>
        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>{success}</p>}
        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Loading...' : 'Register'}
        </button>
      </form>

      {hashResult && (
        <div style={styles.hashDemo}>
          <h3>Password Hashing Demo:</h3>
          <p><strong>Original Password:</strong> {hashResult.original_password}</p>
          <p><strong>Hashed Password:</strong> <code>{hashResult.hashed_password}</code></p>
          <p><strong>Verification:</strong> {hashResult.verified ? '✅ Success' : '❌ Failed'}</p>
          <p><strong>Algorithm:</strong> {hashResult.hash_info.algorithm}</p>
          <p><strong>Hash Length:</strong> {hashResult.hash_info.hash_length} characters</p>
          <p><strong>Structure:</strong> {hashResult.hash_info.hash_structure}</p>
        </div>
      )}

      <p>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '500px',
    margin: '50px auto',
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '5px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column'
  },
  formGroup: {
    marginBottom: '15px'
  },
  input: {
    width: '100%',
    padding: '8px',
    marginTop: '5px',
    border: '1px solid #ddd',
    borderRadius: '3px'
  },
  button: {
    padding: '10px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer'
  },
  error: {
    color: 'red',
    marginBottom: '10px'
  },
  success: {
    color: 'green',
    marginBottom: '10px'
  },
  hashDemo: {
    marginTop: '20px',
    padding: '15px',
    backgroundColor: '#f8f9fa',
    border: '1px solid #ddd',
    borderRadius: '5px'
  }
};

export default Register;