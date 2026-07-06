import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios.js';

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(
    location.state?.email ||
    localStorage.getItem('pendingVerificationEmail') ||
    ''
  );

  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const inputsRef = useRef([]);

  useEffect(() => {
    if (!email) navigate('/signup');
  }, [email, navigate]);

  // handle input change
  const handleChange = (element, index) => {
    const value = element.value.replace(/[^0-9]/g, '');

    if (!value) return;

    const newOtp = [...otp];
    newOtp[index] = value[0];
    setOtp(newOtp);

    // move next
    if (index < 5 && value) {
      inputsRef.current[index + 1].focus();
    }
  };

  // handle backspace
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      const newOtp = [...otp];

      if (otp[index]) {
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        inputsRef.current[index - 1].focus();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const finalOtp = otp.join("");

    if (!finalOtp || finalOtp.length < 4) {
      setError("Please enter full OTP");
      return;
    }

    try {
      await api.post('/auth/verify-otp', {
        email: email.toLowerCase().trim(),
        otp: finalOtp,
      });

      setSuccess('Email verified successfully');

      setTimeout(() => navigate('/'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-8 rounded-xl shadow-md space-y-6"
      >
        <h2 className="text-2xl font-semibold text-center">
          Verify OTP
        </h2>

        <p className="text-center text-gray-500 text-sm">
          Enter the 6-digit code sent to {email}
        </p>

        {/* OTP BOXES */}
        <div className="flex justify-center gap-2">
          {otp.map((data, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              value={data}
              ref={(el) => (inputsRef.current[index] = el)}
              onChange={(e) => handleChange(e.target, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-12 h-12 text-center text-xl border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ))}
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        {success && <p className="text-green-600 text-sm text-center">{success}</p>}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
        >
          Verify OTP
        </button>
      </form>
    </div>
  );
};

export default VerifyOtp;