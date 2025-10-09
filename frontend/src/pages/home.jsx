import { useEffect, useState } from "react";
import axios from "axios";
import FriendRequests from "../components/friendrequest";

export default function Home() {
  const [friends, setFriends] = useState([]); // initialize as array
  const [loading, setLoading] = useState(true);

  const fetchFriends = async () => {
    try {
        const token = localStorage.getItem("access_token");
      const res = await axios.get("http://127.0.0.1:8000/api/friends/", {
      headers: { Authorization: `Bearer ${token}` },
    });
      const data = Array.isArray(res.data) ? res.data : [];
      const sorted = data.sort((a, b) => (b.status === "online") - (a.status === "online"));
      setFriends(sorted);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setFriends([]);
      setLoading(false);
    }
  };

  const sendRequest = async (friendId) => {
    try {
        const token = localStorage.getItem("access_token");
      await axios.post(`http://127.0.0.1:8000/api/game-request/${friendId}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
      alert("Game request sent!");
    } catch (err) {
      alert(err.response?.data?.detail || "Error sending request");
    }
  };

  useEffect(() => {
    fetchFriends();
    const interval = setInterval(fetchFriends, 10000); // poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Loading friends...</div>;

  return (
  <>
    <div className="friends-box">
      <h3>Friends Online</h3>
      {friends.length === 0 ? (
        <p>No friends available.</p>
      ) : (
        friends.map((f) => (
          <div key={f.id} className="friend-item">
            <span
              className={f.status === "online" ? "online-dot" : "offline-dot"}
            ></span>
            {f.username} ({f.status})
            <button onClick={() => sendRequest(f.id)}>Play</button>
          </div>
        ))
      )}
    </div>
    
    <FriendRequests />
  </>
);
}
