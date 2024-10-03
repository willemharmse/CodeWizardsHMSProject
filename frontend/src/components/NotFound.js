// src/components/NotFound.js
import React from 'react';
import './NotFound.css'; // Import the CSS file

const NotFound = () => {
  return (
    <div className="notfound-container">
      <h1 className="notfound-number">404</h1>
      <p className="notfound-message">Page Not Found</p>
    </div>
  );
};

export default NotFound;
