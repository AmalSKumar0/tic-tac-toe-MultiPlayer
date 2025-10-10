import React, { useEffect, useState } from "react";
import axios from "axios";
import "../assets/home.css"; 

const CustomAlert = ({ message, onClose }) => { /* ... (Your CustomAlert component is perfect) ... */ };

export default function SocialPanel({ friends, sendGameRequest, newRequestTrigger, onFriendAction }) {
  const [requests, setRequests] = useState([]);
  const [isBoxVisible, setIsBoxVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('friends');
  const [alertMessage, setAlertMessage] = useState('');

  const fetchRequests = async () => { /* ... (This function is correct) ... */ };
  const handleResponse = async (id, action) => { /* ... (This function is correct) ... */ };

  useEffect(() => {
    fetchRequests();
  }, [newRequestTrigger]);

  return (
    <>
      <CustomAlert message={alertMessage} onClose={() => setAlertMessage('')} />
      
      <button className="friend-requests-toggle" onClick={() => setIsBoxVisible(true)}>
        <i className='bx bx-group'></i>
        {requests.length > 0 && (
          <span className="notification-badge">{requests.length}</span>
        )}
      </button>

      <div className={`friend-requests-box ${isBoxVisible ? 'visible' : ''}`}>
        <div className="friend-requests-header">
          <h3>Social</h3>
          <button className="close-button" onClick={() => setIsBoxVisible(false)}>×</button>
        </div>
        
        <div className="social-tabs">
          <button 
            className={`social-tab ${activeTab === 'friends' ? 'active' : ''}`}
            onClick={() => setActiveTab('friends')}
          >
            Friends ({friends?.length || 0})
          </button>
          <button 
            className={`social-tab ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            Requests ({requests.length})
          </button>
        </div>
        <div className="social-panel-body">
        {activeTab === 'requests' && (
          <div className="requests-list">
            {/* --- JSX FOR REQUESTS --- */}
            {requests.length === 0 ? (
              <p>No pending friend requests.</p>
            ) : (
              requests.map((req) => (
                <div key={req.id} className="request-item">
                  <span><strong>{req.user1.username}</strong> wants to be friends.</span>
                  <div className="actions">
                    <button onClick={() => handleResponse(req.id, "accept")} className="accept-btn">Accept</button>
                    <button onClick={() => handleResponse(req.id, "reject")} className="reject-btn">Reject</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        
        {activeTab === 'friends' && (
          <div className="friends-list">
            <a href="/friends" className="go-to-friends-link">Add Friends</a>
            {friends && friends.length > 0 ? (
              friends.map((friend) => (
                <div key={friend.id} className="friend-item">
                  <div className="friend-info">
                    <span className={friend.status === "online" ? "online-dot" : "offline-dot"}></span>
                    {friend.username}
                  </div>
                  {friend.status === "online" && (
                    <button onClick={() => sendGameRequest(friend.id)} className="play-btn">Play</button>
                  )}
                </div>
              ))
            ) : (
              <p>No friends to show. Add some!</p>
            )}
          </div>
        )}
        </div>
      </div>
    </>
  );
}