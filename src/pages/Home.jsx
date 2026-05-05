import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import UserSearch from '../components/UserSearch';
import { getNotifications } from '../api/notification';

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
      const unread = res.data.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadUnreadCount();

    const handleNewNotif = () => {
      setUnreadCount(prev => prev + 1);
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
    <div className="min-h-screen bg-[#f8fafc]">

      <nav className="flex items-center justify-between px-8 py-4 bg-white shadow-sm border-b border-indigo-50">

        <div className="text-2xl font-black text-indigo-600 cursor-pointer">
          CHATAPP
        </div>

        <ul className="hidden md:flex space-x-8 font-semibold text-slate-500">
          <li className="hover:text-indigo-600 cursor-pointer">Home</li>
          <li className="hover:text-indigo-600 cursor-pointer"><Link to="/chat">DMs</Link></li>
          <li className="hover:text-indigo-600 cursor-pointer"><Link to="/groupchat">Group Chat</Link></li>
          <li className="hover:text-indigo-600 cursor-pointer"><Link to="/invitation">Invitation</Link></li>
          <li className="hover:text-indigo-600 cursor-pointer flex items-center">
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
              className="font-bold text-slate-700 hover:text-indigo-600"
            >
              {user.username}
            </button>

            {openMenu && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 mt-2 w-36 bg-white border shadow-lg rounded-md z-50"
              >
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-50 font-semibold"
                >
                  Logout
                </button>
              </div>
            )}

          </div>
        ) : (
          <div className="flex items-center space-x-5">
            <button
              onClick={() => navigate("/login")}
              className="text-slate-600 font-bold hover:text-indigo-600"
            >
              Login
            </button>

            <button
              onClick={() => navigate("/signup")}
              className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-full hover:bg-indigo-700"
            >
              Sign Up
            </button>
          </div>
        )}

      </nav>

      <main className="max-w-6xl mx-auto flex flex-col items-center text-center mt-10 px-4">

        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900">
          Communication made <span className="text-indigo-600">effortless.</span>
        </h1>

        <p className="text-lg text-slate-500 mt-2 max-w-2xl">
          Experience next-gen chatting. Secure, fast, and built for communities.
        </p>

        <div className="mt-6 flex space-x-4">
          <button
            onClick={() => navigate("/chat")}
            className="px-8 py-3 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700"
          >
            Start Chatting
          </button>

          <button
            onClick={() => navigate("/features")}
            className="px-8 py-3 bg-white text-indigo-600 border-2 border-indigo-600 rounded-full font-bold hover:bg-indigo-50"
          >
            View Features
          </button>
        </div>

        <div className="w-full mt-10">
          <UserSearch />
        </div>

      </main>
    </div>
  );
};

export default Home;