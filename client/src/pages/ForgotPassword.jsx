import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE from '../lib/api_endpoint';

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post(`${API_BASE}/forgotpwd/forgot-password`, {
        email,
      });

      setMessage(res.data.message || "Verification code sent to your email.");
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
          Forgot Password
        </h1>
        <p className="text-gray-400 text-center text-sm mb-6">
          Enter your email to receive a verification code
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[#09D8C7] text-sm font-medium mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            {loading ? "Sending..." : "Send Code"}
          </button>
        </form>

        {/* Reset Password Button after success */}
        {message && (
          <div className="mt-4 text-center">
            <button
              onClick={() => navigate("/reset-password", { state: { email } })}
              className="w-full bg-[#09D8C7] hover:bg-cyan-500 text-black font-semibold py-2 rounded-md transition-all duration-300"
            >
              Go to Reset Password
            </button>
          </div>
        )}

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
