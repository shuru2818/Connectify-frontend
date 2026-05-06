import React, { useEffect, useState, useRef } from "react";
import api from "../api/axios";
import moment from "moment"
import {
  typingSocket,
  stopTypingSocket,
  onReceiveMessage,
  onTyping,
  onStopTyping,
  onMessagesSeen,
  joinChat,
  onMessageDeleted,
  deleteMessageSocket,
  onMessageUpdated
} from "../socket.js";

const ChatWindow = ({ selectedUser, isOnline }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [file, setFile] = useState(null);

  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const currentUser = JSON.parse(localStorage.getItem("user"));

  // scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // join chat
  useEffect(() => {
    if (selectedUser?.chatId) {
      joinChat(selectedUser.chatId);
    }
  }, [selectedUser]);

  // fetch messages
  useEffect(() => {
    if (!selectedUser?.chatId) return;

    const fetchMessages = async () => {
      const res = await api.get(`/message/${selectedUser.chatId}`);
      setMessages(res.data);
    };

    fetchMessages();
  }, [selectedUser]);

  // receive message  
  useEffect(() => {
    if (!selectedUser?.chatId) return;

    const cleanup = onReceiveMessage((data) => {
      if (data.chat === selectedUser.chatId) {
        setMessages((prev) => {
          const exists = prev.some((m) => m._id === data._id);
          if (exists) return prev;
          return [...prev, data];
        });
      }
    });

    return cleanup;
  }, [selectedUser]);

  // typing
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
      if (offShow) offShow();
      if (offHide) offHide();
    };
  }, [selectedUser]);

  // seen
  useEffect(() => {
    const cleanup = onMessagesSeen((data) => {
      if (data.chatId !== selectedUser?.chatId) return;

      setMessages((prev) =>
        prev.map((m) =>
          m.chat === data.chatId ? { ...m, status: "read" } : m
        )
      );
    });

    return cleanup;
  }, [selectedUser]);

  //message delete
  useEffect(() => {
    const cleanup = onMessageDeleted((data) => {
      setMessages((prev) =>
        prev.filter((msg) => msg._id !== data.messageId)
      );
    });

    return cleanup;
  }, []);

  //edit
  useEffect(() => {
    const cleanup = onMessageUpdated((updatedMsg) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === updatedMsg._id ? { ...msg, ...updatedMsg, sender: msg.sender } : msg
        )
      );
    });

    return cleanup;
  }, []);

  // send message  
   const sendMessage = async () => {
  if (!text.trim() && !file) return;

  const formData = new FormData();
  formData.append("chatId", selectedUser.chatId);
  formData.append("content", text);
  if (file) formData.append("file", file);

  // 👇 OPTIMISTIC MESSAGE (IMPORTANT FIX)
  const tempMessage = {
    _id: Date.now(),
    sender: { _id: currentUser._id },
    chat: selectedUser.chatId,
    content: text,
    fileUrl: file ? URL.createObjectURL(file) : null,
    type: file ? (file.type.startsWith("image") ? "image" : "file") : "text",
    createdAt: new Date(),
    status: "sent",
  };

  setMessages((prev) => [...prev, tempMessage]);

  await api.post("/message/send", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });

  setText("");
  setFile(null);
  if (fileInputRef.current) fileInputRef.current.value = "";

  stopTypingSocket({
    senderId: currentUser._id,
    receiverId: selectedUser._id,
  });

  isTypingRef.current = false;
};

  //delete
  const handleDelete = async (messageId) => {
    try {
      await api.delete(`/message/${messageId}`);

      deleteMessageSocket({
        messageId,
        chatId: selectedUser.chatId,
      });

    } catch (err) {
      console.error(err);
    }
  };

  //handleedit
  const handleEdit = async (messageId, oldText) => {
  const newText = prompt("Edit message:", oldText);

  if (!newText || newText.trim() === "") return;

  try {
    await api.put(`/message/${messageId}`, {
      content: newText,
    });
  } catch (err) {
    console.error(err);
  }
};

  //typing handler
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
    <div className="flex flex-col w-2/3 h-screen">
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <h2 className="font-semibold text-lg">
          {selectedUser?.username || "Select user"}
        </h2>

        <p className="text-sm text-gray-500">
          {isOnline
            ? "🟢 Online"
            : selectedUser?.lastSeen
            ? `Last seen ${moment(selectedUser.lastSeen).fromNow()}`
            : ""}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`mb-3 ${
              msg.sender?._id === currentUser._id
                ? "text-right"
                : "text-left"
            }`}
          >
            <div className="inline-block px-3 py-1 bg-white rounded shadow">

              <div className="flex flex-col">
                {msg.type === "image" && (
                  <img src={msg.fileUrl} alt="sent" className="max-w-[200px] rounded mb-2" />
                )}
                {msg.type === "file" && (
                  <a href={msg.fileUrl} target="_blank" rel="noreferrer" className="text-blue-500 underline text-sm mb-2 block">
                    📎 Download File
                  </a>
                )}
                <p className="flex items-center gap-1">
                  {msg.content}
                  {msg.edited && (
                    <span className="text-[10px] text-gray-400">(edited)</span>
                  )}
                </p>
              </div>

              <p className="text-xs text-gray-400">
                {new Date(msg.createdAt).toLocaleTimeString()}
              </p>
            </div>

            

            {msg.sender?._id === currentUser._id && (
              <div className="flex gap-2 justify-end mt-1">

                <button onClick={() => handleEdit(msg._id, msg.content)} className="text-blue-500 hover:scale-110 transition text-sm">
                  ✏️
                </button>

                <button onClick={() => handleDelete(msg._id)} className="text-red-500 hover:scale-110 transition text-sm">
                  🗑️
                </button>

              </div>
            )}

            {msg.sender?._id === currentUser._id && (
              <div className="text-xs text-gray-500">
                {msg.status === "read" ? "✔✔" : "✔"}
              </div>
              
            )}

          </div>
        ))}

        {isTyping && (
          <p className="text-sm text-gray-500 italic">typing...</p>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="flex p-3 gap-2 border-t bg-white items-center">
        <label className="cursor-pointer p-2 hover:bg-gray-100 rounded-full transition">
          <span className="text-xl">📎</span>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </label>
        
        <input
          value={text}
          onChange={handleTyping}
          placeholder={file ? `File: ${file.name}` : "Type message..."}
          className="flex-1 border px-3 py-2 rounded focus:outline-none"
        />

        {file && (
          <button onClick={() => { setFile(null); fileInputRef.current.value = ""; }} className="text-red-500 text-sm">
            Cancel
          </button>
        )}

        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded font-medium"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;