// src/components/TicTacToeGame.jsx

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Cell from './Cells';
import '../assets/TicTacToe.css';

function TicTacToeGame() {
  const { gameId } = useParams();
  const [board, setBoard] = useState(Array(9).fill(null));
  const [player, setPlayer] = useState(null); // 'X' or 'O'
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [currentUser, setCurrentUser] = useState('');
  const gameSocket = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    const decoded = jwtDecode(token);
    setCurrentUser(decoded.username);

    gameSocket.current = new WebSocket(
      `ws://127.0.0.1:8000/ws/game/${gameId}/?token=${token}`
    );

    gameSocket.current.onopen = () => console.log("Game socket connected!");

    gameSocket.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("RAW MESSAGE FROM SERVER:", data);
      // Server assigns player role ('X' or 'O') on connect
      if (data.type === 'player_assignment') {
        setPlayer(data.player);
        setIsMyTurn(data.player === 'X'); // 'X' always goes first
      }

      // Opponent made a move, update the board
      if (data.type === 'game_move') {
        setBoard(data.board);
        setIsMyTurn(true); // It's now my turn
      }
    };

    return () => gameSocket.current.close();
  }, [gameId]);

  const handleClick = (index) => {
    // Ignore click if it's not my turn or the cell is filled
    if (!isMyTurn || board[index]) {
      return;
    }

    const newBoard = board.slice();
    newBoard[index] = player;
    setBoard(newBoard);
    setIsMyTurn(false); // It's now the opponent's turn

    // Send the move to the server
    gameSocket.current.send(JSON.stringify({
      'type': 'game_move',
      'board': newBoard,
    }));
  };

  return (
    <div className="container">
      <div className="header"><h1>TIC TAC TOE</h1></div>
      <div className="game-status">
        You are Player: {player} <br/>
        {isMyTurn ? "Your Turn" : "Opponent's Turn"}
      </div>
      <div className="game-board-wrapper">
        <div className="game-board">
          {board.map((value, index) => (
            <Cell key={index} value={value} onClick={() => handleClick(index)} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default TicTacToeGame;