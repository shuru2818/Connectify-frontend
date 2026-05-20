import React, { useState, useEffect } from "react";
import api from "../api/axios";

const UserSearch = () => {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [showResults, setShowResults] = useState(false);

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

  // SEARCH USERS
  useEffect(() => {
    if (!query.trim()) {
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

  // SEND INVITE
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

  // STATUS LOGIC
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
      const diff =
        Date.now() - new Date(invite.rejectedAt);

      if (diff < 86400000) return "rejected";

      return "invite";
    }

    return "invite";
  };

  return (
    <div className="relative w-full mt-5">

      {/* SEARCH INPUT */}
      <input
        type="text"
        placeholder="Search users..."
        value={query}
        onFocus={() => setShowResults(true)}
        onBlur={() => {
          setTimeout(() => {
            setShowResults(false);
          }, 200);
        }}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full h-12 px-4 rounded-2xl border border-slate-200 bg-white/90 backdrop-blur-xl shadow-lg outline-none focus:ring-2 focus:ring-indigo-500"
      />

      {/* SEARCH RESULTS */}
      {showResults && query && (
        <div className="absolute top-14 left-0 w-full bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden max-h-72 overflow-y-auto z-50">

          {users.length === 0 ? (

            <p className="text-gray-400 text-center py-5">
              No users found
            </p>

          ) : (

            users.map((user) => {
              const status = getStatus(user._id);

              return (
                <div
                  key={user._id}
                  className="flex justify-between items-center px-4 py-3 hover:bg-slate-50 transition border-b border-slate-100"
                >

                  {/* USER INFO */}
                  <div className="flex items-center gap-3">

                    <img
                      src={
                        user.profilePic ||
                        `https://ui-avatars.com/api/?name=${user.username}&background=random&color=fff`
                      }
                      alt={user.username}
                      className="w-10 h-10 rounded-full object-cover border"
                    />

                    <div>
                      <p className="font-semibold text-slate-800">
                        {user.username}
                      </p>

                      <p className="text-sm text-slate-400">
                        {user.email}
                      </p>
                    </div>

                  </div>

                  {/* BUTTONS */}
                  {status === "invite" && (
                    <button
                      onClick={() => sendInvite(user._id)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-xl text-sm font-medium transition"
                    >
                      Invite
                    </button>
                  )}

                  {status === "sent" && (
                    <button
                      disabled
                      className="bg-gray-300 text-white px-4 py-1.5 rounded-xl text-sm"
                    >
                      Sent
                    </button>
                  )}

                  {status === "friends" && (
                    <span className="text-blue-500 text-sm font-medium">
                      Friends
                    </span>
                  )}

                  {status === "rejected" && (
                    <span className="text-red-500 text-sm font-medium">
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