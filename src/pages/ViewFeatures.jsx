import React from "react";
import { useNavigate } from "react-router-dom";

const Features = () => {
  const navigate = useNavigate();

  const features = [
    {
      id: 1,
      icon: "⚡",
      title: "Real-time Messaging",
      desc: "Messages delivered instantly with zero delay.",
    },
    {
      id: 2,
      icon: "🔒",
      title: "End-to-End Encryption",
      desc: "Your chats are fully secure and private.",
    },
    {
      id: 3,
      icon: "📁",
      title: "Media Sharing",
      desc: "Share images, videos, and files easily.",
    },
    {
      id: 4,
      icon: "👥",
      title: "Group Chats",
      desc: "Create and manage groups effortlessly.",
    },
    {
      id: 5,
      icon: "🔔",
      title: "Push Notifications",
      desc: "Never miss any important message.",
    },
    {
      id: 6,
      icon: "🟢",
      title: "Online Status",
      desc: "See who is online in real-time.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-6">

       <h1 className="text-4xl font-bold text-center text-indigo-700 mb-2">
        Chat App Features
      </h1>

      <p className="text-center text-gray-600 mb-8">
        Everything you need for a modern chat experience
      </p>

       <div className="flex justify-start mb-6">
         <button onClick={() => navigate("/")} className="group flex items-center gap-2 px-5 py-2 bg-white text-indigo-600 font-semibold rounded-full shadow-md hover:shadow-lg transition-all duration-300 border border-indigo-100">
          <span className="transform group-hover:-translate-x-1 transition-transform duration-300">
            ←
          </span>
          Go Back
        </button>
      </div>

       <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((item) => (
          <div
            key={item.id}
            className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition duration-300"
          >
            <div className="text-4xl mb-3">{item.icon}</div>

            <h2 className="text-lg font-semibold text-gray-800">
              {item.title}
            </h2>

            <p className="text-gray-600 mt-2 text-sm">
              {item.desc}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
};

export default Features;