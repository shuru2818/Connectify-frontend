import React, { useEffect, useState } from "react";
import api from "../api/axios";
import CreateGroupModal from "./CreateGroupModal";
import { useNavigate } from "react-router-dom";

const GroupSidebar = ({ onSelectGroup }) => {
  const [groups, setGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);

  const [search, setSearch] = useState("");

  const [openModal, setOpenModal] = useState(false);

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // FETCH GROUPS
  const fetchGroups = async () => {
    try {
      setLoading(true);

      const res = await api.get("/groups/my");

      setGroups(res.data);
      setFilteredGroups(res.data);
    } catch (err) {
      console.error("Error fetching groups:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  // SEARCH
  const handleSearch = (e) => {
    const value = e.target.value;

    setSearch(value);

    if (!value.trim()) {
      setFilteredGroups(groups);

      return;
    }

    const filtered = groups.filter((group) =>
      group.groupName.toLowerCase().includes(value.toLowerCase()),
    );

    setFilteredGroups(filtered);
  };

  return (
    <div className="w-[370px] h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 border-r border-slate-200 flex flex-col overflow-hidden relative">
      {/* BACKGROUND BLUR */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-indigo-400/10 blur-3xl rounded-full"></div>

      <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-400/10 blur-3xl rounded-full"></div>

      {/* HEADER */}
      <div className="relative z-10 p-5 border-b border-slate-200 bg-white/70 backdrop-blur-xl">
        {/* TOP */}
        <div className="flex items-center justify-between mb-5">
          {/* LEFT */}
          <div className="flex items-center gap-3">
            {/* BACK BUTTON */}
            <button
              onClick={() => navigate("/")}
              className="w-11 h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 flex items-center justify-center text-slate-700 text-lg transition-all duration-300"
            >
              ←
            </button>

            {/* TITLE */}
            <div>
              <h2
                onClick={() => navigate("/groupchat")}
                className="text-2xl font-black text-slate-800 tracking-tight cursor-pointer hover:text-indigo-600 transition"
              >
                Groups
              </h2>

              <p className="text-sm text-slate-500">Manage your communities</p>
            </div>
          </div>

          {/* CREATE BUTTON */}
          <button
            onClick={() => setOpenModal(true)}
            className="px-4 h-11 rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold shadow-lg hover:scale-105 active:scale-95 transition-all duration-300"
          >
            + Create
          </button>
        </div>

        {/* SEARCH */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search groups..."
            value={search}
            onChange={handleSearch}
            className="w-full h-14 rounded-2xl bg-slate-100 border border-slate-200 pl-14 pr-4 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />

          {/* ICON */}
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
            🔍
          </span>
        </div>
      </div>

      {/* GROUP LIST */}
      <div className="relative z-10 flex-1 overflow-y-auto px-3 py-4 space-y-3 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
        {/* LOADING */}
        {loading && (
          <div className="flex flex-col items-center justify-center h-40">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>

            <p className="text-slate-500 mt-4 font-medium">Loading groups...</p>
          </div>
        )}

        {/* EMPTY */}
        {!loading && filteredGroups.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            {/* ICON */}
            <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-5xl shadow-inner mb-6">
              👥
            </div>

            {/* TEXT */}
            <h3 className="text-2xl font-bold text-slate-700 mb-2">
              No Groups Found
            </h3>

            <p className="text-slate-400 leading-7 max-w-[250px]">
              Try searching another group name or create a new group.
            </p>
          </div>
        )}

        {/* GROUPS */}
        {!loading &&
          filteredGroups.map((group) => (
            <div
              key={group._id}
              onClick={() => onSelectGroup(group)}
              className="group relative flex items-center justify-between p-4 rounded-3xl cursor-pointer transition-all duration-300 border border-slate-200 bg-white hover:shadow-xl hover:-translate-y-1 hover:border-indigo-200 overflow-hidden"
            >
              {/* LEFT */}
              <div className="flex items-center gap-4 overflow-hidden">
                {/* IMAGE */}
                <div className="relative shrink-0">
                  <img
                    src={
                      group.groupImage ||
                      group.image ||
                      group.avatar ||
                      group.profilePic ||
                      `https://ui-avatars.com/api/?name=${group.groupName}&background=random`
                    }
                    alt={group.groupName}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-200"
                  />

                  {/* ACTIVE DOT */}
                  <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full border-[3px] border-white bg-green-500"></span>
                </div>

                {/* INFO */}
                <div className="overflow-hidden">
                  {/* NAME */}
                  <h3 className="font-bold text-slate-800 text-[15px] truncate group-hover:text-indigo-600 transition">
                    {group.groupName}
                  </h3>

                  {/* MEMBERS */}
                  <p className="text-sm text-slate-500 truncate mt-1">
                    👥 {group.participants?.length} Members
                  </p>
                </div>
              </div>

              {/* RIGHT */}
              <div className="flex flex-col items-end gap-2">
                {/* BADGE */}
                <div className="px-2 py-1 rounded-full bg-indigo-100 text-indigo-600 text-[10px] font-bold">
                  GROUP
                </div>

                {/* TIME */}
                <p className="text-[11px] text-slate-400">Active</p>
              </div>

              {/* HOVER EFFECT */}
              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition pointer-events-none bg-gradient-to-r from-indigo-500/[0.03] to-blue-500/[0.03]"></div>
            </div>
          ))}
      </div>
      {/* CREATE GROUP MODAL */}
      {openModal && (
        <CreateGroupModal
          onClose={() => setOpenModal(false)}
          onCreated={fetchGroups}
        />
      )}
    </div>
  );
};

export default GroupSidebar;
