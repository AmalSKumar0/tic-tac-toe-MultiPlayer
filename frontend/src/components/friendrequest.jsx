import { useEffect, useState } from "react";
import axios from "axios";

export default function FriendRequests() {
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    const token = localStorage.getItem("access_token");
    const res = await axios.get("/api/friend-requests/", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setRequests(res.data);
  };

  const handleRequest = async (id, action) => {
    const token = localStorage.getItem("access_token");
    const url =
      action === "accept"
        ? `/api/accept-friend-request/${id}/`
        : `/api/reject-friend-request/${id}/`;

    await axios.post(url, {}, { headers: { Authorization: `Bearer ${token}` } });
    fetchRequests(); // refresh list after action
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div>
      <h3>Friend Requests</h3>
      {requests.length === 0 && <p>No requests</p>}
      <ul>
        {requests.map((r) => (
          <li key={r.id}>
            {r.from}{" "}
            <button onClick={() => handleRequest(r.id, "accept")}>
              Accept
            </button>{" "}
            <button onClick={() => handleRequest(r.id, "reject")}>
              Reject
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
