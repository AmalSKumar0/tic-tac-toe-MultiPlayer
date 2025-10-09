import { useEffect, useState } from "react";
import axios from "axios";

export default function FriendRequests() {
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await axios.get("http://127.0.0.1:8000/api/friend-requests/", {
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
      await axios.post(
        `http://127.0.0.1:8000/api/friend-request/${id}/${action}/`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert(`Request ${action}ed!`);
      fetchRequests(); // refresh list
    } catch (err) {
      console.error(`Error ${action}ing friend request:`, err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="friend-requests">
      <h3>Friend Requests</h3>
      {requests.length === 0 ? (
        <p>No pending requests.</p>
      ) : (
        requests.map((req) => (
          <div key={req.id} className="request-item">
            <span>
              <strong>{req.user1.username}</strong> sent you a friend request.
            </span>
            <div>
              <button
                onClick={() => handleResponse(req.id, "accept")}
                className="accept-btn"
              >
                Accept
              </button>
              <button
                onClick={() => handleResponse(req.id, "reject")}
                className="reject-btn"
              >
                Reject
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
