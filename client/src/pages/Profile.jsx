import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE from "../lib/api_endpoint";
import { useNavigate } from "react-router-dom";

export default function Profile({ setUser }) {
  const [profileData, setProfileData] = useState(null);
  const [rank, setRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileAndRank = async () => {
      if (!storedUser) return;

      try {
        const profileRes = await axios.get(
          `${API_BASE}/users/${storedUser._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const profile = profileRes.data;
        setProfileData(profile);

        const leaderboardRes = await axios.get(`${API_BASE}/leaderboard`);
        const leaderboardData = Array.isArray(leaderboardRes.data.leaderboard)
          ? leaderboardRes.data.leaderboard
          : leaderboardRes.data;

        const sorted = [...leaderboardData].sort(
          (a, b) => (b.points ?? 0) - (a.points ?? 0)
        );

        const teamIndex = sorted.findIndex(
          (t) =>
            t._id === profile._id ||
            t.teamId === profile.teamId ||
            t.teamLeader?.email === profile.teamLeader?.email
        );

        setRank(teamIndex !== -1 ? teamIndex + 1 : "N/A");
      } catch (err) {
        // Handle error
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndRank();
  }, [storedUser, token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  if (loading || !profileData) {
    return <p className="text-center text-white mt-20 text-base">Loading profile...</p>;
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-start px-4 sm:px-6 pt-28 pb-16 text-base">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#09D8C7] tracking-wide">
            {profileData.teamId}
          </h1>
        </div>

        {/* Personal Info */}
        <div className="bg-gray-900 rounded-2xl p-6 mb-5 border border-[#09D8C7]/20 shadow-lg">
          <h2 className="text-[#09D8C7] text-xl font-semibold mb-4">
            Personal Information
          </h2>
          <div className="space-y-4 text-sm sm:text-base">
            <div>
              <p className="text-gray-400">Team Leader Name</p>
              <p className="text-white border-b border-slate-700 pb-1">
                {profileData.teamLeader.name}
              </p>
            </div>
            <div>
              <p className="text-gray-400">Email</p>
              <p className="text-white border-b border-slate-700 pb-1">
                {profileData.teamLeader.email}
              </p>
            </div>
            <div>
              <p className="text-gray-400">Phone Number</p>
              <p className="text-white border-b border-slate-700 pb-1">
                {profileData.teamLeader.phone}
              </p>
            </div>
            <div>
              <p className="text-gray-400">Registration ID</p>
              <p className="text-white border-b border-slate-700 pb-1">
                {profileData.teamLeader.registrationNumber}
              </p>
            </div>
            {profileData.player2 && (
              <>
                <div>
                  <p className="text-gray-400">Teammate Name</p>
                  <p className="text-white border-b border-slate-700 pb-1">
                    {profileData.player2.name}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Teammate Email</p>
                  <p className="text-white border-b border-slate-700 pb-1">
                    {profileData.player2.email}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Gaming Stats */}
        <div className="bg-gray-900 rounded-2xl p-6 mb-6 border border-[#09D8C7]/20 shadow-lg">
          <h2 className="text-[#09D8C7] text-xl font-semibold mb-4">
            Gaming Stats
          </h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-1/2 bg-gray-800 rounded-xl p-4 border border-[#09D8C7]/20 text-center">
              <p className="text-gray-400 text-sm">Points Earned</p>
              <p className="text-white font-semibold text-lg">{profileData.points}</p>
            </div>
            <div className="w-full sm:w-1/2 bg-gray-800 rounded-xl p-4 border border-[#09D8C7]/20 text-center">
              <p className="text-gray-400 text-sm">Rank</p>
              <p className="text-white font-semibold text-lg">
                {rank !== null ? `#${rank}` : "#N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="mt-6 w-full bg-[#9f1818] hover:bg-[#800b0b] text-white font-medium px-6 py-3 rounded-full transition text-base"
        >
          LOGOUT
        </button>
      </div>
    </div>
  );
}