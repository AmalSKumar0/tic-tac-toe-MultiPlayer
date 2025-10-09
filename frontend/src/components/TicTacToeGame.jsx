// src/components/TicTacToeGame.jsx

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Cell from './Cells';
import Confetti from 'react-confetti'; // 1. Import Confetti
import '../assets/TicTacToe.css';
import FloatingIcons from './FloatingIcons';

function TicTacToeGame() {
  const { gameId } = useParams();
  const [board, setBoard] = useState(Array(9).fill(null));
  const [player, setPlayer] = useState(null);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [currentUser, setCurrentUser] = useState('');
  
  const [showConfetti, setShowConfetti] = useState(false);
  const [backgroundFlash, setBackgroundFlash] = useState(''); // 'lose' or 'draw'

  const gameSocket = useRef(null);

  // ... (The resetGameState function is the same)
  const resetGameState = () => {
    setBoard(Array(9).fill(null));
    setGameOver(false);
    setWinner(null);
    setShowConfetti(false); 
    setBackgroundFlash('');
    setIsMyTurn(player === 'X'); 
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    const decoded = jwtDecode(token);
    setCurrentUser(decoded.username); // Ensure your token has a 'username' payload

    // ... (WebSocket connection logic is the same)
    gameSocket.current = new WebSocket(
      `ws://127.0.0.1:8000/ws/game/${gameId}/?token=${token}`
    );

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

          // --- 3. Trigger Visual Effects ---
          if (data.winner === player) {
            // I won
            setShowConfetti(true);
          } else if (data.winner === 'Draw') {
            // It's a draw
            setBackgroundFlash('draw');
          } else {
            // I lost
            setBackgroundFlash('lose');
          }
          // Reset the flash effect after 2 seconds
          break;
        case 'restart_game':
          resetGameState();
          break;
        default:
          break;
      }
    };
    
    return () => {
        if (gameSocket.current) {
          gameSocket.current.close();
        }
    };
  }, [gameId, player]);

  const handleClick = (index) => {
    if (!isMyTurn || board[index] || gameOver) {
      return;
    }

    const newBoard = [...board];
    newBoard[index] = player;
    setBoard(newBoard);
    setIsMyTurn(false);

    gameSocket.current.send(JSON.stringify({
      type: 'game_move',
      board: newBoard,
    }));
  };
  
  const getStatusMessage = () => {
    if (winner) {
      if (winner === 'Draw') return "It's a Draw!";
      return winner === player ? "You Won!" : "You Lost!";
    }
    if (!player) return "Waiting for opponent...";
    return isMyTurn ? "Your Turn" : "Opponent's Turn";
  };
  
  const handlePlayAgain = () => {
    gameSocket.current.send(JSON.stringify({ 'type': 'play_again' }));
  };


  return (
    // You can use a React Fragment <> to wrap the two divs
    <>
      {/* 1. THIS IS THE NEW DIV FOR THE FULL-SCREEN EFFECT */}
      <div className={`background-flash ${backgroundFlash}`}></div>

      {/* 2. Your container no longer needs the dynamic class */}
      <div className="container">
        <div className="confetti">
          {showConfetti && <Confetti />}
        </div>
        <div className="header">
          <h1>TIC TAC TOE</h1>
          <div className="game-status">
            {gameOver ? (
              getStatusMessage()
            ) : (
              <div>You are Player: {player}</div>
            )}
          </div>
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
              <div className="play-again-container">
                <button className="Button" onClick={handlePlayAgain}>Play Again</button>
              </div>
            ) : (
              getStatusMessage()
            )}
          </div>
        </div>
        <FloatingIcons />
      </div>
    </>
  );
}

export default TicTacToeGame;