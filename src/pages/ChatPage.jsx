import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";   // 👈 ADD THIS
import UsersList from "../components/UsersList";
import ChatWindow from "../components/ChatWindow";
import { connectSocket } from "../socket";
import api from "../api/axios";

const ChatPage = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const navigate = useNavigate();   

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user?._id) {
      // connectSocket();
      connectSocket(user._id);
      console.log("Socket connected");
    }
  }, []);

  const handleSelectUser = async (user) => {
    try {
      const res = await api.post("/chats/access", {
        receiverId: user._id,
      });

      setSelectedUser({
        ...user,
        chatId: res.data._id,
      });

    } catch (err) {
      console.error("CHAT ERROR:", err);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 relative">

      {/* 🔙 BACK BUTTON */}
      <button
        onClick={() => navigate("/")} 
        className="absolute top-4 left-3  bg-white shadow px-3 py-2 rounded-full hover:bg-gray-200"
      >
        ←
      </button>

      <UsersList onSelectUser={handleSelectUser} />

      {selectedUser ? (
        <ChatWindow selectedUser={selectedUser} />
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          Select a user to start chatting
        </div>
      )}
    </div>
  );
};

export default ChatPage;