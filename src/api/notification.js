import api from "../api/axios";

export const getNotifications = () => {
  return api.get("/notifications/allnotifications");
};

export const readNotification = (id) => {
  return api.put(`/notifications/${id}/read`);
};

export const readAllNotifications = () => {
  return api.put("/notifications/marks-all-read");
};

export const removeNotification = (id) => {
  return api.delete(`/notifications/${id}`);
};