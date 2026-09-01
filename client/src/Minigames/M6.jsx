import React, { useState, useEffect, useRef } from "react";
import backgroundImage from "../assets/cipherimage.png";
import MinigameTimer from "../components/MinigameTimer";
import useMinigameSession from "../lib/useMinigameSession";

export default function M6({ onComplete }) {
  const minigameId = "M6";
  const { session, loading, error, remainingSeconds, triesLeft, api: sessionApi } = useMinigameSession(minigameId);

  const cipherText = " "; // <-- Insert your cipher text here
  const correctAnswer = "theseromansarecrazy";

  const [input, setInput] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [showWrongAnswer, setShowWrongAnswer] = useState(false);

  const alreadyEnded = useRef(false);

  // Handle submission
  const handleSubmit = async () => {
    if (gameEnded || alreadyEnded.current) return;
    
    const normalized = input.toLowerCase().replace(/\s+/g, "");
    
    if (normalized === correctAnswer) {
      // Correct answer
      setIsCorrect(true);
      setGameEnded(true);
      alreadyEnded.current = true;
      try {
        await sessionApi.completeSession();
        if (onComplete) onComplete(true);
      } catch (err) {
        console.error("Failed to mark session complete:", err);
      }
    } else {
      // Wrong answer - decrement try
      setShowWrongAnswer(true);
      setTimeout(() => setShowWrongAnswer(false), 2000);
      
      try {
        await sessionApi.decrementTry();
        // fetchState is called automatically by decrementTry
      } catch (err) {
        console.error("Failed to decrement try:", err);
      }
      
      setInput("");
    }
  };

  // --- Game over state based on backend session (same logic as M5) ---
  useEffect(() => {
    if (!session) return;

    if (session.completed) {
      setGameEnded(true);
    }

    if (session.remainingSeconds === 0) {
      setGameEnded(true);
      onComplete && onComplete(false);
    }

    if (typeof session.triesLeft === "number" && session.triesLeft <= 0) {
      setGameEnded(true);
      onComplete && onComplete(false);
    }
  }, [session, onComplete]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white bg-[#0D1A2F]">
        <p>Loading game session...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-red-400 bg-[#0D1A2F]">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen relative font-serif"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        fontFamily: "'IM Fell English', serif",
      }}
    >
      {/* Timer Component with Tries */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2">
        <MinigameTimer 
          remainingSeconds={remainingSeconds} 
          triesLeft={triesLeft}
        />
      </div>

      {/* Cipher Text Display */}
      <div
        className="absolute top-[35%] left-[50%] -translate-x-1/2 text-3xl text-center font-bold"
        style={{ color: "#4b1e1e", textShadow: "0 0 10px rgba(255,255,255,0.7)" }}
      >
        {cipherText}
      </div>

      {/* Input and Button */}
      <input
        type="text"
        placeholder="Enter your answer"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !gameEnded && !alreadyEnded.current) handleSubmit();
        }}
        disabled={gameEnded}
        className="absolute top-[50%] left-[57%] p-3 rounded-lg w-[20%] border border-[#a07855] focus:outline-none focus:ring-2 focus:ring-[#a07855] focus:border-[#a07855] shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ color: "#8B0000" }}
      />

      <button
        onClick={handleSubmit}
        disabled={gameEnded}
        className="absolute top-[60%] left-[63.5%] px-6 py-3 rounded-lg bg-[#551414ff] hover:bg-[#432c09ff] text-[#f5f0e1] font-semibold transition shadow-[0_10px_25px_rgba(85,20,20,0.7)] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Submit
      </button>

      {/* Wrong Answer Feedback */}
      {showWrongAnswer && !gameEnded && (
        <p
          className="absolute top-[70%] left-[55%] text-lg animate-pulse"
          style={{ color: "#8B0000" }}
        >
          Incorrect! Try again.
        </p>
      )}

      {/* Messages */}
      {gameEnded && isCorrect && (
        <p
          className="absolute top-[70%] left-[54.5%] text-2xl font-bold animate-pulse"
          style={{
            color: "#551414ff",
            textShadow: "0 0 10px rgba(65, 35, 35, 0.8)",
          }}
        >
          The veil is lifted! 
        </p>
      )}
      {gameEnded && !isCorrect && (
        <p
          className="absolute top-[70%] left-[52.5%] text-lg"
          style={{
            color: "#3f1010ff",
          }}
        >
          The riddle remains sealed.
        </p>
      )}
    </div>
  );
}