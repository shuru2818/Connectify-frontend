import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios.js";

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [email] = useState(
    location.state?.email ||
      localStorage.getItem("pendingVerificationEmail") ||
      "",
  );

  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const inputsRef = useRef([]);

  useEffect(() => {
    if (!email) navigate("/signup");
  }, [email, navigate]);

  // handle change
  const handleChange = (e, index) => {
    const value = e.target.value.replace(/[^0-9]/g, "");

    if (!value) return;

    const newOtp = [...otp];
    newOtp[index] = value[0];
    setOtp(newOtp);

    // auto next focus (SAFE)
    if (index < 5 && inputsRef.current[index + 1]) {
      inputsRef.current[index + 1].focus();
    }

    // auto submit when complete
    if (newOtp.join("").length === 6) {
      handleVerify(newOtp.join(""));
    }
  };

  // backspace
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      const newOtp = [...otp];

      if (otp[index]) {
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0 && inputsRef.current[index - 1]) {
        inputsRef.current[index - 1].focus();
      }
    }
  };

  // paste support (IMPORTANT FIX)
  const handlePaste = (e) => {
    e.preventDefault();

    const pasted = e.clipboardData
      .getData("text")
      .replace(/[^0-9]/g, "")
      .slice(0, 6);

    const newOtp = pasted.split("");

    setOtp(newOtp.concat(new Array(6 - newOtp.length).fill("")));

    const nextIndex = Math.min(pasted.length, 5);
    inputsRef.current[nextIndex]?.focus();
  };

  const handleVerify = async (finalOtp) => {
    setError("");
    setSuccess("");

    if (finalOtp.length !== 6) {
      setError("Please enter 6-digit OTP");
      return;
    }

    try {
      const res = await api.post("/auth/verify-otp", {
        email: email.toLowerCase().trim(),
        otp: finalOtp,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setSuccess("Email verified successfully");

      setTimeout(() => navigate("/"), 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleVerify(otp.join(""));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-8 rounded-xl shadow-md space-y-6"
      >
        <h2 className="text-2xl font-semibold text-center">Verify OTP</h2>

        <p className="text-center text-gray-500 text-sm">
          Enter 6-digit OTP sent to {email}
        </p>

        {/* OTP BOXES */}
        <div className="flex justify-center gap-2">
          {otp.map((value, index) => (
            <input
              key={index}
              ref={(el) => (inputsRef.current[index] = el)}
              type="text"
              maxLength="1"
              value={value}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              className="w-12 h-12 text-center text-xl border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          ))}
        </div>

        {error && <p className="text-red-500 text-center">{error}</p>}
        {success && <p className="text-green-600 text-center">{success}</p>}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md"
        >
          Verify OTP
        </button>
      </form>
    </div>
  );
};

export default VerifyOtp;
