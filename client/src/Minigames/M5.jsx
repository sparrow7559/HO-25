import React, { useState, useEffect, useRef } from "react";
import MinigameTimer from "../components/MinigameTimer";
import morseAudio from "../assets/morse.wav";
import morseBg from "../assets/morse.png";

const M5 = ({ config, onComplete, session, sessionApi }) => {
  const audioRef = useRef(null);
  const objectUrlRef = useRef(null);

  const [input, setInput] = useState("");
  const [message, setMessage] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);

  // --- Game over state based on backend session ---
  useEffect(() => {
    if (!session) return;

    if (session.completed) {
      setGameOver(true);
      if (audioRef.current) audioRef.current.pause();
    }

    if (session.remainingSeconds === 0) {
      setMessage("ACCESS DENIED");
      setGameOver(true);
      if (audioRef.current) audioRef.current.pause();
      onComplete && onComplete(false);
    }

    if (typeof session.triesLeft === "number" && session.triesLeft <= 0) {
      setMessage("ACCESS DENIED - GAME OVER");
      setGameOver(true);
      if (audioRef.current) audioRef.current.pause();
      onComplete && onComplete(false);
    }
  }, [session, onComplete]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (gameOver) return;

    if (input.trim().toLowerCase() === "unlock") {
      setMessage("ACCESS GRANTED");
      setGameOver(true);
      if (audioRef.current) audioRef.current.pause();
      if (onComplete) setTimeout(() => onComplete(true), 2000);
    } else {
      if (sessionApi?.decrementTry) sessionApi.decrementTry();
      setMessage("ACCESS DENIED");
      setInput("");
    }
  };

  const handleToggleMorse = async () => {
    if (!audioRef.current) {
      try {
        const resp = await fetch(morseAudio, { cache: "no-store" });
        const arrayBuffer = await resp.arrayBuffer();
        const blob = new Blob([arrayBuffer], { type: "audio/wav" });
        const url = URL.createObjectURL(blob);
        objectUrlRef.current = url;

        const audioEl = new Audio();
        audioEl.src = url;
        audioEl.loop = false;
        audioRef.current = audioEl;

        audioEl.addEventListener("ended", () => {
          setAudioPlaying(false);
        });
      } catch (err) {
        return;
      }
    }

    if (audioPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setAudioPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setAudioPlaying(true);
      } catch (err) {}
    }
  };

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const failAndDecrement = () => {
    if (sessionApi?.decrementTry) sessionApi.decrementTry();
    setMessage("ACCESS DENIED");
    setInput("");
  };

  return (
    <div
      className="relative flex items-center justify-center min-h-screen bg-black bg-cover bg-center"
      style={{ backgroundImage: `url(${morseBg})` }}
    >
      {/* ✅ Backend-driven timer and tries display */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-slate-800/60 rounded-full px-2 py-1 inline-block">
          <MinigameTimer
            remainingSeconds={session?.remainingSeconds ?? 0}
            triesLeft={session?.triesLeft ?? 0}
          />
        </div>
      </div>

      <div className="absolute top-[50%] left-[47%] transform -translate-x-1/2 flex items-center gap-3">
        <button
          onClick={handleToggleMorse}
          disabled={gameOver}
          className={`px-4 py-2 rounded-md transition duration-300 ease-in-out shadow-md hover:scale-105 cursor-pointer
                          ${
                            gameOver
                              ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                              : "bg-gray-800 hover:bg-gray-700 text-white"
                          }`}
        >
          {audioPlaying ? "❚❚" : "▶︎"}
        </button>

        <input
          type="text"
          placeholder="Enter the override code..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !gameOver && handleSubmit(e)}
          disabled={gameOver}
          className="px-4 py-2 rounded-md bg-neutral-900 border border-gray-600 text-white 
                       placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
        />

        <button
          type="submit"
          onClick={handleSubmit}
          disabled={gameOver}
          className="px-6 py-2 rounded-md bg-gray-800 hover:bg-gray-700 text-white 
                       transition duration-300 ease-in-out shadow-md hover:scale-105 cursor-pointer"
        >
          Enter
        </button>
      </div>

      <p
        className={`absolute top-[32%] left-[44%] transform -translate-x-1/2 text-xl font-bold ${
          message.includes("GRANTED") ? "text-[#2f6602]" : "text-[#731005]"
        }`}
      >
        {message}
      </p>
    </div>
  );
};

export default M5;