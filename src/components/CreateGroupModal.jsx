import React, { useEffect, useState } from "react";

import api from "../api/axios";

const CreateGroupModal = ({ onClose, onCreated }) => {
  const [groupName, setGroupName] = useState("");

  const [users, setUsers] = useState([]);

  const [selected, setSelected] = useState([]);

  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  // FETCH USERS
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/users/search?query=a");

        setUsers(res.data.users);
      } catch (err) {
        console.log(err);
      }
    };

    fetchUsers();
  }, []);

  // SELECT USER
  const toggleUser = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id],
    );
  };

  // CREATE GROUP
  const createGroup = async () => {
    if (!groupName.trim() || selected.length === 0) {
      alert("Please fill all fields");

      return;
    }

    try {
      setLoading(true);

      await api.post("/groups/create", {
        groupName,
        participants: selected,
      });

      onCreated();

      onClose();
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // FILTER USERS
  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
      {/* MODAL */}
      <div className="relative w-full max-w-md bg-white rounded-[30px] overflow-hidden shadow-2xl">
        {/* HEADER */}
        <div className="px-5 py-4 border-b border-slate-200 bg-white/80 backdrop-blur-xl flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-800">Create Group</h2>

            <p className="text-xs text-slate-500 mt-1">
              Start a new conversation
            </p>
          </div>

          {/* CLOSE */}
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition"
          >
            ✕
          </button>
        </div>

        {/* BODY */}
        <div className="p-5">
          {/* GROUP NAME */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Enter group name..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full h-12 rounded-2xl bg-slate-100 border border-slate-200 px-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* SEARCH */}
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 rounded-2xl bg-slate-100 border border-slate-200 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              🔍
            </span>
          </div>

          {/* SELECTED USERS */}
          {selected.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              {users
                .filter((u) => selected.includes(u._id))
                .map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center gap-2 bg-indigo-100 text-indigo-700 px-2 py-2 rounded-xl text-xs font-semibold"
                  >
                    <img
                      src={
                        user.profilePic ||
                        `https://ui-avatars.com/api/?name=${user.username}&background=random`
                      }
                      alt={user.username}
                      className="w-6 h-6 rounded-full object-cover"
                    />

                    <span className="truncate">{user.username}</span>
                  </div>
                ))}
            </div>
          )}

          {/* USERS */}
          <div className="h-[230px] overflow-y-auto space-y-2 pr-1">
            {filteredUsers.map((user) => {
              const isSelected = selected.includes(user._id);

              return (
                <div
                  key={user._id}
                  onClick={() => toggleUser(user._id)}
                  className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer border transition-all ${
                    isSelected
                      ? "bg-gradient-to-r from-indigo-500 to-blue-500 border-transparent"
                      : "bg-white border-slate-200 hover:border-indigo-200 hover:bg-slate-50"
                  }`}
                >
                  {/* LEFT */}
                  <div className="flex items-center gap-3 overflow-hidden">
                    <img
                      src={
                        user.profilePic ||
                        `https://ui-avatars.com/api/?name=${user.username}&background=random`
                      }
                      alt={user.username}
                      className={`w-10 h-10 rounded-xl object-cover border ${
                        isSelected ? "border-white" : "border-slate-200"
                      }`}
                    />

                    <div className="overflow-hidden">
                      <h3
                        className={`font-semibold text-sm truncate ${
                          isSelected ? "text-white" : "text-slate-800"
                        }`}
                      >
                        {user.username}
                      </h3>

                      <p
                        className={`text-xs ${
                          isSelected ? "text-indigo-100" : "text-slate-400"
                        }`}
                      >
                        Select User
                      </p>
                    </div>
                  </div>

                  {/* CHECK */}
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isSelected
                        ? "bg-white text-indigo-600"
                        : "border border-slate-300"
                    }`}
                  >
                    {isSelected && "✓"}
                  </div>
                </div>
              );
            })}
          </div>

          {/* BUTTONS */}
          <div className="flex gap-3 mt-5">
            <button
              onClick={onClose}
              className="flex-1 h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition"
            >
              Cancel
            </button>

            <button
              onClick={createGroup}
              disabled={loading}
              className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-bold shadow-lg hover:scale-[1.02] transition disabled:opacity-70"
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;
