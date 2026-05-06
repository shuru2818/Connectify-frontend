import { io } from "socket.io-client";

const socket = io("http://localhost:3200", {
  withCredentials: true,
  autoConnect: false,
});

// ✅ Connect
export const connectSocket = (userId) => {
  if (!socket.connected) socket.connect();
  if (userId) socket.emit("addUser", userId);
};

// ✅ Join chat
export const joinChat = (chatId) => {
  if (!chatId) return;
  socket.emit("joinChat", chatId);
};

// ✅ Typing
export const typingSocket = (data) => {
  socket.emit("typing", data);
};

export const stopTypingSocket = (data) => {
  socket.emit("stopTyping", data);
};

// ✅ Listeners (FIXED CLEANUP)
export const onReceiveMessage = (cb) => {
  socket.on("receiveMessage", cb);
  return () => socket.off("receiveMessage", cb);
};

export const onTyping = (cb) => {
  socket.on("showTyping", cb);
  return () => socket.off("showTyping", cb);
};

export const onStopTyping = (cb) => {
  socket.on("hideTyping", cb);
  return () => socket.off("hideTyping", cb);
};

export const onMessagesSeen = (cb) => {
  socket.on("messagesSeen", cb);
  return () => socket.off("messagesSeen", cb);
};

export const onOnlineUsers = (cb) => {
  socket.on("onlineUsers", cb);
  return () => socket.off("onlineUsers", cb);
};

export default socket;