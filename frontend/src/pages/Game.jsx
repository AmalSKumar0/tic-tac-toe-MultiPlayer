// src/pages/Game.jsx

import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import GameChat from '../components/GameChat';
import GameBoard from '../components/GameBoard';
import FloatingIcons from '../components/FloatingIcons';
function Game() {
  const { gameId } = useParams(); // Get gameId from URL
  const gameSocket = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    // Connect to the specific game WebSocket
    gameSocket.current = new WebSocket(
      `ws://127.0.0.1:8000/ws/game/${gameId}/?token=${token}`
    );

    gameSocket.current.onopen = () => console.log(`Game socket for ${gameId} connected!`);
    gameSocket.current.onclose = () => console.log("Game socket disconnected.");

    gameSocket.current.onmessage = (event) => {
      console.log("Game message received:", event.data);
    };

    return () => {
      if (gameSocket.current) {
        gameSocket.current.close();
      }
    };
  }, [gameId]);

  return (
    <div className="game-room">
       <GameBoard />
      <FloatingIcons />
      <GameChat />
    </div>
  );
}

export default Game;