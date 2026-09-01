import React from "react";
import { useNavigate } from "react-router-dom";
import sponsers from "../assets/sponser.png";

const Footer = () => {
  const navigate = useNavigate();

  const openHome = () => navigate("/");
  const openAbout = () => navigate("/about");
  const openLeaderboard = () => navigate("/leaderboard");
  const openContact = () => navigate("/contact");

  return (
    <footer className="backdrop-blur-xs bg-[#000000]/20 px-4 sm:px-6 lg:px-10 py-12 lg:py-16 w-full">
      <div className="max-w-7xl mx-auto">
        {/* Top grid section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <h3 className="text-white font-thin mb-4 text-lg sm:text-xl">
              HOPELESS OPUS
            </h3>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
              Experience the ultimate challenge of strategy, puzzles, and
              intellectual prowess in TechTatva 2025's most exciting
              competition.
            </p>
          </div>

          {/* Middle column */}
          <div>
            <h4 className="font-thin mb-4 text-base sm:text-lg text-white">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm sm:text-base text-gray-300">
              <li>
                <button
                  onClick={openHome}
                  className="hover:text-white transition-colors cursor-pointer active:cursor-grabbing"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={openAbout}
                  className="hover:text-white transition-colors cursor-pointer active:cursor-grabbing"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={openLeaderboard}
                  className="hover:text-white transition-colors cursor-pointer active:cursor-grabbing"
                >
                  Leaderboard
                </button>
              </li>
              <li>
                <button
                  onClick={openContact}
                  className="hover:text-white transition-colors cursor-pointer active:cursor-grabbing"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Right column */}
          <div>
            <h4 className="font-thin mb-4 text-base sm:text-lg text-white">
              Get in Touch
            </h4>
            <div className="text-sm sm:text-base text-gray-300 space-y-2">
              <p>Udupi, Karnataka, India</p>
              <p>tt.acumen@gmail.com</p>
            </div>
          </div>
        </div>

        {/* Sponsors section */}
        <div className="mt-12">
          <img
            src={sponsers}
            alt="Sponsors"
            className="w-full h-auto object-contain mx-auto"
          />
        </div>

        {/* Bottom section */}
        <div className="border-t border-gray-200 mt-10 pt-6 text-center text-xs font-thin sm:text-xl text-white">
          © 2025 ACUMEN
        </div>
        <div className="mt-1 text-center text-xs font-thin sm:text-sm text-white">
          All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;