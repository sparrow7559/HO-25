import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import axios from 'axios';

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import Leaderboard from "./pages/Leaderboard";
import Contact from "./pages/Contact";
import Rules from "./pages/Rules";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Play from "./pages/Play";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import GameSlide from "./components/GameSlide";
import Ann from "./components/Ann";
import MinigameDirect from "./pages/MinigameDirect";
import { MINIGAME_IDS } from "./lib/minigameIds";


function App() {
  // Top-level user state
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [token,setToken] = useState(localStorage.getItem("token"))

  // render inside Router so we can access location to hide navbar on /play
  const AppContent = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const topSegment = location.pathname.slice(1).toUpperCase();
    const hideNavbar = location.pathname === '/play' || location.pathname.startsWith('/play/') || MINIGAME_IDS.includes(topSegment);

    // Global axios interceptor for token expiry handling (401 page)
    useEffect(() => {
      const interceptor = axios.interceptors.response.use(
        res => res,
        err => {
          if (err.response && err.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // redirect to login
            navigate('/login');
          }
          return Promise.reject(err);
        }
      );

      return () => axios.interceptors.response.eject(interceptor);
    }, [navigate]);

    return (
      <>
        {!hideNavbar && <Navbar user={user} />}

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route
            path="/leaderboard"
            element={
              user ? (
                <Leaderboard currentUserId={user._id} token={token} />
              ) : (
                <Leaderboard />
              )
            }
          />
          <Route path="/contact" element={<Contact />} />
          <Route path="/rules" element={<Rules />} />
          <Route path="/login" element={<LoginPage setUser={setUser} />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/play" element={<GameSlide />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/profile" element={<Profile setUser={setUser} />} />
          <Route path="/:gameId" element={<MinigameDirect />} />
        </Routes>
      </>
    );
  };

  return (
    <Router>
      <AppContent/>
    </Router>
  );
}

export default App;
