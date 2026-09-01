import React, { useState, useMemo, useEffect, useRef } from "react";
import MinigameTimer from '../components/MinigameTimer';

const DEFAULT_TOP = [
  [4],
  [2, 3],
  [7],
  [6, 1],
  [10],
  [3, 5],
  [8],
  [7],
  [4, 2],
  [5],
];

const DEFAULT_LEFT = [
  [3, 2],
  [7],
  [9],
  [10],
  [1, 3, 4],
  [8, 1],
  [3, 6],
  [1, 4, 1],
  [2],
  [2],
];

// ✅ Correct solution (G = 1, R = 2)
const CORRECT_SOLUTION = [
  [0, 2], [0, 3], [0, 4], [0, 6], [0, 7],
  [1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [1, 7], [1, 8],
  [2, 1], [2, 2], [2, 3], [2, 4], [2, 5], [2, 6], [2, 7], [2, 8], [2, 9],
  [3, 0], [3, 1], [3, 2], [3, 3], [3, 4], [3, 5], [3, 6], [3, 7], [3, 8], [3, 9],
  [4, 0], [4, 2], [4, 3], [4, 4], [4, 6], [4, 7], [4, 8], [4, 9],
  [5, 0], [5, 1], [5, 2], [5, 3], [5, 4], [5, 5], [5, 6], [5, 7], [5,9],
  [6, 0], [6, 1], [6, 2], [6, 4], [6, 5], [6, 6], [6, 7], [6, 8], [6, 9],
  [7, 1], [7, 3], [7, 4], [7, 5], [7, 6], [7, 8],
  [8, 4], [8, 5],
  [9, 4], [9, 5],
];

export default function LightGrid({
  topNumbers = DEFAULT_TOP,
  leftNumbers = DEFAULT_LEFT,
  solution = CORRECT_SOLUTION,
  cellSize = 36,
  leftWidth = 90,
  config,
  onComplete,
  session,
  sessionApi,
}) {
  const SIZE = 10;
  const [grid, setGrid] = useState(() =>
    Array.from({ length: SIZE }, () =>
      Array.from({ length: SIZE }, () => 0)
    )
  );
  const [resultMsg, setResultMsg] = useState("");
  const completionHandledRef = useRef(false);

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

  // Handle success completion when puzzle is solved
  useEffect(() => {
    if (resultMsg.includes("GREAT") && !completionHandledRef.current && session && !session.completed) {
      completionHandledRef.current = true;
      sessionApi.completeSession().then(() => {
        setTimeout(() => {
          onComplete(true);
        }, 500);
      });
    }
  }, [resultMsg, sessionApi, onComplete, session]);

  const COLORS = [
    "#6b7489ff", // gray-blue (off)
    "#48d354ff", // green (correct)
    "#c73939ff", // red (wrong)
  ];

  const toggleCell = (r, c) => {
    setGrid((prev) => {
      const copy = prev.map((row) => row.slice());
      copy[r][c] = (copy[r][c] + 1) % 3;
      return copy;
    });
  };

  // ✅ Submit: check correctness
  const checkSolution = () => {
    const solSet = new Set(solution.map(([r, c]) => `${r},${c}`));
    let allCorrect = true;

    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const key = `${r},${c}`;
        const isInSolution = solSet.has(key);

        if (isInSolution && grid[r][c] !== 1) allCorrect = false; // should be green
        if (!isInSolution && grid[r][c] !== 2) allCorrect = false; // should be red
      }
    }

    if (allCorrect) {
      setResultMsg("GREAT YOU WIN!");
    } else {
      setResultMsg("Wrong solution — keep trying!");
    }
  };

  const maxTopLines = useMemo(
    () => Math.max(...topNumbers.map((c) => c.length)),
    [topNumbers]
  );
  const lineHeight = 20;
  const topAreaHeight = maxTopLines * lineHeight + 8;

  const gridTemplateColumns = `${leftWidth}px ${Array(SIZE)
    .fill(`${cellSize}px`)
    .join(" ")}`;
  const gridTemplateRows = `${topAreaHeight}px ${Array(SIZE)
    .fill(`${cellSize}px`)
    .join(" ")}`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#1b2838] text-white">
      {/* Timer Display */}
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-slate-800/60 rounded-full px-3 py-1">
          <MinigameTimer 
            remainingSeconds={session?.remainingSeconds ?? null}
          />
        </div>
      </div>

      <div
        className="grid border border-blue-900 bg-[#1b2a3a] p-4 rounded-xl shadow-[0_0_25px_rgba(0,0,50,0.4)]"
        style={{
          gridTemplateColumns,
          gridTemplateRows,
          gap: 0,
        }}
      >
        <div className="col-start-1 row-start-1" />

        {/* TOP CLUES */}
        {topNumbers.map((nums, col) => (
          <div
            key={`top-${col}`}
            className="flex flex-col items-center justify-end pb-1"
            style={{
              gridColumn: col + 2,
              gridRow: 1,
              width: cellSize,
            }}
          >
            {nums.map((n, i) => (
              <div
                key={i}
                className="text-sm text-gray-300"
                style={{ height: lineHeight, lineHeight: `${lineHeight}px` }}
              >
                {n}
              </div>
            ))}
          </div>
        ))}

        {/* LEFT CLUES */}
        {leftNumbers.map((nums, row) => (
          <div
            key={`left-${row}`}
            className="flex items-center justify-end gap-[10px] pr-3 text-sm text-gray-300"
            style={{
              gridColumn: 1,
              gridRow: row + 2,
            }}
          >
            {nums.map((n, i) => (
              <div key={i}>{n}</div>
            ))}
          </div>
        ))}

        {/* GRID CELLS */}
        {grid.map((row, r) =>
          row.map((val, c) => (
            <button
              key={`cell-${r}-${c}`}
              onClick={() => toggleCell(r, c)}
              className="flex items-center justify-center border border-blue-900 cursor-pointer bg-[#2b3a4b] transition-all duration-200 hover:brightness-125"
              style={{
                gridColumn: c + 2,
                gridRow: r + 2,
                width: cellSize,
                height: cellSize,
                boxShadow:
                  val === 0
                    ? "inset 2px 2px 6px #1a1a1a, inset -2px -2px 4px #3c4a5a"
                    : val === 1
                    ? "0 0 20px #48d354ff, inset 0 0 10px #48d354ff"
                    : "0 0 20px #c73939ff, inset 0 0 10px #c73939ff",
              }}
            >
              <div
                className="rounded-full"
                style={{
                  width: Math.round(cellSize * 0.5),
                  height: Math.round(cellSize * 0.5),
                  backgroundColor: COLORS[val],
                  boxShadow:
                    val === 0
                      ? "inset 2px 2px 4px #101820, inset -2px -2px 3px #394b5c"
                      : val === 1
                      ? "0 0 20px #48d354ff, 0 0 10px #48d354ff, inset 0 0 6px #48d354ff"
                      : "0 0 20px #c73939ff, 0 0 10px #c73939ff, inset 0 0 6px #c73939ff",
                }}
              />
            </button>
          ))
        )}
      </div>

      {/* Buttons */}
      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={checkSolution}
          className="px-4 py-2 border border-green-700 bg-[#1b2a3a] rounded-lg hover:bg-[#244c25] text-gray-200 shadow-md"
        >
          Submit
        </button>
      </div>

      {/* ✅ Result message */}
      {resultMsg && (
        <div
          className={`mt-4 text-xl font-semibold transition-all duration-300 ${
            resultMsg.includes("GREAT")
              ? "text-green-400"
              : "text-red-400"
          }`}
        >
          {resultMsg}
        </div>
      )}
    </div>
  );
}
