import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getNotifications,
  readNotification,
  readAllNotifications,
  removeNotification,
} from "../api/notification";
import NotificationCard from "../components/NotificationCard";

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.data);
    } catch (err) {
      console.log("error fetching notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const handler = (e) => {
      const newNotif = e.detail;

      setNotifications((prev) => {
        const exists = prev.find((n) => n._id === newNotif._id);
        if (exists) return prev;

        return [newNotif, ...prev];
      });
    };

    window.addEventListener("new_notification", handler);
    return () => window.removeEventListener("new_notification", handler);
  }, []);

  const handleRead = async (id) => {
    try {
      await readNotification(id);

      setNotifications((prev) =>
        prev.map((n) =>
          n._id === id ? { ...n, isRead: true } : n
        )
      );

      window.dispatchEvent(new Event("notification_read"));
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await removeNotification(id);

      setNotifications((prev) =>
        prev.filter((n) => n._id !== id)
      );
    } catch (err) {
      console.log(err);
    }
  };

  const handleMarkAll = async () => {
    try {
      await readAllNotifications();

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );

      window.dispatchEvent(new Event("notification_read_all"));
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-2xl mx-auto">

        {/* HEADER CARD */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border mb-6">
          <div className="flex items-center justify-between">

            {/* LEFT */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium transition"
              >
                ← Back
              </button>

              <h2 className="text-xl md:text-2xl font-semibold text-gray-800">
                Notifications
              </h2>
            </div>

            {/* RIGHT */}
            {notifications.length > 0 && (
              <button
                onClick={handleMarkAll}
                className="text-sm px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-sm"
              >
                Mark all read
              </button>
            )}
          </div>
        </div>

        {/* BODY */}
        {notifications.length === 0 ? (
          <div className="text-center bg-white p-12 rounded-2xl shadow-sm border">
            <p className="text-gray-500 text-lg">
              🎉 You're all caught up!
            </p>
            <p className="text-sm text-gray-400 mt-1">
              No notifications yet
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((n) => (
              <NotificationCard
                key={n._id}
                n={n}
                onRead={handleRead}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;