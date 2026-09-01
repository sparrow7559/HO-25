import React, { useEffect, useState } from "react";
import API_BASE from '../lib/api_endpoint';
import goldMedal from '../assets/gold-medal.svg';
import silverMedal from '../assets/silver-medal.svg';
import bronzeMedal from '../assets/bronze-medal.svg';

const TEAMS_PER_PAGE = 10;

export default function Leaderboard({ currentUserId, token }) {
  const [teams, setTeams] = useState([]);
  const [currentUserIndex, setCurrentUserIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        let url = `${API_BASE}/leaderboard`;
        const headers = {};

        if (currentUserId && token) {
          url = `${API_BASE}/leaderboard/current`;
          headers.Authorization = `Bearer ${token}`;
        }

        const res = await fetch(url, { headers });
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Failed to fetch leaderboard");

        const leaderboard = Array.isArray(data.leaderboard) ? data.leaderboard : data;
        setTeams(leaderboard);
        if (data.currentUserIndex !== undefined) setCurrentUserIndex(data.currentUserIndex);
      } catch (err) {
        setTeams([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [currentUserId, token]);

  // 🔁 Pagination Calculations
  const totalPages = Math.ceil(teams.length / TEAMS_PER_PAGE);
  const startIndex = (currentPage - 1) * TEAMS_PER_PAGE;
  const paginatedTeams = teams.slice(startIndex, startIndex + TEAMS_PER_PAGE);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  if (loading) {
    return <p className="text-center text-white mt-32">Loading leaderboard...</p>;
  }

  return (
    <div className="min-h-screen pt-24 md:pt-28 bg-black text-white pb-8">
      <div className="max-w-screen-xl mx-auto px-3 sm:px-4 md:px-6">
        {/* Stats Section */}
        <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 mt-6 md:mt-10">
          <div className="bg-gray-900 flex items-center gap-6 px-8 sm:px-10 md:px-12 py-6 md:py-8 rounded-2xl shadow-2xl w-full sm:w-auto">
            <div>
              <h3 className="text-cyan-400 text-xs sm:text-sm font-semibold">ACTIVE USERS</h3>
              <p className="text-2xl sm:text-3xl md:text-3xl font-bold">{teams.length}</p>
            </div>
          </div>
          <div className="bg-gray-900 flex items-center gap-6 px-8 sm:px-10 md:px-12 py-6 md:py-8 rounded-2xl shadow-2xl w-full sm:w-auto">
            <div>
              <h3 className="text-cyan-400 text-xs sm:text-sm font-semibold">CURRENT RANK</h3>
              <p className="text-2xl sm:text-3xl md:text-3xl font-bold">
                {currentUserIndex !== null ? `#${currentUserIndex + 1}` : "#N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Top 3 Teams */}
        <div className="bg-gray-900 mt-6 md:mt-8 p-4 sm:p-6 md:p-8 lg:p-10 rounded-2xl">
          <div className="grid grid-cols-3 gap-4 sm:gap-6 md:gap-8 lg:gap-12 mb-8 md:mb-10 max-w-5xl mx-auto">
            {teams.slice(0, 3).map((team, idx) => {
              const medalColors = ["#FFD700", "#C0C0C0", "#CD7F32"];
              const medalImages = [goldMedal, silverMedal, bronzeMedal];
              
              return (
                <div key={team._id || idx} className="text-center flex flex-col items-center">
                  <div
                    className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full border-4 overflow-hidden flex items-center justify-center"
                    style={{ borderColor: medalColors[idx], backgroundColor: '#1a1a1a' }}
                  >
                    <img 
                      src={medalImages[idx]} 
                      alt={`${idx + 1} place medal`}
                      className="w-full h-full object-contain p-2"
                    />
                  </div>
                  <h4 className="mt-2 sm:mt-3 text-sm sm:text-base md:text-lg font-semibold">
                    {team.teamLeader?.name}
                    {team.player2?.name ? `, ${team.player2.name}` : ""}
                  </h4>
                  <p className="text-gray-300 text-xs sm:text-sm md:text-base">
                    {team.points ?? 0} pts
                  </p>
                </div>
              );
            })}
          </div>

          {/* Leaderboard Table */}
          <div className="w-full overflow-x-auto">
            {/* Desktop/Tablet View */}
            <div className="hidden sm:block min-w-[300px]">
              {/* Header */}
              <div className="grid grid-cols-4 gap-4 px-4 sm:px-6 py-3 border-b border-gray-700 text-cyan-300 font-semibold text-sm sm:text-base">
                <span>RANK</span>
                <span>TEAM ID</span>
                <span>TEAM MEMBERS</span>
                <span className="text-right">POINTS</span>
              </div>

              {/* Rows */}
              {paginatedTeams.map((team, idx) => {
                const globalIndex = startIndex + idx; // 🔁 Correct index for rank
                return (
                  <div
                    key={team._id || idx}
                    className={`grid grid-cols-4 gap-4 px-4 sm:px-6 py-4 border-b border-gray-800 transition items-center ${
                      globalIndex === currentUserIndex ? "bg-[#134273]" : "hover:bg-[#0E2038]"
                    }`}
                  >
                    <span className="text-teal-300 font-semibold text-sm sm:text-base">
                      {globalIndex + 1}
                    </span>
                    <span className="font-bold text-sm sm:text-base">{team.teamId}</span>
                    <div className="text-gray-300 text-sm sm:text-base">
                      {team.teamLeader?.name}
                      {team.player2?.name ? `, ${team.player2.name}` : ""}
                    </div>
                    <span className="text-cyan-400 font-semibold text-right text-sm sm:text-base">
                      {team.points ?? 0}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Mobile View (Card Layout) */}
            <div className="sm:hidden">
              {paginatedTeams.map((team, idx) => {
                const globalIndex = startIndex + idx;
                return (
                  <div
                    key={team._id || idx}
                    className={`p-4 border-b border-gray-800 ${
                      globalIndex === currentUserIndex ? "bg-[#134273]" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-teal-300 font-semibold text-base">
                          #{globalIndex + 1}
                        </span>
                        <span className="font-bold text-sm">{team.teamId}</span>
                      </div>
                      <span className="text-cyan-400 font-semibold text-base">
                        {team.points ?? 0} pts
                      </span>
                    </div>
                    <div className="text-gray-300 text-sm">
                      {team.teamLeader?.name}
                      {team.player2?.name && (
                        <>
                          <br />
                          {team.player2.name}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 🔁 Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 text-white">
              <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>
              <span className="text-cyan-400 text-sm sm:text-base">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}