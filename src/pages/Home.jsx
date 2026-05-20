import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import UserSearch from "../components/UserSearch";
import { getNotifications } from "../api/notification";
import Profile from "../pages/Profile.jsx"

const Home = () => {
  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch (e) {
    user = null;
  }

  const navigate = useNavigate();

  const [openMenu, setOpenMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setOpenMenu(false);
    navigate("/");
  };

  const loadUnreadCount = async () => {
    try {
      const res = await getNotifications();
      const unread = res.data.filter((n) => !n.isRead).length;
      setUnreadCount(unread);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadUnreadCount();

    const handleNewNotif = () => {
      setUnreadCount((prev) => prev + 1);
    };

    const handleClickOutside = () => setOpenMenu(false);

    window.addEventListener("new_notification", handleNewNotif);
    window.addEventListener("click", handleClickOutside);

    return () => {
      window.removeEventListener("new_notification", handleNewNotif);
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-100 overflow-hidden">

      {/* BACKGROUND BLURS */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-indigo-300 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-300 rounded-full blur-3xl opacity-20"></div>

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 bg-white/70 backdrop-blur-xl border-b border-white/40 shadow-sm">

        <div className="text-3xl font-black bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent cursor-pointer">
          CHATAPP
        </div>

        <ul className="hidden md:flex items-center space-x-8 font-semibold text-slate-600">
          <li className="hover:text-indigo-600 transition cursor-pointer">
            Home
          </li>

          <li className="hover:text-indigo-600 transition cursor-pointer">
            <Link to="/chat">DMs</Link>
          </li>

          <li className="hover:text-indigo-600 transition cursor-pointer">
            <Link to="/groupchat">Group Chat</Link>
          </li>

          <li className="hover:text-indigo-600 transition cursor-pointer">
            <Link to="/invitation">Invitation</Link>
          </li>

          <li className="hover:text-indigo-600 transition cursor-pointer flex items-center">
            <Link to="/notifications">Notification</Link>

            {unreadCount > 0 && (
              <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] text-white font-bold animate-pulse">
                {unreadCount}
              </span>
            )}
          </li>
        </ul>

        {/* USER DROPDOWN */}
        {user?.username ? (
          <div className="relative">

            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenu(!openMenu);
              }}
              className="flex items-center gap-3 px-3 py-2 rounded-full bg-white shadow font-bold text-slate-700 hover:shadow-md transition"
            >

              {/* PROFILE IMAGE */}
              <img
                src={
                  user.profilePic ||
                  `https://ui-avatars.com/api/?name=${user.username}&background=random&color=fff`
                }
                alt="profile"
                className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500"
              />

              {/* USERNAME */}
              <span>
                {user.username}
              </span>

            </button>

            {openMenu && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 mt-3 w-56 bg-white border border-slate-100 shadow-2xl rounded-2xl overflow-hidden z-50"
              >

                {/* PROFILE */}
                <button
                  onClick={() => {
                    navigate("/profile");
                    setOpenMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 transition"
                >

                  <img
                    src={
                      user.profilePic ||
                      `https://ui-avatars.com/api/?name=${user.username}&background=random&color=fff`
                    }
                    alt="profile"
                    className="w-11 h-11 rounded-full object-cover"
                  />

                  <div className="text-left">
                    <p className="font-semibold text-slate-800">
                      {user.username}
                    </p>

                    <p className="text-xs text-slate-400">
                      View Profile
                    </p>
                  </div>

                </button>

                {/* LOGOUT */}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-red-500 hover:bg-red-50 font-semibold transition border-t"
                >
                  Logout
                </button>

              </div>
            )}

          </div>
        ) : (
          <div className="flex items-center space-x-4">

            <button
              onClick={() => navigate("/login")}
              className="font-bold text-slate-600 hover:text-indigo-600 transition"
            >
              Login
            </button>

            <button
              onClick={() => navigate("/signup")}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-500 text-white font-bold rounded-full shadow-lg hover:scale-105 transition"
            >
              Sign Up
            </button>

          </div>
        )}

      </nav>

      {/* HERO SECTION */}
      <main className="relative max-w-7xl mx-auto px-6 pt-32 pb-20">

        {/* USER SEARCH */}
        <div className="absolute top-0 right-6 z-40 w-[320px]">
          <UserSearch />
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* LEFT */}
          <div>

            <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 font-semibold text-sm mb-6">
              ⚡ Next Generation Messaging Platform
            </div>

            <h1 className="text-6xl md:text-7xl font-black leading-[1.05] tracking-tight text-slate-900">
              Chat Smarter,
              <br />
              <span className="bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
                Connect Faster.
              </span>
            </h1>

            <p className="text-lg text-slate-500 mt-8 max-w-2xl leading-8">
              Experience realtime communication with secure messaging,
              instant notifications, file sharing, group chats,
              and modern collaboration tools built for everyone.
            </p>

            <div className="mt-10 flex flex-wrap gap-5">

              <button
                onClick={() => navigate("/chat")}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-2xl font-bold shadow-xl hover:scale-105 transition"
              >
                Start Chatting
              </button>

              <button
                onClick={() => navigate("/features")}
                className="px-8 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 hover:shadow-lg transition"
              >
                View Features
              </button>

            </div>

          </div>

          {/* RIGHT CHAT PREVIEW */}
          <div className="relative">

            <div className="bg-white/80 backdrop-blur-xl rounded-[35px] shadow-2xl p-6 border border-white/50">

              {/* TOP */}
              <div className="flex items-center justify-between border-b pb-4">

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500"></div>

                  <div>
                    <h3 className="font-bold text-slate-800">
                      Team Chat
                    </h3>

                    <p className="text-sm text-green-500">
                      ● Online
                    </p>
                  </div>
                </div>

                <div className="text-2xl">
                  💬
                </div>

              </div>

              {/* MESSAGES */}
              <div className="space-y-4 mt-6">

                <div className="flex">
                  <div className="bg-slate-100 px-5 py-3 rounded-2xl rounded-bl-sm text-slate-700 max-w-xs shadow-sm">
                    Hey 👋 How’s the project going?
                  </div>
                </div>

                <div className="flex justify-end">
                  <div className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white px-5 py-3 rounded-2xl rounded-br-sm max-w-xs shadow-lg">
                    Everything working perfectly now 🚀
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
};

export default Home;