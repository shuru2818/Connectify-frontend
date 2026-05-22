import React, { useEffect, useState } from "react";
import api from "../api/axios";
import socket, {
  connectSocket,
  onReceiveMessage,
} from "../socket";

const UsersList = ({
  onSelectUser,
  selectedUser,
}) => {

  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [search, setSearch] = useState("");

  // ✅ UNSEEN MESSAGES
  const [unseenMessages, setUnseenMessages] =
    useState({});

  // ✅ LAST MESSAGES
  const [lastMessages, setLastMessages] =
    useState({});

  const currentUser = JSON.parse(
    localStorage.getItem("user")
  );

  // SOCKET CONNECT
  useEffect(() => {

    const user = JSON.parse(
      localStorage.getItem("user")
    );

    connectSocket();

    socket.on("connect", () => {

      if (user) {
        socket.emit("addUser", user._id);
      }

    });

    return () => socket.off("connect");

  }, []);

  // ONLINE USERS
  useEffect(() => {

    socket.on("onlineUsers", (data) => {
      setOnlineUsers(data);
    });

    return () =>
      socket.off("onlineUsers");

  }, []);

  // ✅ RECEIVE MESSAGE
  useEffect(() => {

    const cleanup = onReceiveMessage(
      (data) => {

        // ✅ FIND OTHER USER ID
        const otherUserId =
          data.sender?._id ===
          currentUser._id
            ? data.receiverId
            : data.sender?._id;

        // ✅ LAST MESSAGE UPDATE
        setLastMessages((prev) => ({
          ...prev,

          [otherUserId]:
            data.type === "image"
              ? "📷 Photo"
              : data.type === "file"
              ? "📎 File"
              : data.sender?._id ===
                currentUser._id
              ? `You: ${data.content}`
              : data.content,
        }));

        // ✅ CURRENT CHAT OPEN
        if (
          selectedUser &&
          data.sender?._id ===
            selectedUser._id
        ) {
          return;
        }

        // ✅ ONLY FOR INCOMING MSG
        if (
          data.sender?._id !==
          currentUser._id
        ) {

          setUnseenMessages((prev) => ({
            ...prev,

            [data.sender?._id]:
              (prev[
                data.sender?._id
              ] || 0) + 1,
          }));

        }

      }
    );

    return cleanup;

  }, [selectedUser]);

  // FETCH USERS
  useEffect(() => {

    const fetchUsers = async () => {

      try {

        const res = await api.get(
          `/users/search?query=${
            search || "a"
          }`
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
            onChange={(e) =>
              setSearch(e.target.value)
            }
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
              onClick={() => {

                // ✅ RESET UNREAD
                setUnseenMessages(
                  (prev) => ({
                    ...prev,
                    [user._id]: 0,
                  })
                );

                onSelectUser(user);
              }}
              className={`flex items-center justify-between p-3 cursor-pointer transition hover:bg-gray-100 ${
                selectedUser?._id ===
                user._id
                  ? "bg-gray-100"
                  : ""
              }`}
            >

              {/* LEFT */}
              <div className="flex items-center gap-3 overflow-hidden">

                {/* PROFILE */}
                <div className="relative">

                  <img
                    src={
                      user.profilePic
                        ? user.profilePic
                        : `https://ui-avatars.com/api/?name=${user.username}&background=random`
                    }
                    alt={user.username}
                    className="w-12 h-12 rounded-full object-cover border border-gray-300"
                  />

                  {/* ONLINE DOT */}
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                      onlineUsers.includes(
                        user._id
                      )
                        ? "bg-green-500"
                        : "bg-gray-400"
                    }`}
                  />

                </div>

                {/* USER INFO */}
                <div className="overflow-hidden max-w-[180px]">

                  {/* USERNAME */}
                  <p className="font-medium text-gray-800 truncate">
                    {user.username}
                  </p>

                  {/* LAST MESSAGE */}
                  <p className="text-xs text-gray-500 truncate">

                    {lastMessages[user._id]
                      ? lastMessages[
                          user._id
                        ]
                      : onlineUsers.includes(
                          user._id
                        )
                      ? "Online"
                      : "Offline"}

                  </p>

                </div>

              </div>

              {/* RIGHT SIDE */}
              <div className="flex flex-col items-end gap-1">

                {/* UNREAD BADGE */}
                {unseenMessages[user._id] >
                  0 && (
                  <div className="min-w-[22px] h-[22px] px-1 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-semibold">

                    {
                      unseenMessages[
                        user._id
                      ]
                    }

                  </div>
                )}

              </div>

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