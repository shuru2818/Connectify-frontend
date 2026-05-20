import React, { useState } from "react";
import api from "../api/axios";

const Profile = () => {

  const user = JSON.parse(localStorage.getItem("user"));

  const [image, setImage] = useState(null);

  const [username, setUsername] = useState(
    user.username || ""
  );

  const [about, setAbout] = useState(
    user.about || ""
  );

  // UPLOAD PROFILE
  const uploadProfilePic = async () => {

    if (!image) return;

    try {

      const formData = new FormData();

      formData.append("profilePic", image);

      const res = await api.put(
        `/users/upload-profile/${user._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const updatedUser = {
        ...user,
        profilePic: res.data.profilePic,
      };

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      window.location.reload();

    } catch (err) {
      console.log(err);
    }
  };

  // SAVE PROFILE
  const saveProfile = async () => {

    try {

      await api.put(
        `/users/update/${user._id}`,
        {
          username,
          about,
        }
      );

      const updatedUser = {
        ...user,
        username,
        about,
      };

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      alert("Profile updated");

    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-indigo-100 via-white to-blue-100 flex items-center justify-center px-4 py-4">

      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-[30px] shadow-2xl p-6 border border-white/50">

        {/* PROFILE IMAGE */}
        <div className="flex flex-col items-center">

          <div className="relative">

            <img
              src={
                user.profilePic ||
                `https://ui-avatars.com/api/?name=${user.username}&background=random`
              }
              alt="profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-indigo-500 shadow-lg"
            />

            {/* CHOOSE FILE */}
            <label className="absolute bottom-0 right-0 bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-2 rounded-full cursor-pointer shadow-md transition">
              Edit

              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                className="hidden"
              />
            </label>

          </div>

          {/* UPLOAD BUTTON */}
          {image && (
            <button
              onClick={uploadProfilePic}
              className="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-medium shadow-lg transition"
            >
              Upload Photo
            </button>
          )}

        </div>

        {/* FORM */}
        <div className="mt-5 space-y-4">

          {/* NAME */}
          <div>
            <label className="text-sm font-semibold text-slate-600">
              Name
            </label>

            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full mt-2 px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your name"
            />
          </div>

          {/* ABOUT */}
          <div>
            <label className="text-sm font-semibold text-slate-600">
              About
            </label>

            <textarea
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              rows="2"
              className="w-full mt-2 px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 outline-none resize-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Write something about yourself..."
            />
          </div>

          {/* PHONE */}
          <div>
            <label className="text-sm font-semibold text-slate-600">
              Phone Number
            </label>

            <input
              type="text"
              value={user?.phone || ""}
              disabled
              className="w-full mt-2 px-4 py-2.5 rounded-2xl border border-slate-200 bg-gray-100 text-gray-500 cursor-not-allowed"
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="text-sm font-semibold text-slate-600">
              Email
            </label>

            <input
              type="text"
              value={user.email}
              disabled
              className="w-full mt-2 px-4 py-2.5 rounded-2xl border border-slate-200 bg-gray-100 text-gray-500 cursor-not-allowed"
            />
          </div>

          {/* SAVE BUTTON */}
          <button
            onClick={saveProfile}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-500 hover:scale-[1.02] text-white rounded-2xl font-semibold shadow-xl transition"
          >
            Save Changes
          </button>

        </div>

      </div>

    </div>
  );
};

export default Profile;