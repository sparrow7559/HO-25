// SlidingBlocks.jsx
import React, { useState, useRef, useEffect } from "react";
import MinigameTimer from "../components/MinigameTimer";

const GRID = 7;

const DEFAULT_COLOR = "from-blue-400 to-blue-500";

const COLORS = {
  A: "from-rose-400 to-orange-400",
  B: "from-cyan-400 to-teal-400",
  C: "from-violet-400 to-indigo-400",
  D: "from-green-300 to-lime-400",
  E: "from-amber-300 to-orange-300",
  F: "from-sky-300 to-blue-400",
  G: "from-pink-300 to-rose-400",
  H: "from-lime-300 to-emerald-300",
  I: "from-pink-300 to-rose-400",
  J: "from-purple-300 to-fuchsia-400",
  GOAL: "from-yellow-300 to-green-400",
};

/*const COLORS = {
    GOAL: "from-yellow-300 to-green-400",
};*/

const INITIAL_BLOCKS = [
  { id: "A", cells: [{ r: 1, c: 0 }, { r: 1, c: 1 }, { r: 1, c: 2 }, { r: 2, c: 0 }, { r: 2, c: 1 }, { r: 2, c: 2 },  { r: 3, c: 0 }, { r: 3, c: 1 }, { r: 3, c: 2 }] },
  { id: "B", cells: [{ r: 0, c: 3 }] },
  { id: "C", cells: [{ r: 1, c: 3 }, { r: 2, c: 3 }] },
  { id: "D", cells: [{ r: 3, c: 3 }] },
  { id: "F", cells: [{ r: 3, c: 4 }] },
  { id: "E", cells: [{ r: 3, c: 5 }, { r: 3, c: 6 }] },
  { id: "G", cells: [{ r: 4, c: 3 }] },
  { id: "H", cells: [{ r: 4, c: 0 }, { r: 4, c: 1 }, { r: 5, c: 0 }, { r: 5, c: 1 }, { r: 6, c: 0 }, { r: 6, c: 1 }] },
  { id: "I", cells: [{ r: 5, c: 2 }, { r: 5, c: 3 }, { r: 6, c: 2 }, { r: 6, c: 3 }] },
  { id: "J", cells: [{ r: 0, c: 4 }, { r: 0, c: 5 }, { r: 0, c: 6 }, { r: 1, c: 4 }, { r: 1, c: 5 }, { r: 1, c: 6 },  { r: 2, c: 4 }, { r: 2, c: 5 }, { r: 2, c: 6 }] },
];

const GOAL_BLOCK = {
  id: "GOAL",
  cells: [
    { r: 0, c: 3 }, 
    { r: 1, c: 2 }, { r: 1, c: 3 }, { r: 1, c: 4 },
    { r: 2, c: 3 },
    { r: 3, c: 1 }, { r: 3, c: 2 }, { r: 3, c: 3 }, { r: 3, c: 4 }, { r: 3, c: 5 },
    { r: 4, c: 3 }, 
    { r: 5, c: 3 }, 
    { r: 6, c: 3 },
  ],
};

const boundingBox = (cells) => {
  let minR = 99, minC = 99, maxR = -99, maxC = -99;
  cells.forEach(({ r, c }) => {
    if (r < minR) minR = r;
    if (c < minC) minC = c;
    if (r > maxR) maxR = r;
    if (c > maxC) maxC = c;
  });
  return { minR, maxR, minC, maxC, height: maxR - minR + 1, width: maxC - minC + 1 };
};

