import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import logo from "../assets/logo.png";
import profileIcon from "../assets/profile.png";
import { FiMenu, FiX } from "react-icons/fi";

const Navbar = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" },
    { name: "Leaderboard", path: "/leaderboard" },
    { name: "Contact Us", path: "/contact" },
    { name: "Rules", path: "/rules" },
  ];

  return (
    <nav className="w-full fixed top-0 z-50 backdrop-blur-xs bg-[#000000]/20 border-b border-gray-400">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex justify-between items-center h-20">
        {/* Logo */}
        <div className="flex-shrink-0">
          <NavLink to="/">
            <img
              src={logo}
              alt="Hopeless Opus Logo"
              className="h-14 w-auto object-contain"
            />
          </NavLink>
        </div>

        {/* Desktop Links */}
        <ul className="hidden md:flex space-x-8 text-lg">
          {navItems.map((item, index) => (
            <li key={index} className="relative">
              <NavLink
                to={item.path}
                end
                className={({ isActive }) =>
                  `relative px-4 py-2 font-normal transition-all duration-300 whitespace-nowrap
                   before:absolute before:top-1/2 before:left-1/2 
                   before:h-[1.6em] before:w-[130%] before:-translate-x-1/2 before:-translate-y-1/2
                   before:rounded-full before:bg-[#8c8970]/70 before:blur-sm
                   before:opacity-0 before:scale-95 before:transition-all before:duration-300
                   hover:text-white hover:before:opacity-100 hover:before:scale-100 before:-z-10
                   ${isActive ? "text-white before:opacity-100 before:scale-100" : "text-gray-300"}`
                }
              >
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Auth Button (Desktop) */}
        <div className="hidden md:block">
          {user ? (
            <NavLink
              to="/profile"
              className="p-0 rounded-full flex items-center justify-center w-10 h-10"
            >
              <img src={profileIcon} alt="Profile" className="w-8 h-8" />
            </NavLink>
          ) : (
            <NavLink
              to="/login"
              className="bg-[#9f1818] hover:bg-[#800b0b] text-white font-normal px-8 py-2 rounded-full transition text-sm"
            >
              LOGIN
            </NavLink>
          )}
        </div>

        {/* Hamburger Menu (Mobile) */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white focus:outline-none"
          >
            {isOpen ? <FiX size={28} /> : <FiMenu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden">
          <ul className="flex flex-col items-center py-6 space-y-6 text-white text-lg">
            {navItems.map((item, index) => (
              <li key={index} className="relative">
                <NavLink
                  to={item.path}
                  end
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `relative transition-all whitespace-nowrap
                     after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[2px] after:bg-white after:transition-all after:duration-300 hover:after:w-full
                     ${isActive ? " after:w-full" : ""}`
                  }
                >
                  {item.name}
                </NavLink>
              </li>
            ))}

            {user ? (
              <li>
                <NavLink
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="p-0 rounded-full flex items-center justify-center w-10 h-10"
                >
                  <img src={profileIcon} alt="Profile" className="w-8 h-8" />
                </NavLink>
              </li>
            ) : (
              <li>
                <NavLink
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="bg-[#9f1818] hover:bg-[#800b0b] text-white font-normal px-8 py-2 rounded-full transition text-base"
                >
                  LOGIN
                </NavLink>
              </li>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
