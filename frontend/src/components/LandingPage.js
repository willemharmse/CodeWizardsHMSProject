import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css'; // Import the CSS file for styling

function LandingPage() {
  return (
    <div className="landing-container">
      <header className="landing-page-header">
        <div className="header-content">
          <h2>HMS</h2>
          <Link to="/login">
            <button className="landing-page-login-button">Login</button>
          </Link>
        </div>
      </header>
      <div className='landing-page-content'>
        <h1>Welcome</h1>
        <p>Here you can see the assignments and submissions for all your courses in the Faculty of Education Department of Human Movement Sciences at the North-West University.</p>
        <div className="button-container">
          <Link to="/login">
            <button className="landing-page-button">List assignments</button>
          </Link>
          <Link to="/login">
            <button className="landing-page-button">Add assignment</button>
          </Link>
          <Link to="/login?redirect=/userManagement">
            <button className="landing-page-button">Manage Users</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
