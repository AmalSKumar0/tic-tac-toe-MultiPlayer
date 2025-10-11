import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Confetti from 'react-confetti';
const websocketUrl = import.meta.env.VITE_WEBSOCKET_URL;
import Cell from './Cells';
import Notification from './Notification';
import FloatingIcons from './FloatingIcons';
import '../assets/tictactoe.css';

function TicTacToeGame() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  
  // Game State
  const [board, setBoard] = useState(Array(9).fill(null));
  const [player, setPlayer] = useState(null); // 'X' or 'O'
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);

  // UI State
  const [notification, setNotification] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [backgroundFlash, setBackgroundFlash] = useState('');

  const gameSocket = useRef(null);

  // Resets the game to its initial state for a new round
  const resetGameState = () => {
    setBoard(Array(9).fill(null));
    setGameOver(false);
    setWinner(null);
    setNotification(null);
    setShowConfetti(false);
    setBackgroundFlash('');
    setIsMyTurn(player === 'X'); // 'X' always starts
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate('/login');
      return;
    }

    // Connect to the game-specific WebSocket
    gameSocket.current = new WebSocket(
      `${websocketUrl}/ws/game/${gameId}/?token=${token}`
    );

    gameSocket.current.onopen = () => console.log(`Game socket for ${gameId} connected!`);
    gameSocket.current.onclose = () => console.log("Game socket disconnected.");

    // This is the main listener for all real-time game events
    gameSocket.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'player_assignment':
          setPlayer(data.player);
          setIsMyTurn(data.player === 'X');
          break;

        case 'game_move':
          setBoard(data.board);
          setIsMyTurn(true);
          break;

        case 'game_over':
          setBoard(data.board);
          setWinner(data.winner);
          setGameOver(true);
          setIsMyTurn(false);
          // Trigger visual effects
          if (data.winner === player) setShowConfetti(true);
          else if (data.winner === 'Draw') setBackgroundFlash('draw');
          else setBackgroundFlash('lose');
          setTimeout(() => setBackgroundFlash(''), 2000);
          break;

        case 'restart_game':
          resetGameState();
          break;

        case 'opponent_left':
          setNotification({
            message: 'Your opponent has left the game.',
            actions: [{ label: 'Back to Lobby', onClick: handleBackToLobby, className: 'Button secondary' }],
          });
          setGameOver(true);
          break;
        
        default:
          break;
      }
    };
    
    // Cleanup on component unmount
    return () => {
      if (gameSocket.current) gameSocket.current.close();
    };
  }, [gameId, player, navigate]); // Dependencies for the effect

  // --- Event Handlers ---

  const handleClick = (index) => {
    if (!isMyTurn || board[index] || gameOver) return;
    const newBoard = [...board];
    newBoard[index] = player;
    setBoard(newBoard);
    setIsMyTurn(false);
    gameSocket.current.send(JSON.stringify({ type: 'game_move', board: newBoard }));
  };
  
  const handlePlayAgain = () => {
    gameSocket.current.send(JSON.stringify({ 'type': 'play_again' }));
  };

  const handleSurrender = () => {
    if (!gameOver) {
      gameSocket.current.send(JSON.stringify({ 'type': 'surrender' }));
    }
  };

  const handleBackToLobby = () => {
    if (gameSocket.current) {
      gameSocket.current.send(JSON.stringify({ 'type': 'leave_game' }));
    }
    navigate('/');
  };

  const getStatusMessage = () => {
    if (winner) {
      if (winner === 'Draw') return "It's a Draw!";
      return winner === player ? "You Won!" : "You Lost!";
    }
    return "";
  };

  return (
    <>
      <div className={`background-flash ${backgroundFlash}`}></div>
      <Notification message={notification?.message} actions={notification?.actions} />
      {showConfetti && <Confetti />}
      
      <div className="container">
        <div className="header">
          <h1>TIC TAC TOE</h1>
          {gameOver ? (
              <span className="game-over-message">{getStatusMessage()}</span>
            ) : (
               <div className="game-status">You are Player: {player || '...'}</div>
            )}
        </div>
        
        <div className="game-board-wrapper">
          <div className="game-board">
            {board.map((value, index) => (
              <Cell key={index} value={value} onClick={() => handleClick(index)} />
            ))}
          </div>
        </div>
        
        <div className="hinge1"></div>
        <div className="hinge2"></div>
        
        <div className="game-board-bottom">
          <div className="turn-indicator">
            {gameOver ? (
              <div className="game-over-controls">
                {!notification && (
                  <button className="Button" onClick={handlePlayAgain}>Play Again</button>
                )}
                <button className="Button" onClick={handleBackToLobby}>Back to Lobby</button>
              </div>
            ) : (
              isMyTurn ? "Your Turn" : "Opponent's Turn"
            )}
          </div>
        </div>

        {!gameOver && (
          <div className="surrender-container">
            <button onClick={handleSurrender} className="Button">Surrender</button>
          </div>
        )}
        <FloatingIcons />
      </div>
    </>
  );
}

export default TicTacToeGame;