import React, { useState, useEffect } from "react";
import api from "../api/axios";

const UserSearch = () => {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [invites, setInvites] = useState([]);

  useEffect(() => {
    getInvites();
  }, []);

  const getInvites = async () => {
    try {
      const res = await api.get("/invitations/all");
      setInvites(res.data.sent || []);
    } catch (err) {
      console.log("Invite fetch error:", err);
    }
  };

  // search users
  useEffect(() => {
    if (!query) {
      setUsers([]);
      return;
    }

    const timer = setTimeout(() => {
      searchUsers();
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const searchUsers = async () => {
    try {
      const res = await api.get(`/users/search?query=${query}`);
      setUsers(res.data.users || []);
    } catch (err) {
      console.log("Search error:", err);
      setUsers([]);
    }
  };

  // UPDATED SEND INVITE  
  const sendInvite = async (userId) => {
    try {
      await api.post("/invitations/send", {
        receiverIds: [userId],
      });

      
      setInvites((prev) => [
        ...prev,
        {
          receiver: { _id: userId },
          status: "pending",
        },
      ]);

    } catch (err) {
      console.log("Send error:", err.response?.data || err.message);
    }
  };

  // status logic
  const getStatus = (userId) => {
    const invite = invites.find(
      (i) =>
        i?.receiver?._id === userId ||
        i?.receiverId === userId
    );

    if (!invite) return "invite";

    if (invite.status === "pending") return "sent";
    if (invite.status === "accepted") return "friends";

    if (invite.status === "rejected") {
      const diff = Date.now() - new Date(invite.rejectedAt);
      if (diff < 86400000) return "rejected";
      return "invite";
    }

    return "invite";
  };

  return (
    <div className="max-w-md mx-auto mt-6">
      <input
        type="text"
        placeholder="Search users..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="border p-2 w-full mb-3 rounded"
      />

      {query && (
        <div className="border p-2 max-h-60 overflow-y-auto rounded bg-white">
          {users.length === 0 ? (
            <p className="text-gray-400 text-center">
              No users found
            </p>
          ) : (
            users.map((user) => {
              const status = getStatus(user._id);

              return (
                <div
                  key={user._id}
                  className="flex justify-between items-center p-2 hover:bg-gray-50"
                >
                  <div>
                    <p>{user.username}</p>
                    <p className="text-sm text-gray-500">
                      {user.email}
                    </p>
                  </div>

                  {/* BUTTON UI */}
                  {status === "invite" && (
                    <button
                      onClick={() => sendInvite(user._id)}
                      className="bg-indigo-600 text-white px-3 py-1 rounded"
                    >
                      Invite
                    </button>
                  )}

                  {status === "sent" && (
                    <button
                      disabled
                      className="bg-gray-400 text-white px-3 py-1 rounded"
                    >
                      Sent
                    </button>
                  )}

                  {status === "friends" && (
                    <span className="text-blue-500 text-sm">
                      Friends
                    </span>
                  )}

                  {status === "rejected" && (
                    <span className="text-red-500 text-sm">
                      Rejected
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default UserSearch;