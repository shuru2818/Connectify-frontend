import React, { useEffect, useState } from "react";
import api from "../api/axios";
import socket, { connectSocket } from "../socket";

const UsersList = ({ onSelectUser }) => {
  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [search, setSearch] = useState("");

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
      setOnlineUsers(data);
    });

    return () => socket.off("onlineUsers");
  }, []);

  // FETCH USERS
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get(
          `/users/search?query=${search || "a"}`
        );

        setUsers(res.data.users);
      } catch (err) {
        console.log(err);
      }
    };

    fetchUsers();
  }, [search]);

  return (
    <div className="w-1/3 h-screen border-r bg-gray-50 flex flex-col">

      {/* HEADER */}
      <div className="p-4 border-b bg-white">

        {/* TOP ROW */}
        <div className="flex items-center gap-2 mb-3">

          {/* BACK BUTTON */}
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 transition">
            ←
          </button>

          {/* TITLE */}
          <h2 className="text-lg font-semibold text-gray-800">
            Chats
          </h2>

        </div>

        {/* SEARCH BAR */}
        <div className="relative ml-2">

          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[92%] px-4 py-2 pl-10 text-sm rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />

          <span className="absolute left-3 top-2.5 text-gray-400 text-sm">
            🔍
          </span>

        </div>

      </div>

      {/* USERS LIST */}
      <div className="flex-1 overflow-y-auto">

        {users.length > 0 ? (
          users.map((user) => (
            <div
              key={user._id}
              onClick={() => onSelectUser(user)}
              className="flex items-center justify-between p-3 hover:bg-gray-100 cursor-pointer transition"
            >

              <div className="flex items-center gap-3">

                {/* USER AVATAR */}
                <div className="w-10 h-10 bg-blue-500 text-white flex items-center justify-center rounded-full font-semibold">
                  {user.username[0].toUpperCase()}
                </div>

                {/* USER NAME */}
                <div>
                  <p className="font-medium text-gray-800">
                    {user.username}
                  </p>
                </div>

              </div>

              {/* ONLINE STATUS */}
              <span
                className={`w-3 h-3 rounded-full ${
                  onlineUsers.includes(user._id)
                    ? "bg-green-500"
                    : "bg-gray-400"
                }`}
              />

            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-40 text-gray-400">
            No users found
          </div>
        )}

      </div>

    </div>
  );
};

export default UsersList;