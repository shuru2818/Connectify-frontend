import React, { useState } from "react";
import api from "../api/axios";

const Profile = () => {

  const [image, setImage] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));

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

      // UPDATE USER
      const updatedUser = {
        ...user,
        profilePic: res.data.profilePic,
      };

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      alert("Profile picture updated");

      window.location.reload();

    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white p-6 rounded-2xl shadow-lg w-[350px] text-center">

        {/* PROFILE IMAGE */}
        <img
          src={
            user.profilePic ||
            `https://ui-avatars.com/api/?name=${user.username}&background=random`
          }
          alt=""
          className="w-28 h-28 rounded-full object-cover mx-auto border-4 border-blue-500"
        />

        <h2 className="mt-4 text-xl font-semibold">
          {user.username}
        </h2>

        <p className="text-gray-500 text-sm">
          {user.email}
        </p>

        {/* FILE INPUT */}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          className="mt-5"
        />

        {/* BUTTON */}
        <button
          onClick={uploadProfilePic}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-xl mt-4 transition"
        >
          Upload Profile Picture
        </button>

      </div>

    </div>
  );
};

export default Profile;