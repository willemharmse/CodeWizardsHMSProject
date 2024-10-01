import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css'; // Import the CSS file for styling

function LandingPage() {
  return (
    <div className="landing-container">
      <header className="landing-header">
        <h1>Welcome to Our System</h1>
        <p>Please navigate using the buttons below</p>
      </header>
      <div className="button-container">
        <Link to="/login">
          <button className="landing-button">Login</button>
        </Link>
        <Link to="/admin">
          <button className="landing-button">User Administration</button>
        </Link>
        <Link to="/assignments">
          <button className="landing-button">List Assignments</button>
        </Link>
        <Link to="/create-assignment">
          <button className="landing-button">Create Assignment</button>
        </Link>
        <Link to="/assignment-videos">
          <button className="landing-button">Assignment Videos</button>
        </Link>
      </div>
    </div>
  );
}

export default LandingPage;
