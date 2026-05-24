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
  const [showProfile, setShowProfile] = useState(false);

  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const currentUser = JSON.parse(localStorage.getItem("user"));

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
        const res = await api.get(`/message/${selectedUser.chatId}`);

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

    const cleanup = onReceiveMessage((data) => {
      if (data.chat !== selectedUser.chatId) return;

      setMessages((prev) => {
        const tempIndex = prev.findIndex(
          (m) =>
            m._id?.toString().startsWith("temp-") &&
            m.sender?._id === data.sender?._id &&
            m.content === data.content,
        );

        if (tempIndex !== -1) {
          const updated = [...prev];
          updated[tempIndex] = data;
          return updated;
        }

        const exists = prev.some((m) => m._id === data._id);

        if (exists) return prev;

        return [...prev, data];
      });
    });

    return cleanup;
  }, [selectedUser?.chatId]);

  // TYPING
  useEffect(() => {
    if (!selectedUser) return;

    const offShow = onTyping((data) => {
      if (data.senderId === selectedUser._id) {
        setIsTyping(true);
      }
    });

    const offHide = onStopTyping((data) => {
      if (data.senderId === selectedUser._id) {
        setIsTyping(false);
      }
    });

    return () => {
      offShow && offShow();
      offHide && offHide();
    };
  }, [selectedUser]);

  // SEEN
  useEffect(() => {
    const cleanup = onMessagesSeen((data) => {
      if (data.chatId !== selectedUser?.chatId) return;

      setMessages((prev) =>
        prev.map((m) =>
          m.chat === data.chatId
            ? {
                ...m,
                status: "read",
              }
            : m,
        ),
      );
    });

    return cleanup;
  }, [selectedUser?.chatId]);

  // DELETE
  useEffect(() => {
    const cleanup = onMessageDeleted((data) => {
      setMessages((prev) => prev.filter((msg) => msg._id !== data.messageId));
    });

    return cleanup;
  }, []);

  // EDIT
  useEffect(() => {
    const cleanup = onMessageUpdated((updatedMsg) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === updatedMsg._id
            ? {
                ...msg,
                ...updatedMsg,
                sender: msg.sender,
              }
            : msg,
        ),
      );
    });

    return cleanup;
  }, []);

  // SEND MESSAGE
  const sendMessage = async () => {
    if (!text.trim() && !file) return;

    try {
      const formData = new FormData();

      formData.append("chatId", selectedUser.chatId);

      formData.append("content", text);

      if (file) {
        formData.append("file", file);
      }

      const tempMessage = {
        _id: "temp-" + Date.now(),
        sender: {
          _id: currentUser._id,
        },
        chat: selectedUser.chatId,
        content: text,
        fileUrl: file ? URL.createObjectURL(file) : null,
        type: file
          ? file.type.startsWith("image")
            ? "image"
            : "file"
          : "text",
        createdAt: new Date(),
        status: "sent",
      };

      setMessages((prev) => [...prev, tempMessage]);

      await api.post("/message/send", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setText("");
      setFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      stopTypingSocket({
        senderId: currentUser._id,
        receiverId: selectedUser._id,
      });

      isTypingRef.current = false;
    } catch (err) {
      console.log(err);
    }
  };

  // DELETE MESSAGE
  const handleDelete = async (messageId) => {
    try {
      await api.delete(`/message/${messageId}`);
    } catch (err) {
      console.log(err);
    }
  };

  // EDIT MESSAGE
  const handleEdit = async (messageId, oldText) => {
    const newText = prompt("Edit message:", oldText);

    if (!newText?.trim()) return;

    try {
      await api.put(`/message/${messageId}`, {
        content: newText,
      });
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
        receiverId: selectedUser._id,
      });

      isTypingRef.current = true;
    }

    clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      stopTypingSocket({
        senderId: currentUser._id,
        receiverId: selectedUser._id,
      });

      isTypingRef.current = false;
    }, 800);
  };

  return (
    <div className="w-full flex flex-col w-2/3 h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 relative overflow-hidden">
      {/* BACKGROUND BLURS */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl"></div>

      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>

      {/* HEADER */}
      <div className="relative z-10 px-6 py-4 border-b border-slate-200 bg-white/70 backdrop-blur-xl flex items-center justify-between shadow-sm">
        {/* LEFT */}
        <div
          onClick={() => setShowProfile(true)}
          className="flex items-center gap-4 cursor-pointer group"
        >
          {/* PROFILE */}
          <div className="relative">
            <img
              src={
                selectedUser?.profilePic ||
                `https://ui-avatars.com/api/?name=${selectedUser?.username}&background=random`
              }
              alt="profile"
              className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md"
            />

            {/* ONLINE STATUS */}
            <span
              className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-[3px] border-white ${
                isOnline ? "bg-green-500" : "bg-slate-400"
              }`}
            />
          </div>

          {/* USER INFO */}
          <div>
            <h2 className="font-bold text-xl text-slate-800 group-hover:text-indigo-600 transition">
              {selectedUser?.username || "Select User"}
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              {isOnline
                ? "🟢 Active now"
                : selectedUser?.lastSeen
                  ? `Last seen ${moment(selectedUser.lastSeen).fromNow()}`
                  : "Offline"}
            </p>
          </div>
        </div>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-3">
          <button className="w-11 h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-xl transition-all hover:scale-105">
            📞
          </button>

          <button className="w-11 h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-xl transition-all hover:scale-105">
            🎥
          </button>

          <button className="w-11 h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-xl transition-all hover:scale-105">
            ⋮
          </button>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="relative z-10 flex-1 overflow-y-auto px-6 py-5 space-y-4">
        {messages.map((msg) => {
          const isMine = msg.sender?._id === currentUser._id;

          return (
            <div
              key={msg._id}
              className={`flex ${isMine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`group relative max-w-[75%] px-4 py-3 rounded-3xl shadow-md transition-all ${
                  isMine
                    ? "bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-br-md"
                    : "bg-white border border-slate-200 text-slate-800 rounded-bl-md"
                }`}
              >
                {/* IMAGE */}
                {msg.type === "image" && (
                  <img
                    src={msg.fileUrl}
                    alt="sent"
                    className="max-w-[260px] rounded-2xl mb-3 shadow"
                  />
                )}

                {/* FILE */}
                {msg.type === "file" && (
                  <a
                    href={msg.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={`block mb-2 underline text-sm ${
                      isMine ? "text-indigo-100" : "text-blue-500"
                    }`}
                  >
                    📎 Download File
                  </a>
                )}

                {/* TEXT */}
                <p className="break-words text-[15px] leading-7">
                  {msg.content}

                  {msg.edited && (
                    <span className="text-[10px] ml-2 opacity-70 italic">
                      edited
                    </span>
                  )}
                </p>

                {/* FOOTER */}
                <div className="flex items-center justify-end gap-2 mt-3">
                  <p
                    className={`text-[11px] ${
                      isMine ? "text-indigo-100" : "text-slate-400"
                    }`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>

                  {isMine && (
                    <span className="text-[12px]">
                      {msg.status === "read" ? "✔✔" : "✔"}
                    </span>
                  )}
                </div>

                {/* ACTION BUTTONS */}
                {isMine && (
                  <div className="absolute -top-3 right-2 opacity-0 group-hover:opacity-100 transition-all flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(msg._id, msg.content)}
                      className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-blue-500 hover:scale-110 transition"
                    >
                      ✏️
                    </button>

                    <button
                      onClick={() => handleDelete(msg._id)}
                      className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-red-500 hover:scale-110 transition"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* TYPING */}
        {isTyping && (
          <div className="flex items-center gap-2 text-slate-500 text-sm italic ml-2">
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"></span>

              <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce delay-100"></span>

              <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce delay-200"></span>
            </div>
            typing...
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* INPUT AREA */}
      <div className="relative z-10 p-4 border-t border-slate-200 bg-white/70 backdrop-blur-xl">
        <div className="flex items-center gap-3 bg-white rounded-3xl shadow-lg border border-slate-200 px-4 py-3">
          {/* FILE */}
          <label className="cursor-pointer text-2xl hover:scale-110 transition">
            📎
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </label>

          {/* INPUT */}
          <input
            value={text}
            onChange={handleTyping}
            placeholder={file ? `File: ${file.name}` : "Type your message..."}
            className="flex-1 bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
          />

          {/* CANCEL FILE */}
          {file && (
            <button
              onClick={() => {
                setFile(null);

                fileInputRef.current.value = "";
              }}
              className="text-red-500 text-sm font-semibold hover:scale-105 transition"
            >
              Cancel
            </button>
          )}

          {/* SEND */}
          <button
            onClick={sendMessage}
            className="w-12 h-12 rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-500 text-white text-xl shadow-lg hover:scale-105 active:scale-95 transition-all"
          >
            ➤
          </button>
        </div>
      </div>

      {/* PROFILE POPUP */}
      {showProfile && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-[380px] max-h-[92vh] overflow-y-auto bg-white rounded-[35px] shadow-2xl">
            {/* CLOSE */}
            <button
              onClick={() => setShowProfile(false)}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white hover:scale-110 transition"
            >
              ✕
            </button>

            {/* COVER */}
            <div className="h-36 bg-gradient-to-r from-indigo-600 via-blue-500 to-cyan-400 relative">
              {/* IMAGE */}
              <div className="absolute -bottom-14 left-1/2 -translate-x-1/2">
                <img
                  src={
                    selectedUser?.profilePic ||
                    `https://ui-avatars.com/api/?name=${selectedUser?.username}&background=random`
                  }
                  alt="profile"
                  className="w-28 h-28 rounded-full border-4 border-white shadow-xl object-cover"
                />
              </div>
            </div>

            {/* CONTENT */}
            <div className="pt-20 pb-6 px-5">
              {/* NAME */}
              <div className="text-center">
                <h2 className="text-2xl font-black text-slate-800">
                  {selectedUser?.username}
                </h2>

                <p className="text-sm text-slate-500 mt-2">
                  {isOnline
                    ? "🟢 Online"
                    : selectedUser?.lastSeen
                      ? `Last seen ${moment(selectedUser.lastSeen).fromNow()}`
                      : "Offline"}
                </p>
              </div>

              {/* ABOUT */}
              <div className="mt-6 bg-slate-100 rounded-3xl p-4">
                <p className="text-xs text-slate-400 mb-2">ABOUT</p>

                <p className="text-slate-700 leading-7 text-sm font-medium">
                  {selectedUser?.about || "Hey there! I am using Connectify 👋"}
                </p>
              </div>

              {/* DETAILS */}
              <div className="space-y-3 mt-4">
                {/* PHONE */}
                <div className="bg-slate-100 rounded-3xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">PHONE</p>

                    <p className="font-semibold text-slate-700 mt-1">
                      {selectedUser?.phone || "Not available"}
                    </p>
                  </div>

                  <span className="text-2xl">📞</span>
                </div>

                {/* EMAIL */}
                <div className="bg-slate-100 rounded-3xl p-4 flex items-center justify-between">
                  <div className="overflow-hidden">
                    <p className="text-xs text-slate-400">EMAIL</p>

                    <p className="font-semibold text-slate-700 mt-1 break-all">
                      {selectedUser?.email}
                    </p>
                  </div>

                  <span className="text-2xl">✉️</span>
                </div>

                {/* GROUPS */}
                <div className="bg-slate-100 rounded-3xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">COMMON GROUPS</p>

                    <p className="font-semibold text-slate-700 mt-1">
                      {selectedUser?.groups?.filter((group) =>
                        currentUser?.groups?.includes(group),
                      ).length || 0}{" "}
                      Groups
                    </p>
                  </div>

                  <span className="text-2xl">👥</span>
                </div>
              </div>

              {/* BUTTONS */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowProfile(false)}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-bold shadow-lg hover:scale-[1.02] transition"
                >
                  Message
                </button>

                <button className="flex-1 py-3 rounded-2xl bg-green-500 text-white font-bold shadow-lg hover:scale-[1.02] transition">
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
