import React from "react";

const NotificationCard = ({ n, onRead, onDelete }) => {
  return (
    <div
      className={`flex justify-between items-start gap-4 p-4 rounded-xl border transition shadow-sm
      ${n.isRead ? "bg-white" : "bg-blue-50 border-blue-200"}`}
    >
      {/* LEFT CONTENT */}
      <div className="flex-1">
        <p className="text-sm text-gray-800 leading-relaxed">
          <span className="font-semibold text-gray-900">
            {n.sender?.username || "System"}
          </span>{" "}
          {n.type === "message" && "sent you a message"}
          {n.type === "invitation" && "sent an invitation"}
          {n.type === "accepted" && "accepted your request"}
          {n.type === "rejected" && "rejected your request"}
        </p>

        {n.message?.text && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
            {n.message.text}
          </p>
        )}
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex items-center gap-2 shrink-0">
        {!n.isRead && (
          <button
            onClick={() => onRead(n._id)}
            className="text-xs px-3 py-1 rounded-md bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition"
          >
            Read
          </button>
        )}

        <button
          onClick={() => onDelete(n._id)}
          className="text-xs px-3 py-1 rounded-md bg-red-100 text-red-600 hover:bg-red-200 transition"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default NotificationCard;