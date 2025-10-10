// src/components/GlobalChat.jsx

import { useState, useEffect, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';
import 'boxicons/css/boxicons.min.css';
// Make sure your main CSS file is imported
// import '../assets/YourStyles.css';
const websocketUrl = import.meta.env.VITE_WEBSOCKET_URL;

function GlobalChat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState('');

  // --- State for UI control (same as GameChat) ---
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const socket = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    // Decode token to identify the current user's messages
    const decodedToken = jwtDecode(token);
    setCurrentUser(decodedToken.username);
    
    socket.current = new WebSocket(`${websocketUrl}/ws/chat/?token=${token}`);

    socket.current.onopen = () => console.log("Global chat WebSocket connected!");
    socket.current.onclose = () => console.log("Global chat WebSocket disconnected.");

    socket.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages(prevMessages => [...prevMessages, data]);

      // --- Notification Logic ---
      if (!isChatVisible) {
        setUnreadCount(prevCount => prevCount + 1);
      }
    };

    return () => {
      if (socket.current) {
        socket.current.close();
      }
    };
  }, [isChatVisible]); // Dependency array updated for notification logic

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && socket.current?.readyState === WebSocket.OPEN) {
      socket.current.send(JSON.stringify({ 'message': newMessage }));
      setNewMessage('');
    }
  };
  
  // --- UI Control Functions ---
  const handleOpenChat = () => {
    setUnreadCount(0);
    setIsChatVisible(true);
  };

  return (
    <>
      {/* Toggle Button - Using a 'globe' icon for global chat */}
      <button 
        className="chat-toggle-button" 
        onClick={handleOpenChat}
      >
        <i className='bx bx-globe'></i>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {/* The Chat Box - structure is identical to GameChat */}
      <div className={`chat-box ${isChatVisible ? 'visible' : ''}`}>
        <div className="chat-header">
          <h3>GLOBAL CHAT</h3>
          <button 
            className="chat-close-button"
            onClick={() => setIsChatVisible(false)}
          >
            ×
          </button>
        </div>
        
        <div className="chat-messages">
          {messages.map((msg, index) => {
            // Distinguish between messages sent by you and by others
            const messageClass = msg.username === currentUser ? 'sent' : 'received';
            return (
              <div key={index} className={`message ${messageClass}`}>
                <strong>{msg.username}:</strong> {msg.message}
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

export default GlobalChat;