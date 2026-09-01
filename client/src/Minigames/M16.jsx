import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import MinigameTimer from "../components/MinigameTimer";

// --- Arrow SVG --- //
const Arrow = ({ color = "white" }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <path
      d="M5 12H19M19 12L13 6M19 12L13 18"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const rows = 8;
const cols = 8;

const directions = [
  { dx: 1, dy: 0, deg: 0 }, // →
  { dx: 1, dy: 1, deg: 45 }, // ↘
  { dx: 0, dy: 1, deg: 90 }, // ↓
  { dx: -1, dy: 1, deg: 135 }, // ↙
  { dx: -1, dy: 0, deg: 180 }, // ←
  { dx: -1, dy: -1, deg: 225 }, // ↖
  { dx: 0, dy: -1, deg: 270 }, // ↑
  { dx: 1, dy: -1, deg: 315 }, // ↗
];

// --- Arrow Layout (Guaranteed Full Path Solution) --- //
const puzzleSetup = [
  [1, 3, 4, 4, 4, 2, 0, 1],
  [6, 3, 2, 7, 7, 1, 1, 5],
  [0, 7, 0, 7, 5, 2, 7, 2],
  [1, 3, 4, 4, 6, 0, 6, 1],
  [2, 1, 1, 7, 2, 4, 4, 0],
  [2, 1, 1, 3, 2, 1, 4, 1],
  [2, 6, 3, 2, 5, 7, 1, 6],
  [1, 0, 7, 0, 1, 6, 7, 1],
];

// --- Rotatable Green Cells --- //
const greenCells = [
  [0, 0], [0, 7],
  [1, 5], [1, 6],
  [3, 7],
  [4, 1], [4, 2],
  [5, 1], [5, 2], [5, 5], [5, 7],
  [7, 0], [7, 4], [7, 7],
];

export default function ArrowPathPuzzle({ config, onComplete, session, sessionApi }) {
  const [grid, setGrid] = useState([]);
  const [playing, setPlaying] = useState(false);
  const [path, setPath] = useState([]);
  const [message, setMessage] = useState("");
  const [animate, setAnimate] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  
  const alreadyEnded = useRef(false);

  const startR = 3, startC = 0;
  const endR = 4, endC = 7;

  // --- Initialize Grid --- //
  const initializeGrid = (setup) => {
    const g = setup.map((row, r) =>
      row.map((dir, c) => {
        const isGreen = greenCells.some(([gr, gc]) => gr === r && gc === c);
        const isStart = r === startR && c === startC;
        const isEnd = r === endR && c === endC;
        return {
          type: isGreen && !isStart && !isEnd ? "green" : "grey",
          dir,
          fixed: !isGreen || isStart || isEnd,
          start: isStart,
          end: isEnd,
        };
      })
    );
    setGrid(g);
  };

  useEffect(() => {
    initializeGrid(puzzleSetup);
  }, []);

  // Timer expiry is handled by MinigameLoader - no need to handle it here

  // --- Rotate Green Arrows --- //
  const rotate = (r, c) => {
    if (grid[r][c].fixed || gameEnded) return;
    const newGrid = grid.map((row) => row.map((cell) => ({ ...cell })));
    newGrid[r][c].dir = (newGrid[r][c].dir + 1) % 8;
    setGrid(newGrid);
    setPath([]);
    setMessage("");
    setAnimate(false);
  };

  // --- Follow the Path --- //
  const followPath = async () => {
    if (gameEnded || alreadyEnded.current) return;
    
    setAnimate(false);
    setMessage("");
    const visited = new Set();
    const p = [];
    let r = startR, c = startC;

    for (let i = 0; i < rows * cols; i++) {
      p.push([r, c]);
      visited.add(`${r},${c}`);

      if (r === endR && c === endC && visited.size === rows * cols) {
        setPath(p);
        setAnimate(true);
        setMessage("🎉 Perfect! You connected all 64 arrows!");
        setGameEnded(true);
        alreadyEnded.current = true;
        
        // Complete session on success
        try {
          await sessionApi.completeSession();
          if (onComplete) onComplete(true);
        } catch (err) {
          console.error('Failed to complete session on success:', err);
        }
        return;
      }

      const { dx, dy } = directions[grid[r][c].dir];
      r += dy;
      c += dx;

      if (r < 0 || c < 0 || r >= rows || c >= cols) {
        setPath(p);
        setAnimate(true);
        setMessage("Use all the Tiles!");
        return;
      }

      if (visited.has(`${r},${c}`)) {
        setPath(p);
        setAnimate(true);
        setMessage("❌ Path forms a loop!");
        return;
      }
    }

    setPath(p);
    setAnimate(true);
    setMessage("❌ Path didn't connect all arrows!");
  };

  // --- Reset --- //
  const resetGame = () => {
    if (gameEnded || alreadyEnded.current) return;
    
    initializeGrid(puzzleSetup);
    setPlaying(true);
    setPath([]);
    setMessage("");
    setAnimate(false);
  };

  // --- Path Animation --- //
  const cellSize = 60;
  const pathPoints = path.map(([r, c]) => [
    c * (cellSize + 4) + cellSize / 2 + 4,
    r * (cellSize + 4) + cellSize / 2 + 4,
  ]);
  const pathD =
    pathPoints.length > 1
      ? `M${pathPoints.map(([x, y]) => `${x},${y}`).join(" L")}`
      : "";

  const remainingSeconds = session?.remainingSeconds ?? null;
  const triesLeft = session?.triesLeft ?? null;

  return (
    <div className="flex flex-col items-center p-6 bg-gradient-to-br from-slate-800 to-slate-900 min-h-screen text-white select-none">
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50">
        <MinigameTimer remainingSeconds={remainingSeconds}/>
      </div>
      <h1 className="text-4xl font-bold mb-2 text-cyan-400 mt-12">Arrow Path Puzzle</h1>

      {!playing ? (
        <button
          onClick={() => setPlaying(true)}
          disabled={gameEnded}
          className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 rounded-lg text-xl font-semibold shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ▶ Start Game
        </button>
      ) : (
        <>
          {/* --- Puzzle Grid --- */}
          <div
            className="relative grid gap-1 bg-slate-950 p-2 rounded-lg shadow-2xl"
            style={{
              gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
              gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
            }}
          >
            {grid.map((row, r) =>
              row.map((cell, c) => {
                const isPath = path.some(([pr, pc]) => pr === r && pc === c);
                let bg = "bg-slate-700";
                let border = "border-slate-600";
                let color = "white";
                let cursor = "";

                if (cell.start || cell.end) {
                  bg = "bg-cyan-500";
                  border = "border-cyan-300";
                  color = "#1e293b";
                } else if (cell.type === "green") {
                  bg = "bg-green-600";
                  border = "border-green-500";
                  cursor = gameEnded ? "" : "cursor-pointer hover:scale-105";
                }

                return (
                  <div
                    key={`${r}-${c}`}
                    onClick={() => rotate(r, c)}
                    className={`${bg} ${cursor} flex items-center justify-center rounded border-2 ${border} transition-all`}
                  >
                    <motion.div
                      animate={{ rotate: directions[cell.dir].deg }}
                      transition={{ duration: 0.3 }}
                    >
                      <Arrow color={color} />
                    </motion.div>
                  </div>
                );
              })
            )}

            {animate && pathD && (
              <motion.svg
                className="absolute top-0 left-0 pointer-events-none"
                width={cols * (cellSize + 4)}
                height={rows * (cellSize + 4)}
              >
                <motion.path
                  d={pathD}
                  fill="none"
                  stroke="#FFD700"
                  strokeWidth="5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: path.length * 0.25, ease: "easeInOut" }}
                />
              </motion.svg>
            )}
          </div>

          {/* --- Controls --- */}
          <div className="mt-6 flex gap-4">
            <button
              onClick={followPath}
              disabled={gameEnded}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg font-semibold hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Path
            </button>
            <button
              onClick={resetGame}
              disabled={gameEnded}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 rounded-lg font-semibold hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reset Game
            </button>
          </div>

          {/* --- Message --- */}
          {message && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 px-6 py-3 rounded-lg text-lg font-semibold ${
                message.includes("🎉") ? "bg-green-600" : "bg-red-600"
              }`}
            >
              {message}
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}