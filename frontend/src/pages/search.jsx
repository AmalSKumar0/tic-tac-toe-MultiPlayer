import { useState } from "react";
import axios from "axios";
import "../styles/search.css";
import FloatingIcons from '../components/FloatingIcons';
const Url = import.meta.env.VITE_API_URL;

export default function FriendSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    console.log("Search triggered, query:", query);
    if (!query) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;
      const res = await axios.get(`${Url}/api/search-users/?q=${query}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      });
      console.log(res.data);
      setResults(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      // Optionally show an error message
      setResults([]);
    }
    setLoading(false);
  };

  const sendRequest = async (id) => {
    try {
      const token = localStorage.getItem("access_token");
      await axios.post(
        `/api/send-friend-request/${id}/`,
        {}, // empty body
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Update results to show the user that the request was sent
      setResults((prev) =>
        prev.map((user) =>
          user.id === id ? { ...user, requestSent: true } : user
        )
      );
      alert("Friend request sent!");
    } catch (err) {
      alert(err.response?.data?.detail || "Error sending request");
    }
  };

  return (
    // Outer container for the search functionality, styled like a mini-panel
    <div className="friend-search-container"> 
      
      {/* Search Input Area - Mimics chat-input-area from tictactoe.css */}
      <div className="search-input-area">
        <input
          type="text"
          placeholder="Search users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          // Use a class to style the input field
          className="search-input-field" 
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
        />
        <button 
          onClick={handleSearch}
          // Use the general Button style and give it a specific look
          className="Button search-button" 
        >
          🔍 Search
        </button>
      </div>

      {/* Results and Loading Area - Mimics requests-list/friends-list for scroll and look */}
      <div className="search-results-list">
        {loading && <p className="loading-text">Searching...</p>}

        {/* Use a list for the results */}
        <ul className="search-results-ul">
          {Array.isArray(results) && results.length > 0 ? (
            results.map((user) => (
              <li key={user.id} className="search-result-item">
                <span className="user-username">
                  {user.username}
                </span>
                <button 
                  onClick={() => sendRequest(user.id)}
                  // Use a distinct button style for the action
                  className={`send-request-btn ${user.requestSent ? 'sent-disabled' : ''}`}
                  disabled={user.requestSent}
                >
                  {user.requestSent ? 'Request Sent' : 'Add Friend'}
                </button>
              </li>
            ))
          ) : (
            !loading && <p className="no-results-text">No users found. Try searching by full username.</p>
          )}
        </ul>
      </div>
            <FloatingIcons />

    </div>
  );
}