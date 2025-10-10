import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import '../assets/TicTacToe.css';
import 'boxicons/css/boxicons.min.css';
const websocketUrl = import.meta.env.VITE_WEBSOCKET_URL;

function GameChat() {
  const { gameId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState('');
  const [isChatVisible, setIsChatVisible] = useState(false);

  // NEW: State to track unread messages
  const [unreadCount, setUnreadCount] = useState(0);

  const chatSocket = useRef(null);
  const messagesEndRef = useRef(null);

  // MODIFIED: Added isChatVisible to the dependency array.
  // This ensures the onmessage handler always knows if the chat is open or closed.
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token || !gameId) return;

    const decodedToken = jwtDecode(token);
    setCurrentUser(decodedToken.username);

    chatSocket.current = new WebSocket(
      `${websocketUrl}/ws/gameChat/${gameId}/?token=${token}`
    );

    chatSocket.current.onopen = () => console.log(`Chat socket connected!`);
    chatSocket.current.onclose = () => console.log("Chat socket disconnected.");

    chatSocket.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'game_chat_message') {
        const messagePayload = data.payload;
        setMessages(prevMessages => [...prevMessages, {
          id: messagePayload.id,
          sender: messagePayload.username,
          message: messagePayload.message,
        }]);

        // NEW: If chat is hidden, increment unread count
        if (!isChatVisible) {
          setUnreadCount(prevCount => prevCount + 1);
        }
      } else if (data.type === 'error') {
        console.error("Server Error:", data.payload.message);
      }
    };

    return () => {
      if (chatSocket.current) chatSocket.current.close();
    };
  }, [gameId, isChatVisible]); // Dependency array updated

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && chatSocket.current?.readyState === WebSocket.OPEN) {
      chatSocket.current.send(JSON.stringify({ 'message': newMessage }));
      setNewMessage('');
    }
  };

  // NEW: Function to handle opening the chat and resetting the count
  const handleOpenChat = () => {
    setUnreadCount(0);
    setIsChatVisible(true);
  };

  return (
    <>
      {/* MODIFIED: Bell button now handles opening and shows the badge */}
      <button 
        className="chat-toggle-button" 
        onClick={handleOpenChat}
      >
        <i className='bx bx-bell bx-tada-hover'></i> 
        {/* NEW: Notification badge appears when there are unread messages */}
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      <div className={`chat-box ${isChatVisible ? 'visible' : ''}`}>
        <div className="chat-header">
          <h3>GAME CHAT</h3>
          <button 
            className="chat-close-button"
            onClick={() => setIsChatVisible(false)}
          >
            ×
          </button>
        </div>
        
        <div className="chat-messages">
         {messages.map((msg) => {
  const messageClass = msg.sender === currentUser ? 'sent' : 'received';
  return (
    <div key={msg.id} className={`message ${messageClass}`}>
      <strong>{msg.sender}:</strong> {msg.message}
    </div>
  );
})}
          <div ref={messagesEndRef} />
        </div>
        
        <form onSubmit={handleSendMessage} className="chat-input-area">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            autoComplete="off"
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </>
  );
}

export default GameChat;