import React, { useEffect, useState } from "react";
import api from "../api/axios";

const CreateGroupModal = ({ onClose, onCreated }) => {
  const [groupName, setGroupName] = useState("");
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await api.get("/users/search?query=a");
      setUsers(res.data.users);
    };
    fetchUsers();
  }, []);

  const toggleUser = (id) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((u) => u !== id)
        : [...prev, id]
    );
  };

  const createGroup = async () => {
    if (!groupName || selected.length === 0) {
      alert("Fill all fields");
      return;
    }

    await api.post("/groups/create", {
      groupName,
      participants: selected,
    });

    onCreated(); // refresh groups
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">

      <div className="bg-white p-5 rounded w-96">

        <h2 className="font-bold mb-3">Create Group</h2>

        <input
          placeholder="Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="w-full border p-2 mb-3"
        />

        <div className="h-40 overflow-y-auto border p-2">
          {users.map((user) => (
            <div key={user._id} className="flex gap-2">
              <input
                type="checkbox"
                onChange={() => toggleUser(user._id)}
              />
              <span>{user.username}</span>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 mt-3">
          <button onClick={onClose}>Cancel</button>

          <button
            onClick={createGroup}
            className="bg-blue-500 text-white px-3 py-1 rounded"
          >
            Create
          </button>
        </div>

      </div>
    </div>
  );
};

export default CreateGroupModal;