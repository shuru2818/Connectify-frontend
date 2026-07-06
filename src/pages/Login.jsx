import React from "react";
import { useState } from "react";
import api from "../api/axios.js";
import { useNavigate } from "react-router-dom";
import GoogleLoginButton from "../components/GoogleLoginButton.jsx";

const Login = () => {
  const navigate = useNavigate();

  const [formdata, setFormdata] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [servererror, setServererror] = useState("");

  function handleInput(e) {
    const { name, value } = e.target;
    setFormdata((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  }

  async function submitForm(e) {
    e.preventDefault();

    try {
      setServererror("");
      if (!validate()) return;

      let response = await api.post("/auth/login", formdata);
      if (response) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        navigate("/");
      }
    } catch (err) {
      console.log(err);

      if (err.response && err.response.data && err.response.data.message) {
        setServererror(err.response.data.message);
      } else {
        setServererror("Something went wrong. Please try again.");
      }
    }
  }

  function validate() {
    let newErrors = {};

    if (!formdata.email) {
      newErrors.email = "Email is Required";
    } else if (!/\S+@\S+\.\S+/.test(formdata.email)) {
      newErrors.email = "Please Enter a valid email";
    }

    if (!formdata.password) {
      newErrors.password = "Password is Required";
    } else if (formdata.password.length < 6) {
      newErrors.password = "Password must be of 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={submitForm}
        className="w-full max-w-md bg-white p-8 rounded-xl shadow-md border border-gray-200 space-y-4"
      >
        <img src="/public/chatapplogo.png" className="w-26 h-22 mx-auto"></img>
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-2">
          Login your account
        </h2>

        <div>
          <input
            type="text"
            placeholder="Email address"
            name="email"
            value={formdata.email}
            onChange={handleInput}
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <input
            type="password"
            placeholder="Password"
            name="password"
            value={formdata.password}
            onChange={handleInput}
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}
        </div>
        {servererror && (
          <p className="text-red-500 text-sm text-center">{servererror}</p>
        )}
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-medium transition duration-200">
          Login
        </button>
        <GoogleLoginButton />
        <p>
          Not an account.{" "}
          <a href="/signup" className="text-blue-400">
            SignUp here
          </a>
        </p>
      </form>
    </div>
  );
};

export default Login;
