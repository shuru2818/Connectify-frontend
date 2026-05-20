import React, { useEffect, useState, useRef } from "react";
import api from "../api/axios";
import socket, { joinChat, connectSocket } from "../socket";

const GroupChatWindow = ({ selectedGroup }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [showGroupInfo, setShowGroupInfo] = useState(false);
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

    return () => socket.off("receiveMessage", handler);
  }, [groupData?._id]);

  // AUTO SCROLL
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
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

  // UPDATE GROUP IMAGE
  const updateGroupImage = async (file) => {
    try {

      const formData = new FormData();

      formData.append("groupImage", file);

      const res = await api.put(
        `/groups/update-image/${groupData._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setGroupData(res.data);

    } catch (err) {
      console.log(err);
    }
  };

  if (!groupData) return null;

  return (
    <div className="flex flex-col w-3/4 relative bg-white h-screen overflow-hidden">

      {/* HEADER */}
      <div
        className="p-4 border-b bg-white font-bold text-lg cursor-pointer flex justify-between items-center"
        onClick={() => setShowGroupInfo(true)}
      >
        <div className="flex items-center gap-3">

          <img
            src={
              groupData?.groupImage ||
              `https://ui-avatars.com/api/?name=${groupData?.groupName}&background=random`
            }
            alt="group"
            className="w-12 h-12 rounded-full object-cover border border-gray-300"
          />

          <div>

            <p className="font-semibold text-gray-800">
              {groupData.groupName}
            </p>

            <p className="text-xs text-gray-500 font-normal">
              {groupData.participants?.length || 0} members
            </p>

          </div>

        </div>
      </div>

      {/* GROUP INFO MODAL */}
      {showGroupInfo && (
        <div className="absolute inset-0 bg-black/40 z-50 flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-md h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">

            {/* TOP IMAGE */}
            <div className="relative flex-shrink-0">

              <img
                src={
                  groupData?.groupImage ||
                  `https://ui-avatars.com/api/?name=${groupData?.groupName}&background=random`
                }
                alt="group"
                className="w-full h-44 object-cover"
              />

              {/* CHANGE GROUP IMAGE */}
              {isAdmin && (
                <label className="absolute bottom-3 right-3 bg-black/60 hover:bg-black/80 text-white w-10 h-10 rounded-full flex items-center justify-center cursor-pointer text-lg">

                  📷

                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        updateGroupImage(e.target.files[0]);
                      }
                    }}
                  />

                </label>
              )}

              <button
                onClick={() => setShowGroupInfo(false)}
                className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white w-8 h-8 rounded-full"
              >
                ✕
              </button>

            </div>

            {/* GROUP DETAILS */}
            <div className="p-4 border-b flex-shrink-0">

              <h2 className="text-2xl font-bold text-gray-800">
                {groupData?.groupName}
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                {groupData?.participants?.length} Members
              </p>

              {/* ADMIN */}
              <div className="mt-4">

                <p className="text-sm text-gray-500">
                  Group Admin
                </p>

                <div className="flex items-center gap-3 mt-2">

                  <img
                    src={
                      groupData?.admin?.profilePic ||
                      groupData?.admin?.avatar ||
                      `https://ui-avatars.com/api/?name=${groupData?.admin?.username}&background=random`
                    }
                    alt="admin"
                    className="w-10 h-10 rounded-full object-cover"
                  />

                  <div>

                    <p className="font-semibold text-gray-800">
                      {groupData?.admin?.username}
                    </p>

                    <p className="text-xs text-blue-500">
                      Group Admin
                    </p>

                  </div>

                </div>

              </div>

              {/* CREATED DATE */}
              <div className="mt-4 text-sm text-gray-500">
                Created on{" "}
                {new Date(groupData?.createdAt).toLocaleDateString()}
              </div>

            </div>

            {/* SCROLLABLE AREA */}
            <div className="flex-1 overflow-y-auto">

              {/* MEMBERS */}
              <div className="p-4">

                <p className="font-semibold mb-3 text-gray-700 text-lg">
                  Members
                </p>

                {groupData?.participants?.map((user) => {
                  const userId = user?._id || user;

                  const isGroupAdmin =
                    groupData?.admin?._id === userId;

                  return (
                    <div
                      key={userId}
                      className="flex items-center justify-between py-3 border-b"
                    >

                      <div className="flex items-center gap-3">

                        <img
                          src={
                            user?.profilePic ||
                            user?.avatar ||
                            `https://ui-avatars.com/api/?name=${user?.username}&background=random`
                          }
                          alt="user"
                          className="w-11 h-11 rounded-full object-cover"
                        />

                        <div>

                          <p className="font-medium text-gray-800">
                            {user?.username}
                          </p>

                          {isGroupAdmin && (
                            <p className="text-xs text-blue-500">
                              Group Admin
                            </p>
                          )}

                        </div>

                      </div>

                      {/* REMOVE */}
                      {isAdmin && userId !== currentUser._id && (
                        <button
                          onClick={() => removeUser(userId)}
                          className="text-red-500 hover:text-red-700 text-sm font-medium"
                        >
                          Remove
                        </button>
                      )}

                    </div>
                  );
                })}

              </div>

              {/* ADD MEMBERS */}
              {isAdmin && (
                <div className="border-t p-4">

                  <p className="font-semibold text-gray-700 mb-3 text-lg">
                    Add Members
                  </p>

                  <div className="max-h-40 overflow-y-auto">

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
                          className="flex items-center justify-between py-2"
                        >

                          <div className="flex items-center gap-2">

                            <img
                              src={
                                user?.profilePic ||
                                user?.avatar ||
                                `https://ui-avatars.com/api/?name=${user?.username}&background=random`
                              }
                              alt="user"
                              className="w-9 h-9 rounded-full object-cover"
                            />

                            <span className="text-sm text-gray-700">
                              {user.username}
                            </span>

                          </div>

                          <button
                            onClick={() => addUser(user._id)}
                            className="text-green-600 hover:text-green-700 text-sm font-medium"
                          >
                            Add
                          </button>

                        </div>
                      ))}

                  </div>

                </div>
              )}

            </div>

          </div>
        </div>
      )}

      {/* MESSAGES */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">

        {messages.map((msg) => {
          const isMe =
            (msg.sender?._id || msg.sender) === currentUser._id;

          return (
            <div
              key={msg._id}
              className={`mb-3 flex ${
                isMe ? "justify-end" : "justify-start"
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
                    {msg.sender?.username || "Unknown"}
                  </p>
                )}

                <p>{msg.content}</p>

                <p className="text-[10px] mt-1 text-right text-gray-500">
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

      {/* INPUT */}
      <div className="p-3 flex gap-2 border-t bg-white flex-shrink-0">

        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border px-3 py-2 rounded-lg outline-none"
        />

        <button
          onClick={sendMessage}
          className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg"
        >
          Send
        </button>

      </div>

    </div>
  );
};

export default GroupChatWindow;