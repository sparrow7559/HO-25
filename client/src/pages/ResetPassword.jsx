import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE from '../lib/api_endpoint';

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const prefilledEmail = location.state?.email || "";

  const [formData, setFormData] = useState({
    email: prefilledEmail,
    otp: "",
    newPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
  const res = await axios.post(`${API_BASE}/forgotpwd/reset-password`, formData);
      setMessage(res.data.message || "Password reset successful!");

      // Auto redirect to login after success
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      if (err.response) {
        setMessage(err.response.data.message || "Something went wrong.");
      } else {
        setMessage("Server not reachable.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-[#411E3A] to-[#0D1A2F] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#0D1A2F] rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#09D8C7] text-center mb-2">
          Reset Password
        </h1>
        <p className="text-gray-400 text-center text-sm mb-6">
          Enter the verification code and set a new password
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-[#09D8C7] text-sm font-medium mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full px-3 py-2 rounded-md bg-transparent border border-slate-700 text-white text-sm focus:outline-none focus:border-[#09D8C7]"
              required
            />
          </div>

          {/* OTP */}
          <div>
            <label className="block text-[#09D8C7] text-sm font-medium mb-1">
              Verification Code
            </label>
            <input
              type="text"
              name="otp"
              value={formData.otp}
              onChange={handleChange}
              placeholder="Enter the code"
              className="w-full px-3 py-2 rounded-md bg-transparent border border-slate-700 text-white text-sm focus:outline-none focus:border-[#09D8C7]"
              required
            />
          </div>

          {/* New Password */}
          <div>
            <label className="block text-[#09D8C7] text-sm font-medium mb-1">
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Enter your new password"
              className="w-full px-3 py-2 rounded-md bg-transparent border border-slate-700 text-white text-sm focus:outline-none focus:border-[#09D8C7]"
              required
            />
          </div>

          {message && <p className="text-green-500 text-sm">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-md transition-all duration-300"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6 pb-20">
          Remember your password?{" "}
          <Link to="/login" className="text-[#09D8C7] hover:text-cyan-400">
            Go back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}
