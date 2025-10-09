// src/components/GameBoard.jsx

import React, { useState } from 'react';
import Cell from './Cells';
import '../assets/tictactoe.css'; // We'll create this CSS file next

function GameBoard() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);

  const handleClick = (index) => {
    if (board[index]) return; // Ignore clicks on filled cells

    const newBoard = board.slice();
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);
  };

  const renderCell = (index) => {
    return <Cell value={board[index]} onClick={() => handleClick(index)} />;
  };

  const turn = isXNext ? 'X' : 'O';

  return (
    <div className="container">
      <div className="header">
        <div className="customizable-tag">NEW!</div>
        <h1>TIC TAC TOE</h1>
      </div>

      <div className="game-board-wrapper">
        <div className="game-board">
          {board.map((_, index) => renderCell(index))}
        </div>
      </div>
      
      <div className="hinge1"></div>
      <div className="hinge2"></div>
      
      <div className="game-board-bottom">
        <div className="turn-indicator">{turn} TURN</div>
      </div>
    </div>
  );
}

export default GameBoard;