import React from "react";
import { Link } from "react-router-dom";

const Home = () => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "5rem" }}>
        <h1>Welcome to TikTakToe!</h1>
        <p>Play a fun game of Tic Tac Toe with your friends.</p>
        <Link to="/game">
            <button style={{ padding: "1rem 2rem", fontSize: "1.2rem", cursor: "pointer" }}>
                Start Game
            </button>
        </Link>
    </div>
);

export default Home;