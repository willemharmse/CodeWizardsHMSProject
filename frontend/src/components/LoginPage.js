import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom'; // Import useLocation for getting URL query parameters
import {jwtDecode} from 'jwt-decode'; // You'll need to install jwt-decode: npm install jwt-decode
import './LoginPage.css';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation(); // Access the current URL
  const searchParams = new URLSearchParams(location.search); // Parse query parameters
  const redirectPath = searchParams.get('redirect') || '/dashboard'; // Get 'redirect' parameter or fallback to '/dashboard'

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

      // Store token and decode it to check user role
      if (data.token) {
        localStorage.setItem('token', data.token); // Store the token
        const decodedToken = jwtDecode(data.token); // Decode the token to get user role
        const userRole = decodedToken.role; // Assuming role is stored in token as 'role'

        // Check the user's role and redirect accordingly
        if (redirectPath === '/userManagement') {
          if (userRole === 'lecturer') {
            // Lecturer doesn't have access to manage users
            alert('You do not have access to manage users. Redirecting to dashboard.');
            window.location.href = '/dashboard'; // Redirect to dashboard
          } else if (userRole === 'student') {
            // Student should see 403 page
            window.location.href = '/403'; // Redirect to the 403 page
          } else {
            // Any other valid roles can access the user management page
            window.location.href = redirectPath; // Redirect to user management
          }
        } else {
          // If not user management, redirect to the target page
          window.location.href = redirectPath;
        }
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
            <h2><a href='/'>HMS</a></h2>
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
