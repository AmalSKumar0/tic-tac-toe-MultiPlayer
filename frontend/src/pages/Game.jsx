// src/pages/Game.jsx
import GameChat from '../components/GameChat';
import TicTacToeGame from '../components/TicTacTOEGame'; // Import the new component

function Game() {
  return (
    <div className="game-room-container">
      <div className="game-area">
        <TicTacToeGame /> 
      </div>
      <div className="chat-area">
        <GameChat />
      </div>
    </div>
  );
}

export default Game;