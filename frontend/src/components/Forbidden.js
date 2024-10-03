// src/components/Forbidden.js
import React from 'react';
import './Forbidden.css'; // Import the CSS file

const Forbidden = () => {
  return (
    <div className="forbidden-container">
      <h1 className="forbidden-number">403</h1>
      <p className="forbidden-message">Forbidden Access</p>
    </div>
  );
};

export default Forbidden;
