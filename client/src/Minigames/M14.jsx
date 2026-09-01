  import React, { useState, useEffect, useRef } from 'react';
import MinigameTimer from '../components/MinigameTimer';
import { RotateCw } from 'lucide-react';
import lightbg from "../assets/lightbg.png";
import mirror from "../assets/mirrorltor.png";

const MirrorPuzzleGame = ({ config, onComplete, session, sessionApi }) => {
  // Mirror positions (row, col) - 0-indexed
  const mirrorPositions = [
    [0, 0], [0, 2], [0, 4], [0, 7],
    [1, 3], [1, 5], [1, 7],
    [2, 0],
    [3, 5], [3,7],
    [4, 0], [4, 1], [4, 3],
    [5, 7],
    [6, 3], [6, 5],
  ];

  // Initialize mirrors with left-to-right diagonal (/) orientation
  const initMirrors = () => {
    const mirrors = {};
    mirrorPositions.forEach(([row, col]) => {
      mirrors[`${row}-${col}`] = 3; // 0: \, 1: -, 2: |, 3: /
    });
    return mirrors;
  };

  const [mirrors, setMirrors] = useState(initMirrors());
  const [lightPath, setLightPath] = useState([]);
  const [hasWon, setHasWon] = useState(false);
  const completionHandledRef = useRef(false);

  const rotateMirror = (row, col) => {
    const key = `${row}-${col}`;
    setMirrors(prev => ({
      ...prev,
      [key]: (prev[key] + 1) % 4
    }));
  };

  const calculateLightPath = () => {
  const path = [];
  let row = -1; // Start above the grid
  let col = 3; // Column 4 (0-indexed: 3)
  let direction = 'down'; // down, up, left, right

  path.push({ row, col, type: 'source' });

  const maxSteps = 100;
  let steps = 0;

  const mirrorsUsed = new Set();

  while (steps < maxSteps) {
    steps++;

    // Move in current direction
    if (direction === 'down') row++;
    else if (direction === 'up') row--;
    else if (direction === 'left') col--;
    else if (direction === 'right') col++;

    // Check bounds
    if (row < 0 || row >= 7 || col < 0 || col >= 8) {
      path.push({ row, col, type: 'end' });
      break;
    }

    const key = `${row}-${col}`;

    // Check if we hit the target
    if (row === 6 && col === 7) {
      path.push({ row, col, type: 'target' });

      // 🧠 Check if all mirrors were used
      const allUsed = mirrorPositions.every(([r, c]) =>
        mirrorsUsed.has(`${r}-${c}`)
      );

      return { path, won: allUsed };
    }

    // Check for mirror
    if (mirrors[key] !== undefined) {
      const orientation = mirrors[key];
      path.push({ row, col, type: 'mirror', orientation });
      mirrorsUsed.add(key); // ✅ Track mirror usage

      // Calculate reflection
      if (orientation === 0) { // \
        if (direction === 'down') direction = 'right';
        else if (direction === 'up') direction = 'left';
        else if (direction === 'left') direction = 'up';
        else if (direction === 'right') direction = 'down';
      } else if (orientation === 1) { // -
        if (direction === 'down' || direction === 'up') {
          path.push({ row, col, type: 'end' });
          break;
        }
      } else if (orientation === 2) { // |
        if (direction === 'left' || direction === 'right') {
          path.push({ row, col, type: 'end' });
          break;
        }
      } else if (orientation === 3) { // /
        if (direction === 'down') direction = 'left';
        else if (direction === 'up') direction = 'right';
        else if (direction === 'left') direction = 'down';
        else if (direction === 'right') direction = 'up';
      }
    } else {
      path.push({ row, col, type: 'path' });
    }
  }

  return { path, won: false };
};


  useEffect(() => {
    const { path, won } = calculateLightPath();
    setLightPath(path);
    setHasWon(won);
  }, [mirrors]);

  const getMirrorSymbol = (orientation) => {
    switch(orientation) {
      case 0: return '\\';
      case 1: return '—';
      case 2: return '|';
      case 3: return '/';
      default: return '\\';
    }
  };

  const isInPath = (row, col) => {
    return lightPath.some(p => p.row === row && p.col === col && p.type !== 'source');
  };

  const getLightBeamSegments = () => {
    const segments = [];
    for (let i = 0; i < lightPath.length - 1; i++) {
      const current = lightPath[i];
      const next = lightPath[i + 1];
      
      if (current.type === 'source' || next.type === 'end') continue;
      
      segments.push({
        from: current,
        to: next
      });
    }
    return segments;
  };

  const resetGame = () => {
    setMirrors(initMirrors());
    setHasWon(false);
  };

  const getRotationDegrees = (orientation) => {
  switch (orientation) {
    case 3: return 0;     // '/' - default image orientation
    case 1: return -135;    // '—' - horizontal
    case 2: return -225;   // '|' - vertical
    case 0: return -90;   // '\' - backslash
    default: return 0;
  }
};

  // Handle timer expiry - call sessionApi.completeSession() and onComplete(false)
  useEffect(() => {
    if (!session || session.completed || completionHandledRef.current) return;
    if (session.remainingSeconds === 0) {
      completionHandledRef.current = true;
      sessionApi.completeSession().then(() => {
        onComplete(false);
      });
    }
  }, [session, sessionApi, onComplete]);

  // Handle success completion when hasWon
  useEffect(() => {
    if (hasWon && !completionHandledRef.current && session && !session.completed) {
      completionHandledRef.current = true;
      sessionApi.completeSession().then(() => {
        setTimeout(() => {
          onComplete(true);
        }, 500);
      });
    }
  }, [hasWon, sessionApi, onComplete, session]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-8">
      {/* Timer Display */}
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-slate-800/60 rounded-full px-3 py-1">
          <MinigameTimer 
            remainingSeconds={session?.remainingSeconds ?? null}
          />
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
        <h1 className="text-4xl font-bold text-white mb-2 text-center">Mirror Puzzle</h1>
  <p className="text-white/80 mb-10 text-center">Guide the light to the bottom-right corner!</p>

        <div className="mb-6 relative">
          {/* Light source indicator */}
          <div className="absolute -top-8 left-0 w-full flex justify-center">
            <div 
                className="w-12 h-8 bg-yellow-400 rounded-t-full shadow-lg flex items-center justify-center"
                style={{ position: "absolute", left: `${3 * 56 + 28 - 10}px` }}
            >
            <div className="w-3 h-3 bg-yellow-200 rounded-full animate-pulse"></div>
            </div>
        </div>


          <div
            className="inline-block p-4 rounded-xl relative"
            style={{
              backgroundImage: `url(${lightbg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* SVG for continuous light beam */}
            <svg 
              className="absolute top-4 left-4 pointer-events-none" 
              width={8 * 56} 
              height={7 * 56}
              style={{ zIndex: 1 }}
            >
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              {/* Draw continuous light path */}
              {lightPath.length > 1 && (
                <>
                  {/* Outer glow */}
                  <polyline
                    points={lightPath
                        .map(p => {
                            const x = p.x !== undefined ? p.x : p.col * 56 + 28;
                            const y = p.y !== undefined ? p.y : p.row * 56 + 28;
                            return `${x},${y}`;
                        })
                    .join(' ')}
                    fill="none"
                    stroke="rgba(251, 191, 36, 0.3)"
                    strokeWidth="12"
                    filter="url(#glow)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Middle glow */}
                  <polyline
                    points={lightPath
                        .map(p => {
                            const x = p.x !== undefined ? p.x : p.col * 56 + 28;
                            const y = p.y !== undefined ? p.y : p.row * 56 + 28;
                            return `${x},${y}`;
                        })
                    .join(' ')}
                    fill="none"
                    stroke="rgba(251, 191, 36, 0.7)"
                    strokeWidth="6"
                    filter="url(#glow)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Core beam */}
                  <polyline
                    points={lightPath
                        .map(p => {
                            const x = p.x !== undefined ? p.x : p.col * 56 + 28;
                            const y = p.y !== undefined ? p.y : p.row * 56 + 28;
                            return `${x},${y}`;
                        })
                    .join(' ')}
                    fill="none"
                    stroke="rgba(255, 255, 150, 1)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              )}
            </svg>

            {[...Array(7)].map((_, row) => (
              <div key={row} className="flex">
                {[...Array(8)].map((_, col) => {
                  const key = `${row}-${col}`;
                  const hasMirror = mirrors[key] !== undefined;
                  const inPath = isInPath(row, col);
                  const isTarget = row === 6 && col === 7;
                  const pathPoint = lightPath.find(p => p.row === row && p.col === col);

                  return (
                    <div
                      key={col}
                      className={`w-14 h-14 border border-gray-600 relative flex items-center justify-center`}
                      style={{ zIndex: 2 }}
                    >
                      {hasMirror && (
                        <button
                          onClick={() => rotateMirror(row, col)}
                          className="w-full h-full flex items-center justify-center bg-transparent cursor-pointer group"
                          title="Click to rotate"
                        >
                          <img
                            src={mirror}
                            alt="Mirror"
                            className="w-10 h-10 transition-transform duration-300 ease-in-out"
                            style={{
                              transform: `rotate(${getRotationDegrees(mirrors[key])}deg)`,
                              transformOrigin: 'center center'
                            }}
                          />
                        </button>
                      )}
                      
                      {pathPoint && pathPoint.type === 'target' && (
                        <div className="absolute w-4 h-4 bg-green-400 rounded-full shadow-lg shadow-green-400/50 animate-pulse"></div>
                      )}
                      
                      {pathPoint && pathPoint.type === 'end' && !isTarget && (
                        <div className="absolute w-3 h-3 bg-red-400 rounded-full shadow-lg shadow-red-400/50"></div>
                      )}

                      {isTarget && (
                        <div className="absolute inset-0 flex items-center justify-center text-2xl">
                          🎯
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={resetGame}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg"
          >
            <RotateCw size={20} />
            Reset Game
          </button>
        </div>

        {hasWon && (
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg mt-4 mb-4 text-center font-bold animate-pulse">
             Victory! You solved the puzzle!
          </div>
        )}

        <div className="mt-6 text-white/70 text-sm max-w-md">
          <p className="mb-2"><strong>How to play:</strong></p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Click mirrors to rotate them</li>
            <li>\ and / reflect light diagonally</li>
            <li>— and | block light in one direction</li>
            <li>All mirrors must be used to win</li>
            <li>Guide the light to reach the target 🎯</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MirrorPuzzleGame;