// src/components/Notification.jsx

import React from 'react';
import '../assets/home.css'; // Or your main CSS file

function Notification({ message, actions }) {
  if (!message) return null;

  return (
    <div className="notification-banner">
      <div className="notification-content">
        <p>{message}</p>
        <div className="notification-actions">
          {actions.map((action, index) => (
            <button key={index} onClick={action.onClick} className={action.className}>
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Notification;