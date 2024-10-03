import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css'; // Import the CSS file for styling

// Check links of buttons
function LandingPage() {
  return (
    <div className="landing-container">
      <header className="landing-header">
        <div className="header-content">
          <h2>HMS</h2>
          <Link to="/login">
            <button className="logout-button">Log In</button>
          </Link>
        </div>
      </header>
      <form class="box">
        <div className="button-container">
        <h1>Welcome</h1>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam tempus varius justo eget faucibus. Duis vestibulum laoreet elit, in blandit justo luctus nec. Nullam et vehicula est. Aenean convallis lobortis tellus, ut tempor arcu gravida sit amet. Proin sit amet neque at velit fringilla tristique non vestibulum mi. Nullam viverra, ante in consectetur viverra, augue odio ultrices diam, eget pharetra felis lectus quis arcu. Phasellus malesuada metus ut neque pellentesque, ut viverra mi tempus. Duis ultrices sit amet sapien nec auctor. Sed eget mauris aliquet, dignissim risus consectetur, dapibus diam.</p>
          <Link to="/login"> 
            <button className="landing-button">See your courses</button>
          </Link>
          <Link to="/admin">
            <button className="landing-button">Manage Users</button>
          </Link>
        </div>
      </form>
    </div>
  );
}

export default LandingPage;
