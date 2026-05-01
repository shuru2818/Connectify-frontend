import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useState } from 'react';
import UserSearch from '../components/UserSearch';

const Home = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inviteStatus, setInviteStatus] = useState({});


  // 🔍 search users
  const handleSearch = async () => {
    if (!search.trim()) return;

    try {
      setLoading(true);

      const res = await axios.get(
        `/users?search=${search}`
      );

      setUsers(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // 📩 send invitation
  const sendInvite = async (receiverId) => {
    try {
      setInviteStatus((prev) => ({
        ...prev,
        [receiverId]: "sending",
      }));

      await axios.post(
        "/api/invitation/send",
        { receiverIds: [receiverId] },
        { withCredentials: true }
      );

      setInviteStatus((prev) => ({
        ...prev,
        [receiverId]: "pending",
      }));
    } catch (err) {
      console.log(err);
      setInviteStatus((prev) => ({
        ...prev,
        [receiverId]: "error",
      }));
    }
  };


  return (
    <div className="min-h-screen bg-[#f8fafc]">
      
      <nav className="flex items-center justify-between px-8 py-4 bg-white shadow-sm border-b border-indigo-50">
        
        <div className="text-2xl font-black text-indigo-600 cursor-pointer tracking-tight">
          CHATAPP
        </div>

        <ul className="hidden md:flex space-x-8 font-semibold text-slate-500">
          <li className="hover:text-indigo-600 cursor-pointer transition-all">Home</li>
          <li className="hover:text-indigo-600 cursor-pointer transition-all"><Link to="/chat">DMs</Link></li>
          <li className="hover:text-indigo-600 cursor-pointer transition-all">Group Chat</li>
          <li className="hover:text-indigo-600 cursor-pointer transition-all"><Link to="/invitation">Invitation</Link></li>
          <li className="hover:text-indigo-600 cursor-pointer transition-all flex items-center">
            Notifications
            <span className="ml-2 w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
          </li>
        </ul>

        <div className="flex items-center space-x-5">
          <button
            onClick={() => navigate("/login")}
            className="text-slate-600 font-bold hover:text-indigo-600 transition"
          >
            Login
          </button>

          <button
            onClick={() => navigate("/signup")}
            className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-full hover:bg-indigo-700 hover:shadow-indigo-200 shadow-lg transition-all transform hover:-translate-y-0.5"
          >
            Sign Up
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto flex flex-col items-center justify-center text-center mt-10 md:mt-8 px-4">
        
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-tight">
          Communication made <span className="text-indigo-600">effortless.</span>
        </h1>

        <p className="text-lg text-slate-500 mt-2 max-w-2xl">
          Experience the next generation of chatting. Secure, fast, and built for communities.
        </p>

        <div className="mt-6 flex space-x-4">
          <button onClick={() => navigate("/chat")} className="px-8 py-3 bg-indigo-600 text-white rounded-full font-bold shadow-xl hover:bg-indigo-700">
            Start Chatting
          </button>

          <button onClick={() => navigate("/features")} className="px-8 py-3 bg-white text-indigo-600 border-2 border-indigo-600 rounded-full font-bold hover:bg-indigo-50">
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