import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";    
import UsersList from "../components/UsersList";
import ChatWindow from "../components/ChatWindow";
import { connectSocket, onOnlineUsers} from "../socket";
import api from "../api/axios";

const ChatPage = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const navigate = useNavigate();   

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user?._id) {
      // connectSocket();
      connectSocket(user._id);
      console.log("Socket connected");
    }
  }, []);

  useEffect(() => {
    const cleanup = onOnlineUsers((users) => {
      setOnlineUsers(users);
    });

    return cleanup;
  }, []);

  useEffect(() => {
    if (selectedUser) {
      setSelectedUser((prev) => ({
        ...prev,
        isOnline: onlineUsers.includes(prev._id),
      }));
    }
  }, [onlineUsers]);

  const handleSelectUser = async (user) => {
    try {
      const res = await api.post("/chats/access", {
        receiverId: user._id,
      });

  const userRes = await api.get(`/users/${user._id}`);
      setSelectedUser({
        ...userRes.data.user,
        chatId: res.data._id,
      });
      console.log("Clicked user:", user);

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
        <ChatWindow 
        selectedUser={selectedUser}
        isOnline={onlineUsers.includes(String(selectedUser?._id))}
         />
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          Select a user to start chatting
        </div>
      )}
    </div>
  );
};

export default ChatPage;