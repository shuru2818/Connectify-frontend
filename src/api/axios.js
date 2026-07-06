import axios from "axios";
const isLocal = window.location.hostname === "localhost";
const api = axios.create({
  baseURL: isLocal
    ? "http://localhost:3200/api"
    : "https://connectify-backend-4hav.onrender.com/api",
  headers: {
    "Content-Type": "application/json"
  }
});
api.interceptors.request.use(
  (config) => {

    const token = localStorage.getItem("token");

    console.log("TOKEN", token);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default api;