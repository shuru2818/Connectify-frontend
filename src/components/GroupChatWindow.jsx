import React, { useEffect, useState, useRef } from "react";
import api from "../api/axios";
import socket, { joinChat, connectSocket } from "../socket";

const GroupChatWindow = ({ selectedGroup }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [showMembers, setShowMembers] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [groupData, setGroupData] = useState(selectedGroup);

  const bottomRef = useRef(null);

  const currentUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    setGroupData(selectedGroup);
  }, [selectedGroup]);

  const isAdmin =
    groupData?.admin?._id === currentUser._id ||
    groupData?.admin === currentUser._id;

  // FETCH MESSAGES
  const fetchMessages = async (groupId) => {
    try {
      const res = await api.get(`/message/${groupId}`);
      setMessages(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // FETCH USERS
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/users/search?query=a");
        setAllUsers(res.data.users);
      } catch (err) {
        console.log(err);
      }
    };

    fetchUsers();
  }, []);

  // SOCKET + JOIN CHAT
  useEffect(() => {
    if (!groupData?._id) return;

    connectSocket(currentUser._id);

    joinChat(groupData._id);

    fetchMessages(groupData._id);
  }, [groupData?._id]);

  // RECEIVE MESSAGE
  useEffect(() => {
    const handler = (msg) => {
      const chatId = msg.chat?._id || msg.chat;

      if (chatId !== groupData?._id) return;

      setMessages((prev) => {
        const exists = prev.some((m) => m._id === msg._id);

        if (exists) return prev;

        return [...prev, msg];
      });
    };

    socket.off("receiveMessage");

    socket.on("receiveMessage", handler);

    return () => {
      socket.off("receiveMessage", handler);
    };
  }, [groupData?._id]);

  // AUTO SCROLL
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // SEND MESSAGE
  const sendMessage = async () => {
    if (!text.trim()) return;

    try {
      await api.post("/message/send", {
        chatId: groupData._id,
        content: text,
        sender: currentUser._id,
      });

      setText("");
    } catch (err) {
      console.log(err);
    }
  };

  // ADD USER
  const addUser = async (userId) => {
    try {
      const res = await api.post("/groups/add-user", {
        groupId: groupData._id,
        userId,
      });

      setGroupData(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // REMOVE USER
  const removeUser = async (userId) => {
    try {
      const res = await api.post("/groups/remove-user", {
        groupId: groupData._id,
        userId,
      });

      setGroupData(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  if (!groupData) return null;

  return (
    <div className="flex flex-col w-3/4 relative">
      {/* HEADER */}
      <div
        className="p-4 border-b bg-white font-bold text-lg cursor-pointer flex justify-between items-center"
        onClick={() => setShowMembers(!showMembers)}
      >
        <span>👥 {groupData.groupName}</span>

        <span className="text-sm text-gray-500">
          {groupData.participants?.length || 0} members
        </span>
      </div>

      {/* MEMBERS PANEL */}
      {showMembers && (
        <div className="absolute top-16 left-0 w-full bg-white shadow-md z-10 p-3 max-h-80 overflow-y-auto">
          <div className="flex justify-between items-center mb-2">
            <p className="font-semibold">Members</p>

            {isAdmin && (
              <span className="text-xs text-blue-500">
                Admin
              </span>
            )}
          </div>

          {/* CURRENT MEMBERS */}
          {groupData.participants?.map((user, index) => {
            const userId = user?._id || user;

            return (
              <div
                key={userId || index}
                className="flex justify-between items-center py-2 border-b"
              >
                <span>
                  👤{" "}
                  {user?.username ||
                    user?.name ||
                    "Unknown User"}
                </span>

                {isAdmin &&
                  userId !== currentUser._id && (
                    <button
                      onClick={() => removeUser(userId)}
                      className="text-red-500 text-xs"
                    >
                      Remove
                    </button>
                  )}
              </div>
            );
          })}

          {/* ADD MEMBERS */}
          {isAdmin && (
            <div className="mt-3 border-t pt-2">
              <p className="text-sm font-semibold mb-2">
                Add Members
              </p>

              {allUsers
                .filter(
                  (u) =>
                    !groupData?.participants?.some(
                      (p) =>
                        (p?._id || p).toString() ===
                        u._id.toString()
                    )
                )
                .map((user) => (
                  <div
                    key={user._id}
                    className="flex justify-between items-center py-2"
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

      {/* MESSAGES */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {messages.map((msg) => {
          const isMe =
            (msg.sender?._id || msg.sender) ===
            currentUser._id;

          return (
            <div
              key={msg._id}
              className={`mb-3 flex ${
                isMe
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs px-3 py-2 rounded-lg shadow ${
                  isMe
                    ? "bg-blue-500 text-white"
                    : "bg-white text-black"
                }`}
              >
                {!isMe && (
                  <p className="text-xs font-semibold text-gray-600 mb-1">
                    {msg.sender?.username ||
                      "Unknown"}
                  </p>
                )}

                <p>{msg.content}</p>

                <p
                  className={`text-[10px] mt-1 text-right ${
                    isMe
                      ? "text-white/70"
                      : "text-gray-500"
                  }`}
                >
                  {new Date(
                    msg.createdAt
                  ).toLocaleTimeString([], {
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

      {/* INPUT */}
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