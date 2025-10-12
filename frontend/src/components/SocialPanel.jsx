import React, { useEffect, useState } from "react";
import axios from "axios";
import "../assets/home.css"; 
import { Link } from "react-router-dom";
const Url = import.meta.env.VITE_API_URL;

const CustomAlert = ({ message, onClose }) => {
  if (!message) {
    return null;
  }

  return (
    <div className="custom-alert-overlay" onClick={onClose}>
      <div className="custom-alert-box" onClick={e => e.stopPropagation()}>
        <p>{message}</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

const getStatusClass = (status) => {
  if (status === 'online') return 'online-dot';
  if (status === 'in-game') return 'in-game-dot';
  return 'offline-dot';
};

export default function SocialPanel({ friends, sendGameRequest, newRequestTrigger, onFriendAction }) {
  const [requests, setRequests] = useState([]);
  const [isBoxVisible, setIsBoxVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('friends');
  const [alertMessage, setAlertMessage] = useState('');

  const fetchRequests = async () => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    const res = await axios.get(`${Url}/api/friend-requests/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setRequests(res.data);
  } catch (err) {
    console.error("Error fetching friend requests:", err);
  }
};
const handleResponse = async (id, action) => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    await axios.post(
      `${Url}/api/friend-request/${id}/${action}/`, 
      {}, // POST request needs a body, even if empty
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    setAlertMessage(`Request ${action}ed successfully!`);
    fetchRequests(); // Refresh this component's requests list
    
    if (action === 'accept') {
      onFriendAction(); // Tell the parent to refresh the main friends list
    }
  } catch (err) {
    setAlertMessage(`Error: Could not ${action} request.`);
    console.error(`Error responding to friend request:`, err);
  }
};
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
              <Link to="/friends" className="go-to-friends-link">Add Friends</Link>
              {friends && friends.length > 0 ? (
                friends.map((friend) => (
                  <div key={friend.id} className="friend-item">
                    <div className="friend-info">
                      <span className={getStatusClass(friend.status)}></span>
                      {friend.username}
                      {friend.status === 'in-game' && <span className="status-text"> (In Game)</span>}
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