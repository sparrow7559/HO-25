import React, { useState, useEffect, useRef } from "react";
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Trophy,
  Zap,
  ArrowUpRight,
  ArrowUpLeft,
} from "lucide-react";
import MinigameTimer from "../components/MinigameTimer";
import useMinigameSession from "../lib/useMinigameSession";

const LaserMazeGame = ({ onComplete }) => {
  const GRID_ROWS = 7;
  const GRID_COLS = 10;
  const INITIAL_PLAYER = { x: 6, y: 0 };
  const PRIZE = { x: 1, y: 9 };

  const LASERS = [
    { x: 6, y: 1, direction: "up" },
    { x: 6, y: 4, direction: "up" },
    { x: 6, y: 7, direction: "up" },
    { x: 3, y: 9, direction: "left" },
  ];

  const [playerPos, setPlayerPos] = useState(INITIAL_PLAYER);
  const [laserPattern, setLaserPattern] = useState(0);
  const [gameStatus, setGameStatus] = useState("playing");
  const [laserBeams, setLaserBeams] = useState([]);
  const [showLasers, setShowLasers] = useState(false);
  const [moves, setMoves] = useState(0);

  const minigameId = "M18";
  const {
    session,
    loading,
    error,
    remainingSeconds,
    triesLeft,
    api: sessionApi,
  } = useMinigameSession(minigameId);
  const completionHandledRef = useRef(false);

  const calculateLaserBeams = (pattern) => {
    const beams = [];

    LASERS.forEach((laser) => {
      const beam = [];

      if (laser.direction === "up") {
        if (pattern === 0 || pattern === 2) {
          for (let row = laser.x - 1; row >= 0; row--) {
            beam.push({ x: row, y: laser.y });
          }
        } else if (pattern === 1) {
          let row = laser.x - 1;
          let col = laser.y + 1;
          while (row >= 0 && col < GRID_COLS) {
            beam.push({ x: row, y: col });
            row--;
            col++;
          }
        } else if (pattern === 3) {
          let row = laser.x - 1;
          let col = laser.y - 1;
          while (row >= 0 && col >= 0) {
            beam.push({ x: row, y: col });
            row--;
            col--;
          }
        }
      } else if (laser.direction === "left") {
        if (pattern === 0 || pattern === 2) {
          for (let col = laser.y - 1; col >= 0; col--) {
            beam.push({ x: laser.x, y: col });
          }
        } else if (pattern === 1) {
          let row = laser.x - 1;
          let col = laser.y - 1;
          while (row >= 0 && col >= 0) {
            beam.push({ x: row, y: col });
            row--;
            col--;
          }
        } else if (pattern === 3) {
          let row = laser.x + 1;
          let col = laser.y - 1;
          while (row < GRID_ROWS && col >= 0) {
            beam.push({ x: row, y: col });
            row++;
            col--;
          }
        }
      }

      beams.push(...beam);
    });

    return beams;
  };

  const checkLaserHit = (pos, pattern) => {
    const beams = calculateLaserBeams(pattern);
    return beams.some((beam) => beam.x === pos.x && beam.y === pos.y);
  };

  const isLaserSource = (x, y) =>
    LASERS.some((laser) => laser.x === x && laser.y === y);
  const isLaserBeam = (x, y) =>
    laserBeams.some((beam) => beam.x === x && beam.y === y);

  const movePlayer = (direction) => {
    if (gameStatus !== "playing") return;

    let newPos = { ...playerPos };
    switch (direction) {
      case "up":
        if (newPos.x > 0) newPos.x--;
        break;
      case "down":
        if (newPos.x < GRID_ROWS - 1) newPos.x++;
        break;
      case "left":
        if (newPos.y > 0) newPos.y--;
        break;
      case "right":
        if (newPos.y < GRID_COLS - 1) newPos.y++;
        break;
      default:
        return;
    }

    if (isLaserSource(newPos.x, newPos.y)) return;

    if (newPos.x === PRIZE.x && newPos.y === PRIZE.y) {
      setPlayerPos(newPos);
      setGameStatus("won");
      return;
    }

    setPlayerPos(newPos);
    setMoves((prev) => prev + 1);

    setTimeout(() => {
      setShowLasers(true);
      const beams = calculateLaserBeams(laserPattern);
      setLaserBeams(beams);

      const isHit = checkLaserHit(newPos, laserPattern);

      setTimeout(() => {
        setShowLasers(false);
        if (isHit) {
          setGameStatus("lost");
        } else {
          setLaserPattern((prev) => (prev + 1) % 4);
        }
      }, 800);
    }, 300);
  };

  // ⏰ Robust backend timeout handling
  useEffect(() => {
    if (completionHandledRef.current) return;

    if (typeof remainingSeconds === "number" && remainingSeconds <= 0) {
      if (!session) return; // wait until session is ready

      completionHandledRef.current = true;
      console.log("⏰ Time's up — marking LaserMazeGame as failed.");
      setGameStatus("lost"); // show game over visually

      sessionApi
        .completeSession()
        .then(() => {
          if (typeof onComplete === "function") onComplete(false);
        })
        .catch((e) => {
          console.error("Failed to complete session on timeout:", e);
          if (typeof onComplete === "function") onComplete(false);
        });
    }
  }, [remainingSeconds, session, sessionApi, onComplete]);

  // 🏁 Handle win/loss outcomes
  useEffect(() => {
    if (completionHandledRef.current) return;

    if (gameStatus === "won") {
      completionHandledRef.current = true;
      setTimeout(() => {
        sessionApi
          .completeSession()
          .then(() => {
            if (typeof onComplete === "function") onComplete(true);
          })
          .catch((e) => {
            console.error("Failed to complete session on win:", e);
            if (typeof onComplete === "function") onComplete(true);
          });
      }, 2000); // 2-second delay to show win message
    } else if (gameStatus === "lost") {
      completionHandledRef.current = true;
      sessionApi
        .completeSession()
        .then(() => {
          if (typeof onComplete === "function") onComplete(false);
        })
        .catch((e) => {
          console.error("Failed to complete session on loss:", e);
          if (typeof onComplete === "function") onComplete(false);
        });
    }
  }, [gameStatus, sessionApi, onComplete]);

  return (
    <div className="min-h-screen bg-[#D9CEBF] flex items-center justify-center p-4">
      {/* Timer */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
        <MinigameTimer remainingSeconds={remainingSeconds} />
      </div>

      <div className="w-full max-w-screen-md sm:max-w-screen-lg mx-auto px-2 sm:px-4">
        <div className="bg-gray-800 rounded-lg shadow-2xl p-4 sm:p-8">
          <div className="text-center mb-6">
            <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-white mb-2">
              Laser Maze
            </h1>
            <p className="text-gray-300 text-base sm:text-lg">
              Navigate through the lasers to reach the prize!
            </p>
          </div>

          <div className="bg-gray-900 p-4 sm:p-6 rounded-xl mb-6 flex justify-center items-center shadow-inner overflow-auto transform scale-90 sm:scale-100 origin-top">
            <div className="inline-block">
              {Array.from({ length: GRID_ROWS }).map((_, rowIdx) => (
                <div key={rowIdx} className="flex justify-center">
                  {Array.from({ length: GRID_COLS }).map((_, colIdx) => {
                    const isPlayer =
                      playerPos.x === rowIdx && playerPos.y === colIdx;
                    const isPrize =
                      PRIZE.x === rowIdx && PRIZE.y === colIdx;
                    const isLaser = isLaserSource(rowIdx, colIdx);
                    const isBeam =
                      showLasers && isLaserBeam(rowIdx, colIdx);

                    return (
                      <div
                        key={`${rowIdx}-${colIdx}`}
                        className={`w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 border-2 flex flex-col items-center justify-center transition-all duration-300 ${
                          isPlayer
                            ? "bg-[#5293BB] border-black"
                            : isPrize
                            ? "bg-[#61744c] border-black"
                            : isLaser
                            ? "bg-[#5c6c7d] border-black"
                            : isBeam
                            ? "bg-red-500/80 border-red-400 animate-pulse shadow-lg shadow-red-500/70"
                            : "bg-[#a68f78] border-black"
                        }`}
                      >
                        {isPlayer && (
                          <div className="relative w-full h-full flex items-center justify-center">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full shadow-lg z-10"></div>

                            <button
                              onClick={() => movePlayer("up")}
                              className="absolute -top-3 sm:-top-5 bg-purple-600 hover:bg-purple-700 p-1 rounded-full shadow-md"
                            >
                              <ArrowUp className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                            </button>
                            <button
                              onClick={() => movePlayer("down")}
                              className="absolute -bottom-3 sm:-bottom-5 bg-purple-600 hover:bg-purple-700 p-1 rounded-full shadow-md"
                            >
                              <ArrowDown className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                            </button>
                            <button
                              onClick={() => movePlayer("left")}
                              className="absolute -left-3 sm:-left-5 bg-purple-600 hover:bg-purple-700 p-1 rounded-full shadow-md"
                            >
                              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                            </button>
                            <button
                              onClick={() => movePlayer("right")}
                              className="absolute -right-3 sm:-right-5 bg-purple-600 hover:bg-purple-700 p-1 rounded-full shadow-md"
                            >
                              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                            </button>
                          </div>
                        )}
                        {isPrize && (
                          <Trophy className="text-white w-6 h-6 sm:w-8 sm:h-8 drop-shadow-lg" />
                        )}
                        {isLaser && (
                          <div
                            className={`flex flex-col items-center ${
                              rowIdx === 3 && colIdx === 9 ? "-rotate-90" : ""
                            }`}
                          >
                            <Zap className="text-[#c8a55f] w-8 h-8 mb-1 drop-shadow-lg" />
                            <div className="flex gap-1">
                              <ArrowUp className="text-white w-4 h-4 drop-shadow" />
                              <ArrowUpRight className="text-white w-4 h-4 drop-shadow" />
                              <ArrowUp className="text-white w-4 h-4 drop-shadow" />
                              <ArrowUpLeft className="text-white w-4 h-4 drop-shadow" />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center gap-6">
            {gameStatus === "won" && (
              <div className="text-center bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border-2 border-gray-700">
                <div className="text-green-400 text-2xl sm:text-3xl font-bold flex flex-col items-center gap-2">
                  <Trophy className="w-12 h-12 text-yellow-400 animate-bounce" />
                  Congratulations! You reached the prize in {moves} moves!
                </div>
              </div>
            )}

            {gameStatus === "lost" && (
              <div className="text-center bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border-2 border-gray-700">
                <div className="text-red-400 text-2xl sm:text-3xl font-bold flex flex-col items-center gap-2">
                  <Zap className="w-12 h-12 animate-pulse" />
                  Game Over!{" "}
                  {remainingSeconds <= 0
                    ? "Time’s up!"
                    : "The laser got you!"}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 text-gray-400 text-sm text-center">
            <p>Use arrow buttons to move. Lasers fire after each move!</p>
            <p>Red squares with ⚡ are laser sources.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaserMazeGame;
