import React, { useEffect, useState, useRef } from "react";
import api from "../api/axios";
import socket, { joinChat, connectSocket } from "../socket";

const GroupChatWindow = ({ selectedGroup }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [showMembers, setShowMembers] = useState(false);
  const [allUsers, setAllUsers] = useState([]);

  const bottomRef = useRef(null);
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const isAdmin = selectedGroup?.admin === currentUser._id;

  const fetchMessages = async (groupId) => {
    const res = await api.get(`/message/${groupId}`);
    setMessages(res.data);
  };

  const fetchGroup = async () => {
    const res = await api.get("/groups/my");
    return res.data.find((g) => g._id === selectedGroup._id);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await api.get("/users/search?query=a");
      setAllUsers(res.data.users);
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!selectedGroup?._id) return;

    const user = JSON.parse(localStorage.getItem("user"));

    connectSocket(user._id); // 🔥 ensure socket connected first
    joinChat(selectedGroup._id); // then join room

    fetchMessages(selectedGroup._id);
  }, [selectedGroup?._id]);

 useEffect(() => {
  const handler = (msg) => {
    const chatId = msg.chat?._id || msg.chat;

    if (chatId !== selectedGroup?._id) return;

    setMessages((prev) => {
      const exists = prev.some((m) => m._id === msg._id);
      if (exists) return prev;
      return [...prev, msg];
    });
  };

  socket.off("receiveMessage"); // 🔥 important cleanup
  socket.on("receiveMessage", handler);

  return () => socket.off("receiveMessage", handler);
}, [selectedGroup?._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!text.trim()) return;

    const res = await api.post("/message/send", {
      chatId: selectedGroup._id,
      content: text,
      sender: currentUser._id,
    });
    // socket.emit("sendMessage", {
    //   chatId: selectedGroup._id,
    //   content: text,
    //   sender: currentUser._id,
    // });

    setText("");
  };

  const addUser = async (userId) => {
    await api.post("/groups/add-user", {
      groupId: selectedGroup._id,
      userId,
    });
  };

  const removeUser = async (userId) => {
    await api.post("/groups/remove-user", {
      groupId: selectedGroup._id,
      userId,
    });
  };

  if (!selectedGroup) return null;

  return (
    <div className="flex flex-col w-3/4 relative">
      <div
        className="p-4 border-b bg-white font-bold text-lg cursor-pointer flex justify-between items-center"
        onClick={() => setShowMembers(!showMembers)}
      >
        <span>👥 {selectedGroup.groupName}</span>
        <span className="text-sm text-gray-500">
          {selectedGroup.participants?.length} members
        </span>
      </div>

      {showMembers && (
        <div className="absolute top-16 left-0 w-full bg-white shadow-md z-10 p-3 max-h-80 overflow-y-auto">
          <div className="flex justify-between items-center mb-2">
            <p className="font-semibold">Members</p>
            {isAdmin && <span className="text-xs text-blue-500">Admin</span>}
          </div>

          {selectedGroup.participants?.map((user) => (
            <div
              key={user._id}
              className="flex justify-between items-center py-1 border-b"
            >
              <span>👤 {user.username}</span>

              {isAdmin && user._id !== currentUser._id && (
                <button
                  onClick={() => removeUser(user._id)}
                  className="text-red-500 text-xs"
                >
                  Remove
                </button>
              )}
            </div>
          ))}

          {isAdmin && (
            <div className="mt-3 border-t pt-2">
              <p className="text-sm font-semibold mb-1">Add Members</p>

              {allUsers.map((user) => (
                <div
                  key={user._id}
                  className="flex justify-between items-center py-1"
                >
                  <span>{user.username}</span>

                  <button
                    onClick={() => addUser(user._id)}
                    className="text-green-600 text-xs"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {messages.map((msg) => {
          const isMe = msg.sender?._id === currentUser._id;

          return (
            <div
              key={msg._id}
              className={`mb-3 flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs px-3 py-2 rounded-lg shadow ${
                  isMe ? "bg-blue-500 text-white" : "bg-white text-black"
                }`}
              >
                {!isMe && (
                  <p className="text-xs font-semibold text-gray-600 mb-1">
                    {msg.sender?.username}
                  </p>
                )}

                <p>{msg.content}</p>

                <p
                  className={`text-[10px] mt-1 text-right ${
                    isMe ? "text-white/70" : "text-gray-500"
                  }`}
                >
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      <div className="p-3 flex gap-2 border-t bg-white">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border px-3 py-2 rounded"
        />

        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default GroupChatWindow;
