import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function GameChat() {
  const { gameId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState('');
  const chatSocket = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token || !gameId) return;

    const decodedToken = jwtDecode(token);
    setCurrentUser(decodedToken.username);

    // Using a more descriptive name for the WebSocket ref
    chatSocket.current = new WebSocket(
      `ws://127.0.0.1:8000/ws/gameChat/${gameId}/?token=${token}`
    );

    chatSocket.current.onopen = () => console.log(`Chat socket for game ${gameId} connected!`);
    chatSocket.current.onclose = () => console.log("Chat socket disconnected.");

    chatSocket.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("RAW MESSAGE FROM SERVER during chat:", data);

      // --- MAJOR CHANGE HERE ---
      // Check the message type before processing
      if (data.type === 'game_chat_message') {
        const messagePayload = data.payload;

        // Update the messages state using the new payload structure
        setMessages(prevMessages => [...prevMessages, {
          id: messagePayload.id, // Use the unique ID for the key
          sender: messagePayload.username,
          message: messagePayload.message,
        }]);

      } else if (data.type === 'error') {
        // Now you can also handle errors sent from the server
        console.error("Server Error:", data.payload.message);
      }
    };

    return () => {
      if (chatSocket.current) chatSocket.current.close();
    };
  }, [gameId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && chatSocket.current?.readyState === WebSocket.OPEN) {
      // The message format sent to the server remains simple
      chatSocket.current.send(JSON.stringify({ 'message': newMessage }));
      console.log("Sent message:", newMessage, JSON.stringify({ 'message': newMessage }));
      setNewMessage('');
    }
  };

  return (
    <div className="chat-box">
      <h3>Game Chat</h3>
      <div className="messages-container">
        {messages.map((msg) => {
          const messageClass = msg.sender === currentUser ? 'message-sent' : 'message-received';
          return (
            // --- Use the unique message ID as the key ---
            <div key={msg.id} className={`message-wrapper ${messageClass}`}>
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

