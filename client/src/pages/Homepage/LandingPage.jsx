import React from "react";
import "./LandingPage.css"; 
import DecryptedText from "../../components/DecryptedText"; 
import { useState } from "react";
import { useNavigate } from "react-router-dom";
// NEW: Import the video file
import background from "../../assets/background.mp4"; 

const LandingPage = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [token,setToken] = useState(localStorage.getItem("token"))
  const Navigate = useNavigate();
  const handlePlayClick = () => {
    (user && token) ? Navigate("/play") : Navigate("/login")
    
  }
  return (
    <div className="h-screen w-full flex items-center justify-between flex-col relative px-14 sm:px-0 md:justify-start md:flex-row md:px-0">
      
      {/* NEW: Video Background Element */}
      <video className="background-video" autoPlay loop muted playsInline>
        {/* Use the imported variable 'burnVideo' as the source */}
        <source src={background} type="video/mp4" /> 
        Your browser does not support the video tag.
      </video>

      {/* Content goes above overlay */}
      <div
        className="
          relative
          mt-50 lg:mt-24  
          md:mt-16 md:ml-16
          lg:ml-26
          w-full lg:w-[65%]
          text-white z-10
          mx-auto
          max-w-[480px] lg:max-w-none
        "
      >
        {/* Heading */}
        <h1 className="text-6xl lg:text-7xl drop-shadow-lg leading-none text-center lg:text-left
                      mb-10 lg:mb-6 ">
          <span className="block">HOPELESS</span>
          <span className="block">OPUS</span>
        </h1>

        {/* Paragraph */}
        <p className="text-base lg:text-lg leading-relaxed mb-10 drop-shadow-2xl font-[300] text-justify">
          {/* Laptop/Desktop: animated with DecryptedText */}
          <span className="hidden lg:block">
            <DecryptedText text="Descend into the depths of consciousness" animateOn="view" className="text-white" encryptedClassName="text-white" />
            <br />
            <DecryptedText text="where ancient archetypes awaken in the shadows" animateOn="view" className="text-white" encryptedClassName="text-white" />
            <br />
            <DecryptedText text="of your mind. Navigate the labyrinth of dreams and face " animateOn="view" className="text-white" encryptedClassName="text-white" />
            <br />
            <DecryptedText text="the inevitable darkness that lies within. Explore the shadows" animateOn="view" className="text-white" encryptedClassName="text-white" />
            <br />
            <DecryptedText text="that shape your psyche and confront the enigmatic mysteries hidden" animateOn="view" className="text-white" encryptedClassName="text-white" />
            <br />
            <DecryptedText text="in the corners of your consciousness. Do you trust yourself in the unknown?" animateOn="view" className="text-white" encryptedClassName="text-white" />
          </span>

          {/* All screens below lg: phone layout */}
          <span className="block lg:hidden px-6 mx-auto max-w-[480px] mt-8">
            Descend into the depths of consciousness where ancient archetypes awaken in the shadows of your mind. Navigate the labyrinth of dreams and face the inevitable darkness that lies within. Explore the shadows that shape your psyche and confront the enigmatic mysteries hidden in the corners of your consciousness.
          </span>
        </p>

        {/* PLAY Button */}
        <div className="flex justify-center lg:justify-start mt-6 lg:mt-0">
          <button className="uiverse-button" onClick={handlePlayClick}>
            <span className="font-[300]">PLAY</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 66 43">
              <polygon points="39.58,4.46 44.11,0 66,21.5 44.11,43 39.58,38.54 56.94,21.5"></polygon>
              <polygon points="19.79,4.46 24.32,0 46.21,21.5 24.32,43 19.79,38.54 37.15,21.5"></polygon>
              <polygon points="0,4.46 4.53,0 26.42,21.5 4.53,43 0,38.54 17.36,21.5"></polygon>
            </svg>
          </button>
        </div>
      </div>

      {/* Add bottom spacing for balance on phones */}
      <div className="h-8 lg:h-0"></div>
    </div>
  );
};

export default LandingPage;