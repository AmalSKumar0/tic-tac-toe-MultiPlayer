import { useEffect, useState, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import FriendRequests from "../components/friendrequest";
import GlobalChat from "../components/GlobalChat";

// Helper function to keep online friends at the top
const sortFriends = (friends) => {
  return [...friends].sort((a, b) => (b.status === "online") - (a.status === "online"));
};

export default function Home() {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gameInvite, setGameInvite] = useState(null);
  const presenceSocket = useRef(null);
  const navigate = useNavigate();

  const fetchFriends = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await axios.get("http://127.0.0.1:8000/api/friends/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFriends(sortFriends(Array.isArray(res.data) ? res.data : []));
    } catch (err) {
      console.error("Failed to fetch friends:", err);
      setFriends([]);
    } finally {
      setLoading(false);
    }
  };

  const sendGameRequest = async (friendId) => {
    try {
      const token = localStorage.getItem("access_token");
      await axios.post(
        `http://127.0.0.1:8000/api/game-request/${friendId}/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Game request sent!");
    } catch (err) {
      alert(err.response?.data?.detail || "Error sending request");
    }
  };

  useEffect(() => {
    fetchFriends();
    const token = localStorage.getItem("access_token");
    if (!token) return;

    presenceSocket.current = new WebSocket(`ws://127.0.0.1:8000/ws/presence/?token=${token}`);

    presenceSocket.current.onopen = () => console.log("Presence WebSocket connected!");
    presenceSocket.current.onclose = () => console.log("Presence WebSocket disconnected.");

    presenceSocket.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Presence message received:", data);

      switch (data.type) {
        case 'friend.status.update':
          setFriends((prevFriends) => {
            const updatedFriends = prevFriends.map((f) =>
              f.id === data.user_id ? { ...f, status: data.status } : f
            );
            return sortFriends(updatedFriends);
          });
          break;
        
        case 'game.invite':
          setGameInvite({ sender: data.sender });
          break;
        
        case 'game.start':
          navigate(`/game/${data.game_id}`);
          break;

        case "friend.request.accepted":
          alert(`${data.recipient.username} accepted your friend request!`);
          fetchFriends(); // Refetch friends list
          break;
      }
    };

    return () => {
      if (presenceSocket.current) {
        presenceSocket.current.close();
      }
    };
  }, [navigate]); // Added navigate to dependency array for correctness

  const handleAcceptInvite = () => {
    if (gameInvite && presenceSocket.current) {
      presenceSocket.current.send(JSON.stringify({
        'action': 'accept_game_invite',
        'sender_id': gameInvite.sender.id,
      }));
      setGameInvite(null);
    }
  };

  const handleDeclineInvite = () => {
    setGameInvite(null);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <>
      {gameInvite && (
        <div className="game-invite-notification">
          <p>Game invite from <strong>{gameInvite.sender.username}</strong>!</p>
          <button onClick={handleAcceptInvite}>Accept</button>
          <button onClick={handleDeclineInvite}>Decline</button>
        </div>
      )}

      <div className="home-container">
        <div className="left-panel">
          <div className="friends-box">
            <h3>Friends</h3>
            {friends.length > 0 ? (
              friends.map((f) => (
                <div key={f.id} className="friend-item">
                  <span className={f.status === "online" ? "online-dot" : "offline-dot"}></span>
                  {f.username} ({f.status})
                  {f.status === "online" && (
                    <button onClick={() => sendGameRequest(f.id)}>Play</button>
                  )}
                </div>
              ))
            ) : (
              <p>No friends available.</p>
            )}
          </div>
          <FriendRequests />
        </div>
        <div className="right-panel">
          <GlobalChat />
        </div>
      </div>
    </>
  );
}