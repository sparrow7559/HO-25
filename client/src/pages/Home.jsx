import React, { useRef, useEffect } from "react";
import Navbar from "../components/Navbar";
import LandingPage from "./Homepage/LandingPage";
import Countdown from "../components/Countdown";
import background from "../assets/background.mp4";
import CardSlider from "../components/CardSlider";
import FAQ from "../components/FAQ";
import Footer from "../components/Footer";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "../css/styles.css";

gsap.registerPlugin(ScrollTrigger);

function Home() {
  const countdownRef = useRef(null);

  useEffect(() => {
    if (window.innerWidth < 1024) return; // Only desktop/laptop

    gsap.fromTo(
      countdownRef.current,
      { opacity: 0, y: 50, scale: 0.8 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1,
        ease: "power4.out",
        scrollTrigger: {
          trigger: countdownRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      }
    );
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* Background video */}
      <video
        className="fixed inset-0 w-full h-full object-cover"
        src={background}
        autoPlay
        loop
        muted
        playsInline
      />

      {/* Dark overlay */}
      <div className="fixed inset-0 bg-black opacity-20"></div>

      {/* Content */}
      <div className="relative z-10">
        <LandingPage />

        {/* Countdown with ref */}
        <div
          ref={countdownRef}
          className="w-full flex justify-center items-center"
        >
          <Countdown targetDateProp={new Date("2025-10-08T18:30:00")} />
        </div>

        <CardSlider />
        <FAQ />
        <Footer/>
      </div>
    </div>
  );
}

export default Home;