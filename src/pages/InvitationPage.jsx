import React, { useEffect, useState } from "react";
import api from "../api/axios";
import Invitation from "../components/Invitation ";
import socket from "../socket";

const InvitationPage = () => {
  const [sent, setSent] = useState([]);
  const [received, setReceived] = useState([]);

  // FETCH INVITES 
  useEffect(() => {
    const fetchInvites = async () => {
      const { data } = await api.get("/invitations/all");
      setSent(data.sent);
      setReceived(data.received);
    };

    fetchInvites();
  }, []);

  // REAL-TIME SOCKET LISTENERS 
  useEffect(() => {
    const handleNewInvitation = (invitation) => {
      setReceived((prev) => {
        const exists = prev.find((i) => i._id === invitation._id);
        if (exists) return prev;
        return [invitation, ...prev];
      });
    };

    const handleAccepted = ({ invitationId }) => {
      setSent((prev) =>
        prev.map((inv) =>
          inv._id === invitationId
            ? { ...inv, status: "accepted" }
            : inv
        )
      );
    };

    const handleRejected = ({ invitationId }) => {
      setSent((prev) =>
        prev.map((inv) =>
          inv._id === invitationId
            ? { ...inv, status: "rejected" }
            : inv
        )
      );
    };

    socket.on("newInvitation", handleNewInvitation);
    socket.on("invitationAccepted", handleAccepted);
    socket.on("invitationRejected", handleRejected);

    return () => {
      socket.off("newInvitation", handleNewInvitation);
      socket.off("invitationAccepted", handleAccepted);
      socket.off("invitationRejected", handleRejected);
    };
  }, []);

  // ACCEPT / REJECT
  const updateStatus = async (id, type) => {
    await api.post(`/invitations/${id}/${type}`);

    setReceived((prev) =>
      prev.map((invite) =>
        invite._id === id ? { ...invite, status: type } : invite
      )
    );
  };

  return (
    <Invitation
      sentInvites={sent}
      receivedInvites={received}
      onAccept={(id) => updateStatus(id, "accept")}
      onReject={(id) => updateStatus(id, "reject")}
    />
  );
};

export default InvitationPage;