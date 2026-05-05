import React, { useEffect, useState, useRef } from "react";
import api from "../api/axios";
import socket from "../socket.js";
import {
  sendMessageSocket,
  markSeenSocket,
  typingSocket,
  stopTypingSocket,
  onReceiveMessage,
  onTyping,
  onStopTyping,
  onMessagesSeen,
} from "../socket.js";

const ChatWindow = ({ selectedUser }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);
  const chatEndRef = useRef(null);

  const currentUser = JSON.parse(localStorage.getItem("user"));

  const formatTime = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (selectedUser?.chatId) {
      socket.emit("joinChat", selectedUser.chatId);
    }
  }, [selectedUser]);

  useEffect(() => {
    if (!selectedUser?.chatId) return;

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/message/${selectedUser.chatId}`);
        setMessages(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchMessages();
  }, [selectedUser]);

  useEffect(() => {
    if (!selectedUser?.chatId) return;

    const cleanup = onReceiveMessage((data) => {
      if (data.chatId === selectedUser.chatId) {
        setMessages((prev) => {
          const exists = prev.some((m) => m._id === data._id);
          if (exists) return prev;
          return [...prev, data];
        });
      }
    });

    return cleanup;
  }, [selectedUser]);

 useEffect(() => {
  const offShow = onTyping((data) => {
    if (data.senderId === selectedUser?._id) setIsTyping(true);
  });

  const offHide = onStopTyping((data) => {
    if (data.senderId === selectedUser?._id) setIsTyping(false);
  });

  return () => {
    if (typeof offShow === "function") offShow();
    if (typeof offHide === "function") offHide();
  };
}, [selectedUser]);

  useEffect(() => {
    if (!selectedUser?.chatId || messages.length === 0) return;

    const lastMsg = messages[messages.length - 1];

    if (lastMsg?.sender?._id !== currentUser._id) {
      markSeenSocket({
        chatId: selectedUser.chatId,
        senderId: currentUser._id,
      });
    }
  }, [messages, selectedUser]);

  useEffect(() => {
    const cleanup = onMessagesSeen((data) => {
      if (data.chatId !== selectedUser?.chatId) return;

      setMessages((prev) =>
        prev.map((m) =>
          m.chatId === data.chatId ? { ...m, status: "read" } : m
        )
      );
    });

    return cleanup;
  }, [selectedUser]);

  const sendMessage = async () => {
    if (!text.trim() || !selectedUser?._id) return;

    try {
      const res = await api.post("/message/send", {
        chatId: selectedUser.chatId,
        content: text,
      });

      setMessages((prev) => [...prev, res.data]);

      sendMessageSocket({
        _id: res.data._id,
        chatId: selectedUser.chatId,
        senderId: currentUser._id,
        content: res.data.content,
        status: res.data.status,
        createdAt: res.data.createdAt,
      });

      setText("");

      stopTypingSocket({
        senderId: currentUser._id,
        receiverId: selectedUser._id,
      });

      isTypingRef.current = false;
    } catch (err) {
      console.error(err);
    }
  };

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

      <div className="p-4 border-b bg-white">
        <h2 className="font-semibold text-lg">
          {selectedUser?.username || "Select a user"}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`mb-3 ${
              msg.sender?._id === currentUser._id ? "text-right" : "text-left"
            }`}
          >
            <div className="inline-block px-3 py-1 bg-white rounded shadow">
              <p>{msg.content}</p>
              <p className="text-[10px] text-gray-400 mt-1">
                {formatTime(msg.createdAt)}
              </p>
            </div>

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

      <div className="flex p-3 gap-2 border-t bg-white">
        <input
          value={text}
          onChange={handleTyping}
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

export default ChatWindow;