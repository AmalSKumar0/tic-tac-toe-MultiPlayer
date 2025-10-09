// src/components/GameChat.jsx

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // 1. Import jwt-decode

function GameChat() {
  const { gameId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(''); // 2. State for the current user
  const gameSocket = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token || !gameId) return;

    // 3. Decode the token to get the current user's username
    const decodedToken = jwtDecode(token);
    setCurrentUser(decodedToken.username); // Adjust if your payload key is different

    gameSocket.current = new WebSocket(
      `ws://127.0.0.1:8000/ws/game/${gameId}/?token=${token}`
    );

    gameSocket.current.onopen = () => console.log(`Chat socket for game ${gameId} connected!`);
    gameSocket.current.onclose = () => console.log("Chat socket disconnected.");

    gameSocket.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages(prevMessages => [...prevMessages, {
          sender: data.sender,
          message: data.message,
      }]);
    };

    return () => {
      if (gameSocket.current) gameSocket.current.close();
    };
  }, [gameId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && gameSocket.current?.readyState === WebSocket.OPEN) {
      gameSocket.current.send(JSON.stringify({ 'message': newMessage }));
      setNewMessage('');
    }
  };

  return (
    <div className="chat-box">
      <h3>Game Chat</h3>
      <div className="messages-container">
        {/* 4. Dynamically assign CSS classes */}
        {messages.map((msg, index) => {
          const messageClass = msg.sender === currentUser ? 'message-sent' : 'message-received';
          return (
            <div key={index} className={`message-wrapper ${messageClass}`}>
              <div className="message-bubble">
                <strong>{msg.sender}:</strong> {msg.message}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="message-form">
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
  );
}

export default GameChat;