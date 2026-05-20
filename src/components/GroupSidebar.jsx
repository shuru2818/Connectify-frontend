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

  // SEARCH HANDLER
  const handleSearch = (e) => {

    const value = e.target.value;

    setSearch(value);

    if (!value.trim()) {
      setFilteredGroups(groups);
      return;
    }

    const filtered = groups.filter((group) =>
      group.groupName
        .toLowerCase()
        .includes(value.toLowerCase())
    );

    setFilteredGroups(filtered);
  };

  return (
    <div className="w-1/4 bg-white border-r flex flex-col">

      {/* HEADER */}
      <div className="p-4 border-b flex justify-between items-center">

        <div className="flex items-center gap-3">

          <button
            onClick={() => navigate("/")}
            className="text-xl font-bold hover:text-gray-600"
          >
            ←
          </button>

          <h2
            onClick={() => navigate("/groupchat")}
            className="font-bold text-lg cursor-pointer hover:text-blue-500"
          >
            Groups
          </h2>

        </div>

        <button
          onClick={() => setOpenModal(true)}
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        >
          + Create
        </button>

      </div>

      {/* SEARCH BOX */}
      <div className="p-3 border-b">

        <input
          type="text"
          placeholder="Search groups..."
          value={search}
          onChange={handleSearch}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring"
        />

      </div>

      {/* GROUP LIST */}
      <div className="flex-1 overflow-y-auto">

        {loading && (
          <p className="p-3 text-gray-500">
            Loading...
          </p>
        )}

        {!loading && filteredGroups.length === 0 && (
          <p className="p-3 text-gray-500">
            No groups found
          </p>
        )}

        {filteredGroups.map((group) => (
          <div
            key={group._id}
            onClick={() => onSelectGroup(group)}
            className="p-3 hover:bg-gray-100 cursor-pointer border-b flex items-center gap-3"
          >

            {/* GROUP PROFILE PIC */}
            <div className="relative">

              <img
                src={
                  group.groupImage ||
                  group.image ||
                  group.avatar ||
                  group.profilePic ||
                  `https://ui-avatars.com/api/?name=${group.groupName}&background=random`
                }
                alt={group.groupName}
                className="w-12 h-12 rounded-full object-cover border border-gray-300"
              />

              {/* OPTIONAL STATUS DOT */}
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white bg-gray-400" />

            </div>

            {/* GROUP INFO */}
            <div className="flex flex-col">

              <p className="font-medium text-gray-800">
                {group.groupName}
              </p>

              <p className="text-xs text-gray-500">
                {group.participants?.length} members
              </p>

            </div>

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