export default function SlidingBlocks({ config, onComplete, session, sessionApi }) {
  const [blocks, setBlocks] = useState(INITIAL_BLOCKS);
  const [won, setWon] = useState(false);
  const containerRef = useRef(null);
  const [drag, setDrag] = useState(null);
  const [, force] = useState(0);
  const completionHandledRef = useRef(false);

  const buildOccupancy = (skipId) => {
    const grid = Array.from({ length: GRID }, () => Array(GRID).fill(null));
    blocks.forEach((b) => {
      if (b.id === skipId) return;
      b.cells.forEach(({ r, c }) => {
        if (r >= 0 && r < GRID && c >= 0 && c < GRID) grid[r][c] = b.id;
      });
    });
    return grid;
  };

  const checkWin = () => {
    const occ = buildOccupancy(null);
    const uncovered = GOAL_BLOCK.cells.every(({ r, c }) => occ[r][c] === null);
    setWon(uncovered);
  };

  // 🔹 Check win whenever blocks update
  useEffect(() => {
    checkWin();
  }, [blocks]);

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

  // Handle success completion when won
  useEffect(() => {
    if (won && !completionHandledRef.current && session && !session.completed) {
      completionHandledRef.current = true;
      sessionApi.completeSession().then(() => {
        setTimeout(() => {
          onComplete(true);
        }, 500);
      });
    }
  }, [won, sessionApi, onComplete, session]);

  const computeRange = (block, axis) => {
    const occ = buildOccupancy(block.id);
    let min = 0, max = 0;
    for (let d = -1; ; d--) {
      if (block.cells.every(({ r, c }) => {
        const nr = axis === "y" ? r + d : r;
        const nc = axis === "x" ? c + d : c;
        return nr>=0 && nr<GRID && nc>=0 && nc<GRID && !occ[nr][nc];
      })) min = d;
      else break;
    }
    for (let d = 1; ; d++) {
      if (block.cells.every(({ r, c }) => {
        const nr = axis === "y" ? r + d : r;
        const nc = axis === "x" ? c + d : c;
        return nr>=0 && nr<GRID && nc>=0 && nc<GRID && !occ[nr][nc];
      })) max = d;
      else break;
    }
    return { min, max };
  };

  const getCellPx = () => containerRef.current.getBoundingClientRect().width / GRID;

  const onDown = (e, block) => {
    e.preventDefault();
    setDrag({
      id: block.id,
      start: { x: e.clientX, y: e.clientY },
      startCells: block.cells.map((c) => ({ ...c })),
      translate: 0,
      axis: null,
    });
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const onMove = (e) => {
    setDrag((prev) => {
      if (!prev) return null;
      const dx = e.clientX - prev.start.x;
      const dy = e.clientY - prev.start.y;
      let axis = prev.axis;
      if (!axis) axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";

      const block = blocks.find((b) => b.id === prev.id);
      const range = computeRange(block, axis);
      const px = getCellPx();
      const raw = axis === "x" ? dx : dy;
      const minPx = range.min * px;
      const maxPx = range.max * px;
      const clamped = Math.max(minPx, Math.min(maxPx, raw));
      return { ...prev, axis, translate: clamped };
    });
    force(x => x+1);
  };

  const onUp = () => {
    setDrag((prev) => {
      if (!prev) return null;
      const delta = Math.round(prev.translate / getCellPx());
      const newBlocks = blocks.map((b) =>
        b.id === prev.id
          ? {
              ...b,
              cells: b.cells.map(({ r, c }) =>
                prev.axis === "x" ? { r, c: c + delta } : { r: r + delta, c }
              ),
            }
          : b
      );
      setBlocks(newBlocks);
      return null;
    });
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
  };

  return (
    <div className="min-h-screen flex items-center mt-18 justify-center bg-slate-100 p-6">
      {/* Timer Display */}
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-slate-800/60 rounded-full px-3 py-1">
          <MinigameTimer 
            remainingSeconds={session?.remainingSeconds ?? null}
          />
        </div>
      </div>

      <div className="max-w-[720px] w-full">
        <div className="flex justify-between mb-4">
          <h1 className="font-semibold">Sliding Puzzle - Straight Line Only</h1>
          <button
            className="border px-3 py-1 rounded bg-white"
            onClick={() => { setBlocks(INITIAL_BLOCKS); setWon(false); }}
          >
            Reset
          </button>
        </div>

        <div ref={containerRef} className="relative aspect-square bg-white border rounded shadow overflow-hidden">
          <div className="absolute inset-0 grid grid-cols-7 grid-rows-7">
            {[...Array(GRID * GRID)].map((_, i) => (
              <div key={i} className="border border-slate-200"></div>
            ))}
          </div>

        <div className="absolute inset-0 z-0">
            {GOAL_BLOCK.cells.map(({ r, c }, i) => (
                <div
                        key={i}
                        className={`absolute bg-gradient-to-r ${COLORS.GOAL} flex items-center justify-center text-white font-bold`}
                        style={{
                            left: `${(c / GRID) * 100}%`,
                            top: `${(r / GRID) * 100}%`,
                            width: `${100 / GRID}%`,
                            height: `${100 / GRID}%`,
                            opacity: won ? 1 : 0.3,
                            transition: "opacity 0.3s",
                        }}
                    >
                        {won && "⭐"}
            </div>
        ))}
        </div>


          {/* Movable blocks */}
          <div className="absolute inset-0 z-10">
            {blocks.map((b) => {
              const bb = boundingBox(b.cells);
              const left = (bb.minC / GRID) * 100;
              const top = (bb.minR / GRID) * 100;
              const w = (bb.width / GRID) * 100;
              const h = (bb.height / GRID) * 100;
              let transform = "";
              if (drag?.id === b.id) {
                transform = drag.axis === "x"
                  ? `translate(${drag.translate}px, 0)`
                  : `translate(0, ${drag.translate}px)`;
              }
              return (
                <div
                  key={b.id}
                  onPointerDown={(e) => onDown(e, b)}
                  className="absolute cursor-grab"
                  style={{
                    left: `${left}%`,
                    top: `${top}%`,
                    width: `${w}%`,
                    height: `${h}%`,
                    transform,
                    transition: "none", // 🔹 no jitter
                  }}
                >
                  {b.cells.map((cell, i) => {
                    const cx = ((cell.c - bb.minC) / bb.width) * 100;
                    const cy = ((cell.r - bb.minR) / bb.height) * 100;
                    const cw = (1 / bb.width) * 100;
                    const ch = (1 / bb.height) * 100;
                    return (
                      <div
                        key={i}
                        className={`absolute bg-gradient-to-r ${COLORS[b.id] || DEFAULT_COLOR} border-2 border-white/30 rounded`}
                        style={{ left: `${cx}%`, top: `${cy}%`, width: `${cw}%`, height: `${ch}%` }}
                      />
                    );
                  })}
                  <div className="absolute left-1 top-1 text-[10px] bg-black/30 text-white px-1 rounded">{b.id}</div>
                </div>
              );
            })}
          </div>
        </div>

        {won && (
          <div className="mt-4 p-3 bg-green-200 text-green-800 rounded text-center font-semibold">
            🎉 You Win! The hidden block is revealed.
          </div>
        )}
      </div>
    </div>
  );
}