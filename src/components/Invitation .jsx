import React from "react";

const InviteCard = ({ user, status, onAccept, onReject, id }) => (
  <div className="bg-white border border-indigo-100 p-4 rounded-xl shadow-sm mb-3 flex justify-between items-center hover:shadow-md transition">

    {/* User Info */}
    <div>
      <p className="font-semibold text-gray-800">{user.username}</p>
      <p className="text-sm text-gray-400">{user.email}</p>
    </div>

    {/* Actions */}
    {status === "pending" && onAccept ? (
      <div className="flex gap-2">
        <button
          onClick={() => onAccept(id)}
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-1.5 rounded-md text-sm transition"
        >
          Accept
        </button>
        <button
          onClick={() => onReject(id)}
          className="border border-red-400 text-red-500 hover:bg-red-50 px-4 py-1.5 rounded-md text-sm transition"
        >
          Reject
        </button>
      </div>
    ) : (
      <span
        className={`text-xs font-medium px-3 py-1 rounded-full 
        ${
          status === "accepted"
            ? "bg-green-100 text-green-600"
            : status === "rejected"
            ? "bg-red-100 text-red-500"
            : "bg-gray-100 text-gray-500"
        }`}
      >
        {status}
      </span>
    )}
  </div>
);

const Invitation = ({ sentInvites = [], receivedInvites = [], onAccept, onReject }) => {
  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white p-6 rounded-2xl shadow-lg">

      {/* Heading */}
      <h2 className="text-2xl font-bold text-indigo-600 mb-6">
        Invitations
      </h2>

      {/* Received */}
      <div className="mb-8">
        <h3 className="text-md font-semibold text-gray-700 mb-3 border-l-4 border-indigo-500 pl-2">
          Received Invitations
        </h3>

        {receivedInvites.length === 0 ? (
          <p className="text-gray-400 text-sm">No invitations</p>
        ) : (
          receivedInvites.map(invite => (
            <InviteCard
              key={invite._id}
              id={invite._id}
              user={invite.sender}
              status={invite.status}
              onAccept={onAccept}
              onReject={onReject}
            />
          ))
        )}
      </div>

      {/* Sent */}
      <div>
        <h3 className="text-md font-semibold text-gray-700 mb-3 border-l-4 border-indigo-500 pl-2">
          Sent Invitations
        </h3>

        {sentInvites.length === 0 ? (
          <p className="text-gray-400 text-sm">No sent invites</p>
        ) : (
          sentInvites.map(invite => (
            <InviteCard
              key={invite._id}
              user={invite.receiver}
              status={invite.status}
            />
          ))
        )}
      </div>

    </div>
  );
};

export default Invitation;