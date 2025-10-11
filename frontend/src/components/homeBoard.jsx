
import React from 'react';
import '../assets/tictactoe.css'; 

function HomeBoard() {
  return (
    <>
      <div className="container">
        <div className="header">
            <div className="customizable-tag">NEW!</div>
            <h1>TIC TAC TOE</h1>
        </div>

        <div className="game-board-wrapper">
            <div className="game-board">
            <div className="cell cell-o"></div>
                <div className="cell cell-empty">2</div>
                <div className="cell cell-x"></div>
                <div className="cell cell-empty">4</div>
                <div className="cell cell-x"></div>
                <div className="cell cell-empty">6</div>
                <div className="cell cell-o"></div>
                <div className="cell cell-empty">8</div>
                <div className="cell cell-o"></div>
          </div>
        </div>
        <div className="hinge1"></div>
        <div className="hinge2"></div>
        <div className="game-board-bottom">
        <div className="turn-indicator">Welcome</div>
        </div>
      </div>
    </>
  );
}
export default HomeBoard;