import React, { useEffect, useState } from "react";
import api from "../api/axios";
import CreateGroupModal from "./CreateGroupModal";
import { useNavigate } from "react-router-dom";

const GroupSidebar = ({ onSelectGroup }) => {
  const [groups, setGroups] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // FETCH GROUPS
  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await api.get("/groups/my");
      setGroups(res.data);
    } catch (err) {
      console.error("Error fetching groups:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <div className="w-1/4 bg-white border-r flex flex-col">

      
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

      
      <div className="flex-1 overflow-y-auto">

        {loading && (
          <p className="p-3 text-gray-500">Loading...</p>
        )}

        {!loading && groups.length === 0 && (
          <p className="p-3 text-gray-500">
            No groups yet
          </p>
        )}

        {groups.map((group) => (
          <div
            key={group._id}
            onClick={() => onSelectGroup(group)}
            className="p-3 hover:bg-gray-100 cursor-pointer border-b"
          >
            <p className="font-medium">👥 {group.groupName}</p>

            <p className="text-xs text-gray-500">
              {group.participants?.length} members
            </p>
          </div>
        ))}
      </div>

     
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