import { io } from "socket.io-client";

const socket = io("http://localhost:3200", {
  withCredentials: true,
  autoConnect: false,
});

export const connectSocket = (userId) => {
  if (!socket.connected) socket.connect();
  if (userId) socket.emit("addUser", userId);
};

export const joinChat = (chatId) => {
  if (!chatId) return;
  socket.emit("joinChat", chatId);
};

export const sendMessageSocket = (data) => {
  socket.emit("sendMessage", data);
};

export const typingSocket = (data) => {
  socket.emit("typing", data);
};

export const stopTypingSocket = (data) => {
  socket.emit("stopTyping", data);
};

export const markSeenSocket = (data) => {
  socket.emit("markSeen", data);
};

export const onReceiveMessage = (cb) => {
  socket.off("receiveMessage");
  socket.on("receiveMessage", cb);
};

export const onTyping = (cb) => {
  socket.off("showTyping");
  socket.on("showTyping", cb);
};

export const onStopTyping = (cb) => {
  socket.off("hideTyping");
  socket.on("hideTyping", cb);
};

export const onMessagesSeen = (cb) => {
  socket.off("messagesSeen");
  socket.on("messagesSeen", cb);
};

export default socket;