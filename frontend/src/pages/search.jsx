import { useState } from "react";
import axios from "axios";

export default function FriendSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]); // ensure initial state is array
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
  console.log("Search triggered, query:", query);
  if (!query) return;
  setLoading(true);
  try {
    const token = localStorage.getItem("access_token"); 
    const res = await axios.get(`/api/search-users/?q=${query}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(res.data); // debug: check what API returns
    setResults(Array.isArray(res.data) ? res.data : []);
  } catch (err) {
    console.error(err);
    setResults([]); // fallback to empty array
  }
  setLoading(false);
};


  const sendRequest = async (id) => {
  try {
    const token = localStorage.getItem("access_token");
    await axios.post(
      `/api/send-friend-request/${id}/`,
      {}, // empty body, because your API doesn't expect data
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    alert("Friend request sent!");
  } catch (err) {
    alert(err.response?.data?.detail || "Error sending request");
  }
};


  return (
    <div>
      <input
        type="text"
        placeholder="Search friends..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>

      {loading && <p>Searching...</p>}

      <ul>
        {Array.isArray(results) && results.length > 0 ? (
          results.map((user) => (
            <li key={user.id}>
              {user.username}{" "}
              <button onClick={() => sendRequest(user.id)}>Add Friend</button>
            </li>
          ))
        ) : (
          <p>No users found.</p>
        )}
      </ul>
    </div>
  );
}
