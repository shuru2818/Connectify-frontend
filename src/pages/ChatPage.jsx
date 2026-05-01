import React, { useState, useEffect } from "react";
import UsersList from "../components/UsersList";
import ChatWindow from "../components/ChatWindow";
import { connectSocket, addUser } from "../socket";
import api from "../api/axios";

const ChatPage = () => {
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user?._id) {
      connectSocket();
      addUser(user._id);
      console.log("Socket connected");
    }
  }, []);

  // 🔥 MAIN FIX
  const handleSelectUser = async (user) => {
    try {
      const res = await api.post("/chats/access", {
        receiverId: user._id,
      });

      // 👇 chatId attach karo
      setSelectedUser({
        ...user,
        chatId: res.data._id,
      });

    } catch (err) {
      console.error("CHAT ERROR:", err);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      
      {/* 👇 yaha change */}
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