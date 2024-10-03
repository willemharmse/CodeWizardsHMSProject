import React, { useState } from 'react';
import './LoginPage.css';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    // Clear previous errors
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (!response.ok) {
        throw new Error('Login failed. Please check your credentials.');
      }

      const data = await response.json();

      // Store token and redirect to another page (if login successful)
      if (data.token) {
        localStorage.setItem('token', data.token); // Store the token
        window.location.href = '/dashboard'; // Redirect to the dashboard or any other page
      } else {
        throw new Error('Invalid login attempt.');
      }
    } catch (err) {
      setError(err.message); // Display the error to the user
    }
  };

  return (
    
    <div className="login-container">
      <div className='login-header'>
      <header className="landing-header">
        <div className="header-content">
          <h2>HMS</h2>
        </div>
      </header>
      </div>
      <div className='login-page-box'>
      <h2>Login</h2>
      <div className="login-box">
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="login-button">Login</button>
        </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
