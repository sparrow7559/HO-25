import React, { useState, useEffect } from "react";
import MinigameTimer from "../components/MinigameTimer";

export default function M2SelectPlace({ config, onComplete, session, sessionApi }) {
  // State to track which cakes are available
  const [availableCakes, setAvailableCakes] = useState([1, 2, 3, 4, 5]);
  const [selectedCake, setSelectedCake] = useState(null);
  const [placedCakes, setPlacedCakes] = useState({});
  const [gameStatus, setGameStatus] = useState(null); // 'success' | null

  // Correct answer mapping
  const correctOrder = {
    plate1: 2,
    plate2: 5,
    plate3: 3,
    plate4: 1,
    plate5: 4,
  };

  // Plate positions on background
  const plates = [
    { id: "plate1", top: "33%", left: "32%" },
    { id: "plate2", top: "33%", left: "46.5%" },
    { id: "plate3", top: "33%", left: "62%" },
    { id: "plate4", top: "52%", left: "36.5%" },
    { id: "plate5", top: "52%", left: "56%" },
  ];

  // ---- STYLES ----
  const containerStyle = {
    position: "relative",
    width: "100%",
    height: "100vh",
    overflow: "hidden",
    backgroundColor: "#f8f4e9",
  };

  const backgroundStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundImage: `url('/images/cake-game-bg.png')`,
    backgroundSize: "contain",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    zIndex: 1,
  };

  const cakeContainerStyle = {
    position: "absolute",
    bottom: "12%",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-end",
    gap: "25px",
    zIndex: 2,
  };

  const cakeStyle = (isSelected) => ({
    width: "90px",
    height: "90px",
    objectFit: "contain",
    cursor: "pointer",
    transition: "transform 0.2s",
    border: isSelected ? "3px solid #ffd700" : "none",
    borderRadius: "10px",
    transform: isSelected ? "scale(1.1)" : "scale(1)",
  });

  const plateStyle = (plateId) => ({
    position: "absolute",
    width: "90px",
    height: "90px",
    cursor: selectedCake && !placedCakes[plateId] ? "pointer" : "default",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
    border: selectedCake && !placedCakes[plateId] ? "2px dashed #ffd700" : "none",
    borderRadius: "50%",
    transition: "transform 0.2s",
  });

  const resetButtonStyle = {
    position: "absolute",
    top: "20px",
    right: "20px",
    zIndex: 50,
    padding: "10px 20px",
    fontSize: "16px",
    cursor: "pointer",
    backgroundColor: "#ff6347",
    color: "white",
    border: "none",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
    fontWeight: "bold",
    transition: "background-color 0.2s, transform 0.2s",
  };


  // ---- LOGIC ----

  const handleCakeClick = (cakeNum) => {
    if (availableCakes.includes(cakeNum)) {
      setSelectedCake(selectedCake === cakeNum ? null : cakeNum);
    }
  };

  const handlePlateClick = (plateId) => {
    if (selectedCake && !placedCakes[plateId]) {
      const newPlaced = { ...placedCakes, [plateId]: selectedCake };
      setPlacedCakes(newPlaced);
      setAvailableCakes((prev) => prev.filter((c) => c !== selectedCake));
      setSelectedCake(null);

      if (Object.keys(newPlaced).length === 5) {
        checkWinCondition(newPlaced);
      }
    }
  };

  const checkWinCondition = (placedCakesObj) => {
    const isCorrect = Object.keys(correctOrder).every(
      (plateId) => placedCakesObj[plateId] === correctOrder[plateId]
    );

    if (isCorrect) {
      setGameStatus("success");
      setTimeout(() => onComplete(true), 800); // ✅ notify loader
    } else {
      // retry if incorrect
      setTimeout(() => handleReset(), 600);
    }
  };

  // Renamed from handleRetry to handleReset for clarity
  const handleReset = () => {
    setAvailableCakes([1, 2, 3, 4, 5]);
    setSelectedCake(null);
    setPlacedCakes({});
    setGameStatus(null);
  };

  // ---- RENDER ----
  return (
    <div style={containerStyle}>
      {/* ✅ Reset Button Added */}
      <button
        onClick={handleReset}
        style={resetButtonStyle}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#ff4500'; e.currentTarget.style.transform = 'scale(1.05)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ff6347'; e.currentTarget.style.transform = 'scale(1)'; }}
      >
        Reset
      </button>

      {/* ✅ Timer (hide tries if backend sends null) */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
        <MinigameTimer
          remainingSeconds={session?.remainingSeconds ?? null}
          triesLeft={
            session?.triesLeft === null || session?.triesLeft === undefined
              ? undefined
              : session?.triesLeft
          }
        />
      </div>

      <div style={backgroundStyle} />

      {/* Plates */}
      {plates.map((plate) => (
        <div
          key={plate.id}
          style={{
            ...plateStyle(plate.id),
            top: plate.top,
            left: plate.left,
          }}
          onClick={() => handlePlateClick(plate.id)}
          onMouseEnter={(e) => {
            if (selectedCake && !placedCakes[plate.id]) e.currentTarget.style.transform = "scale(1.1)";
          }}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          {placedCakes[plate.id] && (
            <img
              src={`/images/cake${placedCakes[plate.id]}-removebg-preview.png`}
              alt={`Cake ${placedCakes[plate.id]}`}
              style={{ width: "90px", height: "90px", objectFit: "contain" }}
              draggable="false"
            />
          )}
        </div>
      ))}

      {/* Bottom cakes */}
      <div style={cakeContainerStyle}>
        {availableCakes.map((num) => (
          <img
            key={num}
            src={`/images/cake${num}-removebg-preview.png`}
            alt={`Cake ${num}`}
            style={cakeStyle(selectedCake === num)}
            draggable="false"
            onClick={() => handleCakeClick(num)}
            onMouseEnter={(e) => {
              if (selectedCake !== num) e.currentTarget.style.transform = "scale(1.1)";
            }}
            onMouseLeave={(e) => {
              if (selectedCake !== num) e.currentTarget.style.transform = "scale(1)";
            }}
          />
        ))}
      </div>

      {/* 🎉 Success Confetti */}
      {gameStatus === "success" && (
        <>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              zIndex: 9,
              overflow: "hidden",
            }}
          >
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  width: "10px",
                  height: "10px",
                  backgroundColor: ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff"][i % 6],
                  left: `${Math.random() * 100}%`,
                  top: "-10px",
                  opacity: 0.8,
                  animation: `fall ${2 + Math.random() * 3}s linear infinite`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              />
            ))}
          </div>

          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0,0,0,0.6)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 10,
            }}
          >
            <div
              style={{
                background: "white",
                padding: "40px 60px",
                borderRadius: "20px",
                textAlign: "center",
                boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
                animation: "popIn 0.3s ease-out",
              }}
            >
              <div style={{ fontSize: "64px", marginBottom: "20px" }}>🎉</div>
              <h2 style={{ fontSize: "32px", marginBottom: "20px", color: "#4CAF50" }}>Success!</h2>
              <p style={{ fontSize: "18px", color: "#666" }}>You placed all the cakes correctly!</p>
            </div>
          </div>

          <style>{`
            @keyframes fall {
              to { transform: translateY(100vh) rotate(360deg); }
            }
            @keyframes popIn {
              from { transform: scale(0.5); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
            }
          `}</style>
        </>
      )}
    </div>
  );
}