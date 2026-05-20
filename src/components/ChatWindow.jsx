import React, { useEffect, useState, useRef } from "react";
import api from "../api/axios";
import moment from "moment";

import {
  typingSocket,
  stopTypingSocket,
  onReceiveMessage,
  onTyping,
  onStopTyping,
  onMessagesSeen,
  joinChat,
  onMessageDeleted,
  onMessageUpdated,
} from "../socket.js";

const ChatWindow = ({ selectedUser, isOnline }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [file, setFile] = useState(null);

  // PROFILE POPUP
  const [showProfile, setShowProfile] =
    useState(false);

  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const currentUser = JSON.parse(
    localStorage.getItem("user")
  );

  // AUTO SCROLL
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // JOIN CHAT
  useEffect(() => {
    if (!selectedUser?.chatId) return;

    joinChat(selectedUser.chatId);
  }, [selectedUser?.chatId]);

  // FETCH MESSAGES
  useEffect(() => {
    if (!selectedUser?.chatId) return;

    const fetchMessages = async () => {
      try {
        const res = await api.get(
          `/message/${selectedUser.chatId}`
        );

        setMessages(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchMessages();
  }, [selectedUser?.chatId]);

  // RECEIVE MESSAGE
  useEffect(() => {
    if (!selectedUser?.chatId) return;

    const cleanup = onReceiveMessage(
      (data) => {
        if (
          data.chat !==
          selectedUser.chatId
        )
          return;

        setMessages((prev) => {
          const tempIndex =
            prev.findIndex(
              (m) =>
                m._id
                  ?.toString()
                  .startsWith("temp-") &&
                m.sender?._id ===
                  data.sender?._id &&
                m.content ===
                  data.content
            );

          if (tempIndex !== -1) {
            const updated = [...prev];
            updated[tempIndex] = data;
            return updated;
          }

          const exists = prev.some(
            (m) => m._id === data._id
          );

          if (exists) return prev;

          return [...prev, data];
        });
      }
    );

    return cleanup;
  }, [selectedUser?.chatId]);

  // TYPING
  useEffect(() => {
    if (!selectedUser) return;

    const offShow = onTyping(
      (data) => {
        if (
          data.senderId ===
          selectedUser._id
        ) {
          setIsTyping(true);
        }
      }
    );

    const offHide = onStopTyping(
      (data) => {
        if (
          data.senderId ===
          selectedUser._id
        ) {
          setIsTyping(false);
        }
      }
    );

    return () => {
      offShow && offShow();
      offHide && offHide();
    };
  }, [selectedUser]);

  // SEEN
  useEffect(() => {
    const cleanup = onMessagesSeen(
      (data) => {
        if (
          data.chatId !==
          selectedUser?.chatId
        )
          return;

        setMessages((prev) =>
          prev.map((m) =>
            m.chat === data.chatId
              ? {
                  ...m,
                  status: "read",
                }
              : m
          )
        );
      }
    );

    return cleanup;
  }, [selectedUser?.chatId]);

  // DELETE
  useEffect(() => {
    const cleanup = onMessageDeleted(
      (data) => {
        setMessages((prev) =>
          prev.filter(
            (msg) =>
              msg._id !==
              data.messageId
          )
        );
      }
    );

    return cleanup;
  }, []);

  // EDIT
  useEffect(() => {
    const cleanup = onMessageUpdated(
      (updatedMsg) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === updatedMsg._id
              ? {
                  ...msg,
                  ...updatedMsg,
                  sender: msg.sender,
                }
              : msg
          )
        );
      }
    );

    return cleanup;
  }, []);

  // SEND MESSAGE
  const sendMessage = async () => {
    if (!text.trim() && !file) return;

    try {
      const formData = new FormData();

      formData.append(
        "chatId",
        selectedUser.chatId
      );

      formData.append(
        "content",
        text
      );

      if (file) {
        formData.append(
          "file",
          file
        );
      }

      const tempMessage = {
        _id: "temp-" + Date.now(),
        sender: {
          _id: currentUser._id,
        },
        chat: selectedUser.chatId,
        content: text,
        fileUrl: file
          ? URL.createObjectURL(file)
          : null,
        type: file
          ? file.type.startsWith(
              "image"
            )
            ? "image"
            : "file"
          : "text",
        createdAt: new Date(),
        status: "sent",
      };

      setMessages((prev) => [
        ...prev,
        tempMessage,
      ]);

      await api.post(
        "/message/send",
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      setText("");
      setFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value =
          "";
      }

      stopTypingSocket({
        senderId: currentUser._id,
        receiverId:
          selectedUser._id,
      });

      isTypingRef.current = false;
    } catch (err) {
      console.log(err);
    }
  };

  // DELETE MESSAGE
  const handleDelete = async (
    messageId
  ) => {
    try {
      await api.delete(
        `/message/${messageId}`
      );
    } catch (err) {
      console.log(err);
    }
  };

  // EDIT MESSAGE
  const handleEdit = async (
    messageId,
    oldText
  ) => {
    const newText = prompt(
      "Edit message:",
      oldText
    );

    if (!newText?.trim()) return;

    try {
      await api.put(
        `/message/${messageId}`,
        {
          content: newText,
        }
      );
    } catch (err) {
      console.log(err);
    }
  };

  // HANDLE TYPING
  const handleTyping = (e) => {
    setText(e.target.value);

    if (!isTypingRef.current) {
      typingSocket({
        senderId: currentUser._id,
        receiverId:
          selectedUser._id,
      });

      isTypingRef.current = true;
    }

    clearTimeout(
      typingTimeoutRef.current
    );

    typingTimeoutRef.current =
      setTimeout(() => {
        stopTypingSocket({
          senderId:
            currentUser._id,
          receiverId:
            selectedUser._id,
        });

        isTypingRef.current = false;
      }, 800);
  };

  return (
    <div className="flex flex-col w-2/3 h-screen bg-white">

      {/* HEADER */}
      <div className="p-4 border-b bg-white flex items-center justify-between shadow-sm">

        <div
          onClick={() =>
            setShowProfile(true)
          }
          className="flex items-center gap-3 cursor-pointer"
        >

          <img
            src={
              selectedUser?.profilePic ||
              `https://ui-avatars.com/api/?name=${selectedUser?.username}&background=random`
            }
            alt="profile"
            className="w-11 h-11 rounded-full object-cover border"
          />

          <div className="flex flex-col">

            <h2 className="font-semibold text-lg leading-tight hover:text-blue-500 transition">
              {selectedUser?.username ||
                "Select user"}
            </h2>

            <p className="text-sm text-gray-500 mt-0.5">
              {isOnline
                ? "🟢 Online"
                : selectedUser?.lastSeen
                ? `Last seen ${moment(
                    selectedUser.lastSeen
                  ).fromNow()}`
                : ""}
            </p>

          </div>

        </div>

      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">

        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`mb-3 ${
              msg.sender?._id ===
              currentUser._id
                ? "text-right"
                : "text-left"
            }`}
          >

            <div
              className={`inline-block px-3 py-2 rounded-2xl shadow max-w-[75%] ${
                msg.sender?._id ===
                currentUser._id
                  ? "bg-blue-500 text-white"
                  : "bg-white text-black"
              }`}
            >

              <div className="flex flex-col">

                {/* IMAGE */}
                {msg.type ===
                  "image" && (
                  <img
                    src={msg.fileUrl}
                    alt="sent"
                    className="max-w-[220px] rounded-xl mb-2"
                  />
                )}

                {/* FILE */}
                {msg.type ===
                  "file" && (
                  <a
                    href={msg.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm underline mb-2 block"
                  >
                    📎 Download File
                  </a>
                )}

                {/* TEXT */}
                <p className="break-words">
                  {msg.content}

                  {msg.edited && (
                    <span className="text-[10px] ml-1 opacity-70">
                      (edited)
                    </span>
                  )}
                </p>

              </div>

              {/* TIME */}
              <div className="flex items-center justify-end gap-1 mt-1">

                <p className="text-[10px] opacity-70">
                  {new Date(
                    msg.createdAt
                  ).toLocaleTimeString(
                    [],
                    {
                      hour: "2-digit",
                      minute:
                        "2-digit",
                    }
                  )}
                </p>

                {msg.sender?._id ===
                  currentUser._id && (
                  <span className="text-[11px]">
                    {msg.status ===
                    "read"
                      ? "✔✔"
                      : "✔"}
                  </span>
                )}

              </div>

            </div>

            {/* ACTIONS */}
            {msg.sender?._id ===
              currentUser._id && (
              <div className="flex gap-2 justify-end mt-1 mr-1">

                <button
                  onClick={() =>
                    handleEdit(
                      msg._id,
                      msg.content
                    )
                  }
                  className="text-blue-500 text-xs hover:scale-110 transition"
                >
                  ✏️
                </button>

                <button
                  onClick={() =>
                    handleDelete(
                      msg._id
                    )
                  }
                  className="text-red-500 text-xs hover:scale-110 transition"
                >
                  🗑️
                </button>

              </div>
            )}

          </div>
        ))}

        {/* TYPING */}
        {isTyping && (
          <p className="text-sm text-gray-500 italic">
            typing...
          </p>
        )}

        <div ref={chatEndRef} />

      </div>

      {/* INPUT */}
      <div className="flex p-3 gap-2 border-t bg-white items-center">

        <label className="cursor-pointer p-2 text-xl">
          📎

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={(e) =>
              setFile(
                e.target.files[0]
              )
            }
          />

        </label>

        <input
          value={text}
          onChange={handleTyping}
          placeholder={
            file
              ? `File: ${file.name}`
              : "Type message..."
          }
          className="flex-1 border px-4 py-3 rounded-2xl outline-none focus:border-blue-500"
        />

        {file && (
          <button
            onClick={() => {
              setFile(null);

              fileInputRef.current.value =
                "";
            }}
            className="text-red-500 text-sm"
          >
            Cancel
          </button>
        )}

        <button
          onClick={sendMessage}
          className="bg-blue-500 hover:bg-blue-600 transition text-white px-5 py-3 rounded-2xl"
        >
          Send
        </button>

      </div>

      {/* PROFILE POPUP */}
      {showProfile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3">

          <div className="bg-white w-[360px] max-h-[92vh] rounded-3xl overflow-y-auto shadow-2xl relative">

            {/* CLOSE */}
            <button
              onClick={() =>
                setShowProfile(false)
              }
              className="absolute top-3 right-4 text-white text-xl z-10 hover:scale-110 transition"
            >
              ✕
            </button>

            {/* COVER */}
            <div className="h-24 bg-gradient-to-r from-indigo-600 via-blue-500 to-cyan-400 relative">

              {/* PROFILE IMAGE */}
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">

                <img
                  src={
                    selectedUser?.profilePic ||
                    `https://ui-avatars.com/api/?name=${selectedUser?.username}&background=random`
                  }
                  alt="profile"
                  className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-lg"
                />

              </div>

            </div>

            {/* CONTENT */}
            <div className="pt-14 pb-5 px-4">

              {/* NAME */}
              <div className="text-center">

                <h2 className="text-xl font-bold text-slate-800">
                  {selectedUser?.username}
                </h2>

                <p className="text-xs text-gray-500 mt-1">
                  {isOnline
                    ? "🟢 Online"
                    : selectedUser?.lastSeen
                    ? `Last seen ${moment(
                        selectedUser.lastSeen
                      ).fromNow()}`
                    : "Offline"}
                </p>

              </div>

              {/* ABOUT */}
              <div className="mt-4 bg-slate-100 rounded-2xl p-3">

                <p className="text-[11px] text-slate-400 mb-1">
                  About
                </p>

                <p className="text-slate-700 font-medium text-sm">
                  {selectedUser?.about ||
                    "Hey there! I am using ChatApp 👋"}
                </p>

              </div>

              {/* DETAILS */}
              <div className="mt-3 space-y-2">

                {/* PHONE */}
                <div className="bg-slate-100 rounded-2xl p-3 flex items-center justify-between">

                  <div>
                    <p className="text-[11px] text-slate-400">
                      Phone
                    </p>

                    <p className="font-semibold text-slate-700 text-sm">
                      {selectedUser?.phone ||
                        "Not available"}
                    </p>
                  </div>

                  <span className="text-lg">
                    📞
                  </span>

                </div>

                {/* EMAIL */}
                <div className="bg-slate-100 rounded-2xl p-3 flex items-center justify-between">

                  <div className="overflow-hidden">
                    <p className="text-[11px] text-slate-400">
                      Email
                    </p>

                    <p className="font-semibold text-slate-700 text-sm break-all">
                      {selectedUser?.email}
                    </p>
                  </div>

                  <span className="text-lg">
                    ✉️
                  </span>

                </div>

                {/* COMMON GROUPS */}
                <div className="bg-slate-100 rounded-2xl p-3 flex items-center justify-between">

                  <div>
                    <p className="text-[11px] text-slate-400">
                      Common Groups
                    </p>

                    <p className="font-semibold text-slate-700 text-sm">
                      {
                        selectedUser?.groups?.filter((group) =>
                          currentUser?.groups?.includes(group)
                        ).length || 0
                      } Groups
                    </p>
                  </div>

                  <span className="text-lg">
                    👥
                  </span>

                </div>

                {/* JOINED */}
                <div className="bg-slate-100 rounded-2xl p-3 flex items-center justify-between">

                  <div>
                    <p className="text-[11px] text-slate-400">
                      Joined
                    </p>

                    <p className="font-semibold text-slate-700 text-sm">
                      {selectedUser?.createdAt
                        ? moment(
                            selectedUser.createdAt
                          ).format(
                            "DD MMM YYYY"
                          )
                        : "Recently"}
                    </p>
                  </div>

                  <span className="text-lg">
                    📅
                  </span>

                </div>

              </div>

              {/* BUTTONS */}
              <div className="flex gap-2 mt-4">

                <button 
                  onClick={() => setShowProfile(false)}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-2xl font-semibold text-sm transition">
                  Message
                </button>

                <button className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-2xl font-semibold text-sm transition">
                  Call
                </button>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default ChatWindow;