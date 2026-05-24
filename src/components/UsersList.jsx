import React, { useEffect, useState } from "react";
import api from "../api/axios";
import socket, { connectSocket, onReceiveMessage } from "../socket";
import { useNavigate } from "react-router-dom";

const UsersList = ({ onSelectUser, selectedUser }) => {
  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  // ✅ UNSEEN MESSAGES
  const [unseenMessages, setUnseenMessages] = useState({});

  // ✅ LAST MESSAGES
  const [lastMessages, setLastMessages] = useState({});

  const currentUser = JSON.parse(localStorage.getItem("user"));

  // SOCKET CONNECT
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    connectSocket();

    socket.on("connect", () => {
      if (user) {
        socket.emit("addUser", user._id);
      }
    });

    return () => socket.off("connect");
  }, []);

  // ONLINE USERS
  useEffect(() => {
    socket.on("onlineUsers", (data) => {
      setOnlineUsers(data);
    });

    return () => socket.off("onlineUsers");
  }, []);

  // ✅ RECEIVE MESSAGE
  useEffect(() => {
    const cleanup = onReceiveMessage((data) => {
      // ✅ FIND OTHER USER ID
      const otherUserId =
        data.sender?._id === currentUser._id
          ? data.receiverId
          : data.sender?._id;

      // ✅ LAST MESSAGE UPDATE
      setLastMessages((prev) => ({
        ...prev,

        [otherUserId]:
          data.type === "image"
            ? "📷 Photo"
            : data.type === "file"
              ? "📎 File"
              : data.sender?._id === currentUser._id
                ? `You: ${data.content}`
                : data.content,
      }));

      // ✅ CURRENT CHAT OPEN
      const isCurrentChatOpen = selectedUser?._id === data.sender?._id;

      // ✅ CHAT OPEN + TAB ACTIVE
      // TOH UNREAD COUNT MAT BADHAO
      if (isCurrentChatOpen && document.visibilityState === "visible") {
        return;
      }

      // ✅ ONLY FOR INCOMING MSG
      if (data.sender?._id !== currentUser._id) {
        setUnseenMessages((prev) => ({
          ...prev,

          [data.sender?._id]: (prev[data.sender?._id] || 0) + 1,
        }));
      }
    });

    return cleanup;
  }, [selectedUser]);

  // FETCH USERS
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get(`/users/search?query=${search || "a"}`);

        setUsers(res.data.users);
      } catch (err) {
        console.log(err);
      }
    };

    fetchUsers();
  }, [search]);

  return (
    <div className="w-[370px] h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 border-r border-slate-200 flex flex-col overflow-hidden relative">
      {/* BACKGROUND BLUR */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-indigo-400/10 blur-3xl rounded-full"></div>

      {/* HEADER */}
      <div className="relative z-10 p-5 border-b border-slate-200 bg-white/70 backdrop-blur-xl">
        {/* TOP */}
        <div className="flex items-center justify-between mb-5">
          {/* LEFT */}
          <div className="flex items-center gap-3">
            {/* BACK BUTTON */}
            <button className="w-11 h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 text-lg transition-all duration-300 hover:scale-105 active:scale-95" onClick={() => navigate(-1)}>
              ←
            </button>

            {/* TITLE */}
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                Messages
              </h2>
            </div>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-14 rounded-2xl bg-slate-100 border border-slate-200 pl-14 pr-5 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />

          {/* SEARCH ICON */}
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
            🔍
          </span>
        </div>
      </div>

      {/* USERS LIST */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
        {users.length > 0 ? (
          users.map((user) => {
            const isSelected = selectedUser?._id === user._id;

            const isOnline = onlineUsers.includes(user._id);

            return (
              <div
                key={user._id}
                onClick={() => {
                  // RESET UNREAD
                  setUnseenMessages((prev) => ({
                    ...prev,
                    [user._id]: 0,
                  }));

                  onSelectUser(user);
                }}
                className={`group relative flex items-center justify-between p-4 rounded-3xl cursor-pointer transition-all duration-300 border overflow-hidden ${
                  isSelected
                    ? "bg-gradient-to-r from-indigo-500 to-blue-500 border-transparent shadow-2xl scale-[1.01]"
                    : "bg-white border-slate-200 hover:shadow-lg hover:-translate-y-1 hover:bg-slate-50"
                }`}
              >
                {/* LEFT SIDE */}
                <div className="flex items-center gap-4 overflow-hidden">
                  {/* PROFILE */}
                  <div className="relative shrink-0">
                    <img
                      src={
                        user.profilePic
                          ? user.profilePic
                          : `https://ui-avatars.com/api/?name=${user.username}&background=random`
                      }
                      alt={user.username}
                      className={`w-14 h-14 rounded-2xl object-cover border-2 ${
                        isSelected ? "border-white" : "border-slate-200"
                      }`}
                    />

                    {/* ONLINE STATUS */}
                    <span
                      className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-[3px] ${
                        isSelected ? "border-indigo-500" : "border-white"
                      } ${isOnline ? "bg-green-500" : "bg-slate-400"}`}
                    />
                  </div>

                  {/* USER INFO */}
                  <div className="overflow-hidden">
                    {/* NAME */}
                    <h3
                      className={`font-bold text-[15px] truncate ${
                        isSelected ? "text-white" : "text-slate-800"
                      }`}
                    >
                      {user.username}
                    </h3>

                    {/* LAST MESSAGE */}
                    <p
                      className={`text-sm truncate mt-1 max-w-[180px] ${
                        isSelected ? "text-indigo-100" : "text-slate-500"
                      }`}
                    >
                      {lastMessages[user._id]
                        ? lastMessages[user._id]
                        : isOnline
                          ? "🟢 Online"
                          : "⚫ Offline"}
                    </p>
                  </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="flex flex-col items-end justify-between gap-2">
                
                  {unseenMessages[user._id] > 0 && (
                    <div className="min-w-[24px] h-[24px] px-1 rounded-full bg-rose-500 flex items-center justify-center text-white text-xs font-bold shadow-lg animate-pulse">
                      {unseenMessages[user._id]}
                    </div>
                  )}
                </div>

                {/* ACTIVE GLOW */}
                {isSelected && (
                  <div className="absolute inset-0 rounded-3xl ring-2 ring-indigo-300/40"></div>
                )}
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            {/* ICON */}
            <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-5xl shadow-inner mb-6">
              💬
            </div>

            {/* TEXT */}
            <h3 className="text-2xl font-bold text-slate-700 mb-2">
              No Users Found
            </h3>

            <p className="text-slate-400 leading-7 max-w-[250px]">
              Try searching with another name or invite more friends to start
              chatting.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersList;
