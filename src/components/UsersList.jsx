import React, { useEffect, useState } from "react";
import api from "../api/axios";
import socket, { connectSocket } from "../socket";

const UsersList = ({ onSelectUser }) => {
  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);

  // SOCKET CONNECT
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    connectSocket();

    socket.on("connect", () => {
      if (user) {
        socket.emit("addUser", user._id);
      }
    });

    return () => socket.off("connect");
  }, []);

  // ONLINE USERS LISTENER
  useEffect(() => {
    socket.on("onlineUsers", (data) => {
      setOnlineUsers(data); // array of userIds
    });

    return () => socket.off("onlineUsers");
  }, []);

  // FETCH USERS
  useEffect(() => {
    const fetchUsers = async () => {
      const res = await api.get("/users/search?query=a");
      setUsers(res.data.users);
    };

    fetchUsers();
  }, []);

  return (
    <div className="w-1/3 h-screen border-r bg-gray-50 flex flex-col">

      <div className="p-4 border-b bg-white">
        <h2 className="text-lg font-semibold ml-10">Chats</h2>
      </div>

      <div className="flex-1 overflow-y-auto">

        {users.map((user) => (
          <div
            key={user._id}
            onClick={() => onSelectUser(user)}
            className="flex items-center justify-between p-3 hover:bg-gray-100 cursor-pointer"
          >

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 bg-blue-500 text-white flex items-center justify-center rounded-full">
                {user.username[0].toUpperCase()}
              </div>

              <div>
                <p className="font-medium">{user.username}</p>
              </div>

            </div>

            {/* ONLINE DOT */}
            <span
              className={`w-3 h-3 rounded-full ${
                onlineUsers.includes(user._id)
                  ? "bg-green-500"
                  : "bg-gray-400"
              }`}
            />
          </div>
        ))}

      </div>
    </div>
  );
};

export default UsersList;