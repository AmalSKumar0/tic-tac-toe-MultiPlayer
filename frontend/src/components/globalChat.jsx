// src/components/GlobalChat.jsx

import { useState, useEffect, useRef } from 'react';

function GlobalChat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const socket = useRef(null);
  const messagesEndRef = useRef(null); // Ref to scroll to the bottom

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    // Connect to the global chat WebSocket
    socket.current = new WebSocket(`ws://127.0.0.1:8000/ws/chat/?token=${token}`);

    socket.current.onopen = () => console.log("Global chat WebSocket connected!");
    socket.current.onclose = () => console.log("Global chat WebSocket disconnected.");

    // Listen for new messages
    socket.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // Add the new message to the state
      setMessages(prevMessages => [...prevMessages, data]);
    };

    // Cleanup on component unmount
    return () => {
      if (socket.current) {
        socket.current.close();
      }
    };
  }, []);

  // Effect to scroll to the bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && socket.current?.readyState === WebSocket.OPEN) {
      socket.current.send(JSON.stringify({ 'message': newMessage }));
      setNewMessage(''); // Clear input after sending
    }
  };

  return (
    <div className="chat-box">
      <h3>Global Chat</h3>
      <div className="messages-container">
        {messages.map((msg, index) => (
          <div key={index} className="message">
            <strong>{msg.username}:</strong> {msg.message}
          </div>
        ))}
        <div ref={messagesEndRef} /> {/* Invisible element to scroll to */}
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

export default GlobalChat;