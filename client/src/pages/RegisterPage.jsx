import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE from '../lib/api_endpoint';

export default function Register() {
  const Navigate = useNavigate();

  const [formData, setFormData] = useState({
    teamId: "",
    password: "",
    confirmPassword: "",
    leader: {
      name: "",
      email: "",
      phone: "",
      registration: "",
      institute: "",
      delegate: "",
    },
    player2: {
      name: "",
      email: "",
      phone: "",
      registration: "",
      institute: "",
      delegate: "",
    },
  });

  const [hasPlayer2, setHasPlayer2] = useState(false);

  const handleChange = (e, section, field) => {
    const value = e.target.value;
    if (section) {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const payload = {
      teamId: formData.teamId,
      password: formData.password,
      teamLeader: {
        name: formData.leader.name,
        email: formData.leader.email,
        phone: formData.leader.phone,
        registrationNumber: formData.leader.registration,
        institute: formData.leader.institute,
        delegateId: formData.leader.delegate,
      },
    };

    if (hasPlayer2) {
      const { name, email, phone, registration, institute, delegate } = formData.player2;
      const hasAnyValue = [name, email, phone, registration, institute, delegate].some(
        (val) => val && val.trim() !== ""
      );

      if (hasAnyValue) {
        payload.player2 = {
          name,
          email,
          phone,
          registrationNumber: registration,
          institute,
          delegateId: delegate,
        };
      }
    }

    try {
      const res = await fetch(`${API_BASE}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Registration successful!");
        Navigate("/login");
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (err) {
      alert("Network error");
    }
  };

  return (
    <div className="min-h-screen pt-24 flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-3xl bg-gray-900 rounded-2xl shadow-lg p-4 sm:p-10 text-white">
        <h1 className="text-3xl font-bold text-center text-[#09D8C7] mb-2">
          Register
        </h1>
        <p className="text-center text-gray-300 mb-4">
          Please remember your password
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Team ID */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Team ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.teamId}
              onChange={(e) => handleChange(e, null, "teamId")}
              className="w-full px-3 py-2 rounded-md bg-[#17364F] border border-[#09D8C7]/40 focus:outline-none focus:border-[#09D8C7] text-sm"
              placeholder="Enter your team ID"
              required
            />
          </div>

          {/* Team Leader */}
          <h2 className="text-lg font-semibold text-[#09D8C7]">
            Team Leader Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              ["Name", "name", "text"],
              ["Email", "email", "email"],
              ["Phone", "phone", "text"],
              ["Registration Number", "registration", "text"],
              ["Institute", "institute", "text"],
              ["Delegate ID", "delegate", "text"],
            ].map(([label, field, type]) => (
              <div key={field}>
                <label className="block text-sm mb-1">
                  {label} <span className="text-red-500">*</span>
                </label>
                <input
                  type={type}
                  value={formData.leader[field]}
                  onChange={(e) => handleChange(e, "leader", field)}
                  placeholder={`Enter your ${label.toLowerCase()}`}
                  className="w-full px-3 py-2 rounded-md bg-[#17364F] border border-[#09D8C7]/40 focus:outline-none focus:border-[#09D8C7] text-sm"
                  required
                />
              </div>
            ))}
          </div>

          {/* Checkbox for Player 2 */}
          <div className="flex items-center space-x-2 mt-4">
            <input
              type="checkbox"
              id="hasPlayer2"
              checked={hasPlayer2}
              onChange={(e) => setHasPlayer2(e.target.checked)}
              className="h-4 w-4 text-[#09D8C7] border-gray-300 rounded"
            />
            <label htmlFor="hasPlayer2" className="text-sm">
              Do you have a second player?
            </label>
          </div>

          {/* Player 2 (if checked) */}
          {hasPlayer2 && (
            <>
              <h2 className="text-lg font-semibold text-[#09D8C7]">
                Player 2 Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  ["Name", "name", "text"],
                  ["Email", "email", "email"],
                  ["Phone", "phone", "text"],
                  ["Registration Number", "registration", "text"],
                  ["Institute", "institute", "text"],
                  ["Delegate ID", "delegate", "text"],
                ].map(([label, field, type]) => (
                  <div key={field}>
                    <label className="block text-sm mb-1">{label}</label>
                    <input
                      type={type}
                      value={formData.player2[field]}
                      onChange={(e) => handleChange(e, "player2", field)}
                      placeholder={`Enter player 2's ${label.toLowerCase()}`}
                      className="w-full px-3 py-2 rounded-md bg-[#17364F] border border-[#09D8C7]/40 focus:outline-none focus:border-[#09D8C7] text-sm"
                    />
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Password fields */}
          <h2 className="text-lg font-semibold text-[#09D8C7] mt-4">
            Team Password
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleChange(e, null, "password")}
                placeholder="Enter password"
                className="w-full px-3 py-2 rounded-md bg-[#17364F] border border-[#09D8C7]/40 focus:outline-none focus:border-[#09D8C7] text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange(e, null, "confirmPassword")}
                placeholder="Confirm password"
                className="w-full px-3 py-2 rounded-md bg-[#17364F] border border-[#09D8C7]/40 focus:outline-none focus:border-[#09D8C7] text-sm"
                required
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-[#09D8C7] text-[#0D1A2F] font-semibold py-2 rounded-md hover:bg-cyan-500 transition"
          >
            REGISTER
          </button>

          <p className="text-center text-sm text-gray-400 mt-4">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-[#09D8C7] font-medium hover:underline"
            >
              Sign in here
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}