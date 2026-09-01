import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE from "../lib/api_endpoint";
import { startOfflineSession } from "../lib/offlineMode";

const DEMO_EMAIL = "demo@hopelessopus.test";
const DEMO_PASSWORD = "demo1234";

export default function Login({ setUser }) {
  const Navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    // Dummy demo credentials run fully offline - no backend call at all.
    if (formData.email.trim().toLowerCase() === DEMO_EMAIL && formData.password === DEMO_PASSWORD) {
      const user = startOfflineSession({ demo: true });
      setUser(user);
      setLoading(false);
      Navigate("/play");
      return;
    }

    try {
      const res = await axios.post(
        `${API_BASE}/users/login`,
        formData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      setSuccessMsg(res.data.message);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);
      Navigate("/");
    } catch (err) {
      if (err.response) {
        setErrorMsg(err.response.data.message || "Something went wrong");
      } else {
        setErrorMsg("Server not reachable");
      }
    } finally {
      setLoading(false);
    }
  };

  // ponytail: guest bypass - runs entirely client-side, no backend call
  const handleGuest = () => {
    const user = startOfflineSession({ demo: false });
    setUser(user);
    Navigate("/play");
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 pt-24">
      <div className="w-full max-w-md sm:max-w-lg bg-gray-900 rounded-2xl p-8 sm:p-10 shadow-2xl border border-slate-800 transition-all">
        {/* Header */}
        <h1 className="text-3xl sm:text-4xl font-bold text-[#09D8C7] text-center mb-3">
          Welcome Back
        </h1>
        <p className="text-gray-400 text-center text-sm sm:text-base mb-8">
          If this is your first time, please register
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-[#09D8C7] text-sm font-medium mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-md bg-transparent border border-slate-700 text-white text-base focus:outline-none focus:border-[#09D8C7]"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-[#09D8C7] text-sm font-medium mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-md bg-transparent border border-slate-700 text-white text-base focus:outline-none focus:border-[#09D8C7] pr-14"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-4 flex items-center text-[#09D8C7] hover:text-cyan-400"
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>

          {/* Forgot Password
          <div className="text-right">
            <Link
              to="/forgot-password"
              className="text-xs text-[#09D8C7] hover:text-gray-400"
            >
              Forgot Password?
            </Link>
          </div> */}

          {/* Error / Success Messages */}
          {errorMsg && (
            <p className="text-red-500 text-sm font-medium">{errorMsg}</p>
          )}
          {successMsg && (
            <p className="text-green-500 text-sm font-medium">{successMsg}</p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold text-base py-3 rounded-md transition-all duration-300"
          >
            {loading ? "Signing In..." : "SIGN IN"}
          </button>
        </form>

        {/* Guest bypass */}
        <button
          type="button"
          onClick={handleGuest}
          disabled={loading}
          className="w-full mt-4 border border-[#09D8C7] text-[#09D8C7] hover:bg-[#09D8C7] hover:text-black font-semibold text-base py-3 rounded-md transition-all duration-300"
        >
          PLAY AS GUEST
        </button>
        <p className="text-center text-xs text-gray-500 mt-2">
          Progress made as a guest is not saved to the leaderboard.
        </p>

        {/* Sign Up */}
        <p className="text-center text-sm sm:text-base text-gray-400 mt-8">
          Don’t have an account?{" "}
          <Link to="/register" className="text-[#09D8C7] hover:text-cyan-400">
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
}