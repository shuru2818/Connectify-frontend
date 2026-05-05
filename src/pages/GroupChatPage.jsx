import React, { useState } from "react";
import GroupSidebar from "../components/GroupSidebar";
import GroupChatWindow from "../components/GroupChatWindow";

const GroupChatPage = () => {
  const [selectedGroup, setSelectedGroup] = useState(null);

  return (
    <div className="flex h-screen bg-gray-100">

      {/* LEFT SIDEBAR */}
      <GroupSidebar onSelectGroup={setSelectedGroup} />

      {/* RIGHT CHAT */}
      {selectedGroup ? (
        <GroupChatWindow selectedGroup={selectedGroup} />
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          Select a group to start chatting
        </div>
      )}
    </div>
  );
};

export default GroupChatPage;