import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import SocialPanel from "../components/SocialPanel"; 
import HomeBoard from "../components/homeBoard";
import '../assets/home.css';
import GlobalChat from "../components/GlobalChat";
import FloatingIcons from '../components/FloatingIcons';
const Url = import.meta.env.VITE_API_URL;
const websocketUrl = import.meta.env.VITE_WEBSOCKET_URL;

export default function Home() {
  const [friends, setFriends] = useState([]);
  const [gameInvite, setGameInvite] = useState(null);
  const [newRequestTrigger, setNewRequestTrigger] = useState(0); // For real-time updates
  const presenceSocket = useRef(null);
  const navigate = useNavigate();

  const fetchFriends = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;
      
      const res = await axios.get(`${Url}/api/friends/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFriends(res.data || []); // Use res.data and fallback to an empty array
    } catch (err) {
      console.error("Failed to fetch friends:", err);
      setFriends([]); // Ensure it's an empty array on error
    }
  };
  const sendGameRequest = async (friendId) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      await axios.post(
        `${Url}/api/game-request/${friendId}/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Game request sent!");
    } catch (err) {
      alert(err.response?.data?.detail || "Error sending request");
    }
  };

  const handleAcceptInvite = () => {
  // Check if there is a pending invite and if the WebSocket is connected
  if (gameInvite && presenceSocket.current) {
    // Send a message to the server with the action and the sender's ID
    presenceSocket.current.send(JSON.stringify({
      'action': 'accept_game_invite',
      'sender_id': gameInvite.sender.id,
    }));
    
    // Hide the invite notification UI
    setGameInvite(null);
  }
};

const handleDeclineInvite = () => {
  // Simply hide the invite notification UI
  setGameInvite(null);
};

  useEffect(() => {
    fetchFriends();
    const token = localStorage.getItem("access_token");
    if (!token) return;
    
    presenceSocket.current = new WebSocket(`${websocketUrl}/ws/presence/?token=${token}`);

    presenceSocket.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      switch (data.type) {
        case 'friend.status.update':
        console.log(`Status update for ${data.username}: ${data.status}`);
        setFriends(prevFriends => 
          prevFriends.map(friend => 
            friend.id === data.user_id 
              ? { ...friend, status: data.status }
              : friend                         
          )
        );
        break;
        case 'friend.request.new':
          setNewRequestTrigger(Date.now()); // Trigger the SocialPanel to update
          break;
        case 'friend.request.accepted':
          fetchFriends(); // Your friend list changed, so refetch it
          break;
        case 'game.invite':
          setGameInvite({ sender: data.sender });
          break;
        case 'game.start':
          navigate(`/game/${data.game_id}`);
          break;
      }
    };
     return () => {
    if (presenceSocket.current) {
        presenceSocket.current.close();
    }
  };
  }, [navigate]);

  return (
    <div className="home-container">
      {gameInvite && (
  <div className="game-invite-notification">
    <div className="invite-content">
      <p>
        <strong>{gameInvite.sender.username}</strong> has invited you to a game!
      </p>
      <div className="invite-actions">
        <button onClick={handleAcceptInvite} className="accept-btn">Accept</button>
        <button onClick={handleDeclineInvite} className="decline-btn">Decline</button>
      </div>
    </div>
  </div>
)}
      
      
      <SocialPanel 
        friends={friends}
        sendGameRequest={sendGameRequest}
        newRequestTrigger={newRequestTrigger}
        onFriendAction={() => fetchFriends()} 
      />
      <FloatingIcons />
      <GlobalChat />
      <HomeBoard />
    </div>
  );
}


