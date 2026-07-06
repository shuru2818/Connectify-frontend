import React, { useState } from "react";
import api from "../api/axios.js";
import { useNavigate } from "react-router-dom";
import GoogleLoginButton from "../components/GoogleLoginButton.jsx";

const Signup = () => {
  const navigate = useNavigate();

  const [formdata, setFormdata] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [servererror, setServererror] = useState("");

  const handleInput = (e) => {
    const { name, value } = e.target;

    setFormdata((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validate = () => {
    let newErrors = {};

    // username
    if (!formdata.username) {
      newErrors.username = "Name is Required";
    } else {
      const usernameRegex = /^[a-zA-Z][a-zA-Z0-9._-]{2,}$/;
      if (!usernameRegex.test(formdata.username)) {
        newErrors.username = "Username must start with letter and be 3+ chars";
      }
    }

    // email (FIXED)
    if (!formdata.email) {
      newErrors.email = "Email is Required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formdata.email)) {
        newErrors.email = "Enter a valid email";
      }
    }

    // phone (FIXED)
    if (!formdata.phone) {
      newErrors.phone = "Phone Number is Required";
    } else {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(formdata.phone)) {
        newErrors.phone = "Enter valid 10-digit phone number";
      }
    }

    // password
    if (!formdata.password) {
      newErrors.password = "Password is Required";
    } else {
      const strongPasswordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/?]).{6,}$/;

      if (!strongPasswordRegex.test(formdata.password)) {
        newErrors.password =
          "Password must contain uppercase, lowercase, number & special char";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setServererror("");

    if (!validate()) return;

    try {
      const response = await api.post("/auth/signup", formdata);

      const email = response.data?.user?.email || formdata.email;

      localStorage.setItem("pendingVerificationEmail", email);

      navigate("/verify-otp", {
        state: { email },
      });
    } catch (err) {
      setServererror(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={submitForm}
        className="w-full max-w-md bg-white p-8 rounded-xl shadow-md border space-y-4"
      >
        <img src="/chatapplogo.png" className="w-26 h-22 mx-auto" />

        <h2 className="text-2xl font-semibold text-center">
          Create your account
        </h2>

        <input
          name="username"
          placeholder="Username"
          value={formdata.username}
          onChange={handleInput}
          className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
        />
        {errors.username && <p className="text-red-500">{errors.username}</p>}

        <input
          name="email"
          placeholder="Email"
          value={formdata.email}
          onChange={handleInput}
          className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
        />
        {errors.email && <p className="text-red-500">{errors.email}</p>}

        <input
          name="phone"
          placeholder="Phone"
          value={formdata.phone}
          onChange={handleInput}
          className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
        />
        {errors.phone && <p className="text-red-500">{errors.phone}</p>}

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formdata.password}
          onChange={handleInput}
          className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
        />
        {errors.password && <p className="text-red-500">{errors.password}</p>}

        {servererror && (
          <p className="text-red-500 text-center">{servererror}</p>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          Create Account
        </button>

        <GoogleLoginButton />
        <p>
          Already have an account.{" "}
          <a href="/login" className="text-blue-400">
            Login here
          </a>
        </p>
      </form>
    </div>
  );
};

export default Signup;
