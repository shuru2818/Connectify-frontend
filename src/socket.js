import { io } from "socket.io-client";

const socket = io("http://localhost:3200", {
  withCredentials: true,
  autoConnect: false,
});

let isConnected = false;

// CONNECT SOCKET
export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
    isConnected = true;
  }
};

// ADD USER
export const addUser = (userId) => {
  socket.emit("addUser", userId);
};

// SEND EVENTS
export const sendMessageSocket = (data) =>
  socket.emit("sendMessage", data);

export const markSeenSocket = (data) =>
  socket.emit("markSeen", data);

export const typingSocket = (data) =>
  socket.emit("typing", data);

export const stopTypingSocket = (data) =>
  socket.emit("stopTyping", data);

// LISTENERS
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

export default socket;