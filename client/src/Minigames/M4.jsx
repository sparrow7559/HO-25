import React, { useState, useEffect, useRef } from "react";
import MinigameTimer from "../components/MinigameTimer";
import bg from '../assets/bgforM4.png';

const SEGMENTS = 8;
const TAU = Math.PI * 2;

function polarToCartesian(cx, cy, r, angleRad) {
  return [cx + r * Math.cos(angleRad), cy + r * Math.sin(angleRad)];
}

function sectorPath(cx, cy, r1, r2, startAngle, endAngle) {
  const [x1, y1] = polarToCartesian(cx, cy, r2, startAngle);
  const [x2, y2] = polarToCartesian(cx, cy, r2, endAngle);
  const [x3, y3] = polarToCartesian(cx, cy, r1, endAngle);
  const [x4, y4] = polarToCartesian(cx, cy, r1, startAngle);

  const largeArc = endAngle - startAngle <= Math.PI ? "0" : "1";

  return `M ${x1} ${y1} A ${r2} ${r2} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${r1} ${r1} 0 ${largeArc} 0 ${x4} ${y4} Z`;
}

export default function ConcentricToggleGame({ config, onComplete, session, sessionApi }) {
  const size = 400;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = 180;
  const innerR = 80;

  // Outer: sectors 1, 4, and 6 colored
  const [outer, setOuter] = useState(() => {
    const arr = Array(SEGMENTS).fill(false);
    arr[1] = true;
    arr[4] = true;
    arr[6] = true;
    return arr;
  });

  // Inner: sectors 1 and 6 colored
  const [inner, setInner] = useState(() => {
    const arr = Array(SEGMENTS).fill(false);
    arr[1] = true;
    arr[6] = true;
    return arr;
  });

  // Token starts at outer ring, index 4
  const [token, setToken] = useState({ ring: "outer", idx: 4 });

  const [winner, setWinner] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const alreadyEnded = useRef(false);

  function checkWin(outerArr, innerArr) {
    return outerArr.every(Boolean) && innerArr.every(Boolean);
  }

  function toggleSegment(ring, idx) {
    if (ring === "outer") {
      setOuter((prev) => {
        const next = prev.map((val, i) => (i === idx ? !val : val));
        if (checkWin(next, inner)) setWinner(true);
        return next;
      });
    } else {
      setInner((prev) => {
        const next = prev.map((val, i) => (i === idx ? !val : val));
        if (checkWin(outer, next)) setWinner(true);
        return next;
      });
    }
  }

  function autoMove() {
    if (gameEnded || alreadyEnded.current) return;
    
    setToken((prevToken) => {
      const current = { ...prevToken };
      current.idx = (current.idx + 3) % SEGMENTS;
      
      if (current.ring === "outer") {
        setOuter((prev) => {
          const next = prev.map((v, i) => (i === current.idx ? !v : v));
          if (checkWin(next, inner)) setWinner(true);
          return next;
        });
      } else {
        setInner((prev) => {
          const next = prev.map((v, i) => (i === current.idx ? !v : v));
          if (checkWin(outer, next)) setWinner(true);
          return next;
        });
      }
      return current;
    });
  }

  function doSwitch() {
    if (gameEnded || alreadyEnded.current) return;
    
    const idx = token.idx;
    if (token.ring === "outer") {
      setInner((prev) => {
        const newInner = prev.map((val, i) => (i === idx ? !val : val));
        if (checkWin(outer, newInner)) setWinner(true);
        return newInner;
      });
      setToken({ ring: "inner", idx });
    } else {
      setOuter((prev) => {
        const newOuter = prev.map((val, i) => (i === idx ? !val : val));
        if (checkWin(newOuter, inner)) setWinner(true);
        return newOuter;
      });
      setToken({ ring: "outer", idx });
    }
  }

  function handleTokenClick() {
    doSwitch();
  }

  function tokenCoords(ring, idx) {
    const startAngle = (idx * TAU) / SEGMENTS - Math.PI / 2;
    const endAngle = ((idx + 1) * TAU) / SEGMENTS - Math.PI / 2;
    const angle = (startAngle + endAngle) / 2;

    let r;
    if (ring === "outer") {
      r = (innerR + outerR) / 2;
    } else {
      r = innerR / 2;
    }

    return polarToCartesian(cx, cy, r, angle);
  }

  const sectors = Array.from({ length: SEGMENTS }, (_, i) => {
    const startAngle = (i * TAU) / SEGMENTS - Math.PI / 2;
    const endAngle = ((i + 1) * TAU) / SEGMENTS - Math.PI / 2;
    return {
      pathOuter: sectorPath(cx, cy, innerR, outerR, startAngle, endAngle),
      pathInner: sectorPath(cx, cy, 0, innerR, startAngle, endAngle),
      startAngle,
      endAngle,
    };
  });

  async function resetGame() {
    if (gameEnded || alreadyEnded.current) return;
    
    // Decrement try on reset
    try {
      await sessionApi.decrementTry();
    } catch (e) {
      console.error('Failed to decrement try on reset', e);
    }

    // Reset outer ring: sectors 1, 4, and 6 colored
    setOuter(() => {
      const arr = Array(SEGMENTS).fill(false);
      arr[1] = true;
      arr[4] = true;
      arr[6] = true;
      return arr;
    });

    // Reset inner ring: sectors 1 and 6 colored
    setInner(() => {
      const arr = Array(SEGMENTS).fill(false);
      arr[1] = true;
      arr[6] = true;
      return arr;
    });

    // Reset token to outer ring, index 4
    setToken({ ring: "outer", idx: 4 });

    // Reset winner flag
    setWinner(false);
  }

  // When player wins, complete the session
  useEffect(() => {
    if (winner && !gameEnded && !alreadyEnded.current) {
      alreadyEnded.current = true;
      setGameEnded(true);
      
      (async () => {
        try {
          await sessionApi.completeSession();
          if (onComplete) onComplete(true);
        } catch (err) {
          console.error('Failed to complete session on win:', err);
        }
      })();
    }
  }, [winner, gameEnded, sessionApi, onComplete]);

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

  const triesLeft = session?.triesLeft ?? null;
  const remainingSeconds = session?.remainingSeconds ?? null;

  return (
    <div className="relative mt-20 w-full max-w-4xl mx-auto">
      {/* Timer Overlay */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-slate-800/60 rounded-full px-2 py-1 inline-block">
          <MinigameTimer remainingSeconds={remainingSeconds} triesLeft={triesLeft} />
        </div>
      </div>

      {/* Background Image Layer */}
      <div
        className="absolute inset-0 bg-center bg-no-repeat bg-cover rounded-2xl"
        style={{ backgroundImage: `url(${bg})` }}
      />

      {/* Content Layer */}
      <div className="relative flex flex-col items-center justify-between gap-4 rounded-2xl shadow-lg p-4 min-h-[600px]">
        {/* SVG Game */}
        <div className="flex-1 w-full flex justify-center items-center">
          <svg
            className="w-[85%] max-w-md h-auto"
            viewBox={`0 0 ${size} ${size}`}
          >
            {/* outer sectors */}
            {sectors.map((s, i) => (
              <path
                key={`outer-${i}`}
                d={s.pathOuter}
                fill={outer[i] ? "#34D399" : "white"}
                stroke="black"
              />
            ))}
            {/* inner sectors */}
            {sectors.map((s, i) => (
              <path
                key={`inner-${i}`}
                d={s.pathInner}
                fill={inner[i] ? "#34D399" : "white"}
                stroke="black"
              />
            ))}

            {/* Lines */}
            <line x1={cx - outerR} y1={cy} x2={cx + outerR} y2={cy} stroke="black" />
            <line x1={cx} y1={cy - outerR} x2={cx} y2={cy + outerR} stroke="black" />
            <line
              x1={cx - outerR * Math.SQRT1_2}
              y1={cy - outerR * Math.SQRT1_2}
              x2={cx + outerR * Math.SQRT1_2}
              y2={cy + outerR * Math.SQRT1_2}
              stroke="black"
            />
            <line
              x1={cx - outerR * Math.SQRT1_2}
              y1={cy + outerR * Math.SQRT1_2}
              x2={cx + outerR * Math.SQRT1_2}
              y2={cy - outerR * Math.SQRT1_2}
              stroke="black"
            />

            {/* Token */}
            {(() => {
              const [tx, ty] = tokenCoords(token.ring, token.idx);
              return (
                <g 
                  key={`token-${token.ring}-${token.idx}`} 
                  onClick={handleTokenClick} 
                  style={{ cursor: gameEnded ? 'default' : 'pointer' }}
                >
                  <circle cx={tx} cy={ty} r={14} fill="#111827" stroke="#000" strokeWidth={2} />
                  <circle cx={tx} cy={ty} r={6} fill={token.ring === 'outer' ? '#60a5fa' : '#34d399'} />
                </g>
              );
            })()}
          </svg>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-2 justify-center mb-2">
          <button
            className="px-3 py-2 bg-blue-500 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={autoMove}
            disabled={gameEnded}
          >
            Move (3 steps clockwise)
          </button>
          <button
            className="px-3 py-2 bg-green-500 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={doSwitch}
            disabled={gameEnded}
          >
            Switch
          </button>
          <button
            className="px-3 py-2 bg-red-500 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={resetGame}
            disabled={gameEnded || triesLeft === 0}
          >
            {gameEnded ? "Game Over" : (triesLeft === 0 ? "No Tries" : "Reset")}
          </button>
        </div>

        {/* Win / Fail Message */}
        {winner && (
          <div className="mt-2 text-2xl font-bold text-white">
            You Won!
          </div>
        )}
        {gameEnded && !winner && (
          <div className="mt-2 text-2xl font-bold text-red-600">
            Game Over
          </div>
        )}
      </div>
    </div>
  );
}