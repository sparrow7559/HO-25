import React, { useState, useEffect, useRef } from "react";
import MinigameTimer from '../components/MinigameTimer';

export default function StepBlocksGame({ config, onComplete, session, sessionApi }) {
  const completionHandledRef = useRef(false);
  const structure = [2, 3, 4, 5];

  const levels = [
    {
      left: [
        { color: "red", coords: [[0, 0], [0, 1], [1, 1]] },
        { color: "yellow", coords: [[1, 0], [2, 0]] },
        { color: "purple", coords: [[1, 2]] },
        { color: "pink", coords: [[2, 1], [2, 2], [3, 2]] },
        { color: "orange", coords: [[3, 0], [3, 1]] },
        { color: "lime", coords: [[2, 3], [3, 3], [3, 4]] },
      ],
      right: [
        { color: "red", coords: [[0, 1], [1, 1]] },
        { color: "yellow", coords: [[2, 0], [2, 1], [3, 0]] },
        { color: "purple", coords: [[2, 2], [3, 2]] },
        { color: "pink", coords: [[2, 3], [3, 3], [3, 4]] },
      ],
    },
    {
      left: [
        { color: "blue", coords: [[0, 0], [0, 1], [1, 0]] },
        { color: "green", coords: [[2, 0], [2, 1], [3, 0]] },
        { color: "purple", coords: [[2, 2], [2, 3], [3, 3], [3, 4]] },
      ],
      right: [
        { color: "orange", coords: [[0, 0], [1, 0]] },
        { color: "yellow", coords: [[1, 1], [1, 2]] },
        { color: "pink", coords: [[2, 0], [2, 1]] },
        { color: "purple", coords: [[2, 2], [3, 1], [3, 2]] },
        { color: "blue", coords: [[2, 3], [3, 3], [3, 4]] },
      ],
    },
    {
      left: [
        { color: "blue", coords: [[0, 1], [1, 2]] },
        { color: "green", coords: [[2, 3], [3, 3], [3, 4]] },
        { color: "purple", coords: [[1, 0], [1, 1], [2, 1], [2, 2]] },
      ],
      right: [
        { color: "orange", coords: [[0, 0], [1, 0], [0, 1], [1, 1], [1, 2]] },
        { color: "pink", coords: [[2, 1], [2, 2], [3, 1]] },
        { color: "purple", coords: [[2, 3], [3, 3], [3, 4]] },
      ],
    },
    {
      left: [
        { color: "blue", coords: [[0, 1], [1, 0], [1, 1]] },
        { color: "green", coords: [[1, 2], [2, 2], [3, 2]] },
        { color: "purple", coords: [[2, 0], [3, 0], [3, 1]] },
        { color: "pink", coords: [[2, 3], [3, 3], [3, 4]] },
      ],
      right: [
        { color: "orange", coords: [[0, 0], [1, 0],  [1, 1]] },
        { color: "pink", coords: [[2, 0], [3, 1]] },
        { color: "purple", coords: [[2, 1], [3, 2]] },
        { color: "green", coords: [[2, 3], [3, 3], [3, 4]] }, 
      ],
    },
    {
      left: [
        { color: "blue", coords: [[0, 1], [1, 0]] },
        { color: "green", coords: [[1, 1], [2, 1], [1, 2]] },
        { color: "purple", coords: [[2, 0], [3, 0], [3, 1]] },
        { color: "pink", coords: [[2, 2], [3, 2], [3, 3]] },
      ],
      right: [
        { color: "orange", coords: [[0, 1], [1, 2]] },
        { color: "pink", coords: [[2, 0], [3, 1]] },
        { color: "purple", coords: [[2, 3], [3, 2]] },
        { color: "green", coords: [[1, 1], [2, 1], [2, 2]] }, 
      ],
    },
  ];

  const colorClassMap = {
    red: "bg-red-500",
    yellow: "bg-yellow-400",
    purple: "bg-purple-500",
    pink: "bg-pink-500",
    orange: "bg-orange-500",
    lime: "bg-lime-400",
    blue: "bg-blue-500",
    green: "bg-green-500",
    black: "bg-gray-800",
  };

  const [levelIndex, setLevelIndex] = useState(0);
  const [leftBlocks, setLeftBlocks] = useState(levels[0].left);
  const [rightBlocks, setRightBlocks] = useState(levels[0].right);
  const [dragging, setDragging] = useState(null);
  const [preview, setPreview] = useState(null);
  const [msg, setMsg] = useState("");
  const [mouseOffset, setMouseOffset] = useState([0, 0]);
  const [draggingMouse, setDraggingMouse] = useState([0, 0]);
  const [timeLeft, setTimeLeft] = useState(20);
  const coordsToKey = ([r, c]) => `${r},${c}`;

  const getWeight = (blocks) =>
    blocks.reduce((s, group) => s + group.coords.length, 0);

  const findOccupyingColor = (blocks, r, c) =>
    blocks.find((group) =>
      group.coords.some(([rr, cc]) => rr === r && cc === c)
    )?.color || null;

  const coordsInBounds = (coords) =>
    coords.every(
      ([r, c]) => r >= 0 && r < structure.length && c >= 0 && c < structure[r]
    );

  const hasConflict = (blocks, coordsToPlace, excludeSet = new Set()) => {
    for (const [r, c] of coordsToPlace) {
      for (const group of blocks) {
        for (const [rr, cc] of group.coords) {
          const k = coordsToKey([r, c]);
          if (excludeSet.has(k)) continue;
          if (rr === r && cc === c) return true;
        }
      }
    }
    return false;
  };

  const onDragStart = (e, color, side, index, row, col) => {
    const blocks = side === "left" ? leftBlocks : rightBlocks;
    const group = blocks[index];

    const rect = e.target.getBoundingClientRect();
    setMouseOffset([e.clientX - rect.left, e.clientY - rect.top]);
    setDraggingMouse([e.clientX, e.clientY]);

    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({ color, from: side, index, anchor: [row, col] })
    );
    e.dataTransfer.effectAllowed = "move";

    setDragging({ color, from: side, index, coords: group.coords, anchor: [row, col] });
    setMsg(`Dragging ${color} from ${side}`);
  };

  const onDragEnd = () => {
    setDragging(null);
    setPreview(null);
  };

  const onCellDragOver = (e, targetSide, targetRow, targetCol) => {
    setDraggingMouse([e.clientX, e.clientY]);
    e.preventDefault();
    if (!dragging) return;

    const { coords, anchor } = dragging;
    const [anchorR, anchorC] = anchor;
    const offsetR = targetRow - anchorR;
    const offsetC = targetCol - anchorC;

    const proposed = coords.map(([r, c]) => [r + offsetR, c + offsetC]);

    const inBounds = coordsInBounds(proposed);
    const targetBlocks = targetSide === "left" ? leftBlocks : rightBlocks;

    const excludeSet = new Set();
    if (dragging.from === targetSide) {
      const group = (dragging.from === "left" ? leftBlocks : rightBlocks)[
        dragging.index
      ];
      group.coords.forEach((cc) => excludeSet.add(coordsToKey(cc)));
    }

    const conflict = hasConflict(targetBlocks, proposed, excludeSet);
    setPreview({ coords: proposed, valid: inBounds && !conflict, side: targetSide });
  };

  const onCellDragLeave = () => {
    setPreview(null);
  };

  const onCellDrop = (e, targetSide, targetRow, targetCol) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData("application/json");
    let payload = null;
    try {
      payload = raw ? JSON.parse(raw) : null;
    } catch {
      payload = null;
    }

    const active = dragging || payload;
    if (!active) {
      setMsg("No group being dragged.");
      setPreview(null);
      setDragging(null);
      return;
    }

    const { color, from, index, anchor } = active;
    const fromBlocks = from === "left" ? leftBlocks : rightBlocks;
    const group = fromBlocks[index];
    if (!group) return;

    const [anchorR, anchorC] = anchor;
    const offsetR = targetRow - anchorR;
    const offsetC = targetCol - anchorC;
    const newCoords = group.coords.map(([r, c]) => [r + offsetR, c + offsetC]);

    const targetBlocks = targetSide === "left" ? leftBlocks : rightBlocks;

    const excludeSet = new Set();
    if (from === targetSide) {
      group.coords.forEach((cc) => excludeSet.add(coordsToKey(cc)));
    }

    const inBounds = coordsInBounds(newCoords);
    const conflict = hasConflict(targetBlocks, newCoords, excludeSet);

    if (!inBounds || conflict) {
      setMsg("Invalid move.");
      setPreview(null);
      setDragging(null);
      return;
    }

    if (from === targetSide) {
      // Moving within the same side
      const updated = [...fromBlocks];
      updated[index] = { ...group, coords: newCoords };
      if (targetSide === "left") setLeftBlocks(updated);
      else setRightBlocks(updated);
      setMsg(`Moved ${color} within ${targetSide}`);
    } else {
      // Moving across sides
      const movedGroup = { color, coords: newCoords };

      if (from === "left") {
        const newLeft = leftBlocks.filter((_, i) => i !== index);
        setLeftBlocks(newLeft);
        setRightBlocks([...rightBlocks, movedGroup]);
      } else {
        const newRight = rightBlocks.filter((_, i) => i !== index);
        setRightBlocks(newRight);
        setLeftBlocks([...leftBlocks, movedGroup]);
      }

      setMsg(`Moved ${color} from ${from} to ${targetSide}`);
    }

    setDragging(null);
    setPreview(null);
  };

  useEffect(() => {
    setTimeLeft(30); // reset timer when level changes
    const timerInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          // move to next level if time runs out
          if (levelIndex + 1 < levels.length) {
            setLevelIndex((i) => i + 1);
            setLeftBlocks(levels[levelIndex + 1].left);
            setRightBlocks(levels[levelIndex + 1].right);
            setMsg(" Time up! Moved to next level.");
          } else {
            setMsg(" Time up! Game over!");
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [levelIndex]);

  // Auto-fail when backend timer expires
  useEffect(() => {
    if (!session || session.completed || completionHandledRef.current) return;
    if (session.remainingSeconds === 0) {
      setMsg('Session expired');
      completionHandledRef.current = true;
      
      (async () => {
        try {
          await sessionApi.completeSession();
          console.log('M10: Timer expired - session completed on backend');
          if (onComplete) onComplete(false);
        } catch (err) {
          console.error('M10: Failed to complete session on timer expiry:', err);
          if (onComplete) onComplete(false);
        }
      })();
    }
  }, [session, sessionApi, onComplete]);

  const renderCell = (side, blocks, row, col) => {
    const occupyingColor = findOccupyingColor(blocks, row, col);
    const bgClass = occupyingColor
      ? colorClassMap[occupyingColor] || colorClassMap.black
      : colorClassMap.black;

    let previewClass = "";
    if (preview && preview.side === side) {
      const inPreview = preview.coords.some(([r, c]) => r === row && c === col);
      if (inPreview) {
        previewClass = preview.valid
          ? "ring-2 ring-green-400/50"
          : "ring-2 ring-red-400/50";
      }
    }

    return (
      <div
        key={col}
        draggable={!!occupyingColor}
        onDragStart={(e) => {
          const index = blocks.findIndex((group) =>
            group.coords.some(([rr, cc]) => rr === row && cc === col)
          );
          if (index !== -1) {
            onDragStart(e, occupyingColor, side, index, row, col);
          }
        }}
        onDragEnd={onDragEnd}
        onDragOver={(e) => onCellDragOver(e, side, row, col)}
        onDragLeave={onCellDragLeave}
        onDrop={(e) => onCellDrop(e, side, row, col)}
        className={`w-14 h-14 border-2 flex items-center justify-center ${bgClass} ${previewClass}`}
      >
        {occupyingColor ? (
          <span className="text-xs text-white/90 select-none">
            {occupyingColor[0].toUpperCase()}
          </span>
        ) : null}
      </div>
    );
  };

  const renderStructure = (side, blocks) => (
    <div className="p-3 rounded-md">
      <div className="text-black text-lg mb-2">
        {side === "left" ? "Left" : "Right"} — Weight: {getWeight(blocks)}
      </div>
      <div className="flex flex-col items-start">
        {structure.map((cols, row) => (
          <div key={row} className="flex">
            {Array.from({ length: cols }).map((_, col) =>
              renderCell(side, blocks, row, col)
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const leftWeight = getWeight(leftBlocks);
  const rightWeight = getWeight(rightBlocks);
  const balanced = leftWeight === rightWeight;

  useEffect(() => {
    if (balanced && !completionHandledRef.current) {
      const timer = setTimeout(() => {
        if (levelIndex + 1 < levels.length) {
          // Move to next level after 3 seconds
          setLevelIndex(levelIndex + 1);
          setLeftBlocks(levels[levelIndex + 1].left);
          setRightBlocks(levels[levelIndex + 1].right);
          setMsg("Next Level Loaded!");
        } else {
          // All levels completed
          setMsg("🎉 You completed all levels!");
          completionHandledRef.current = true;
          
          (async () => {
            try {
              await sessionApi.completeSession();
              console.log('M10: All levels completed - session completed successfully');
              if (onComplete) onComplete(true);
            } catch (err) {
              console.error('M10: Failed to complete session on success:', err);
              if (onComplete) onComplete(true);
            }
          })();
        }
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [balanced, levelIndex, sessionApi, onComplete]);

  return (
    <div className="min-h-screen flex flex-col items-center mt-20 justify-start p-6 gap-6 relative">
      {/* Timer Display */}
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-slate-800/60 rounded-full px-3 py-1">
          <MinigameTimer remainingSeconds={session?.remainingSeconds ?? null} />
        </div>
      </div>

      <h1 className="text-2xl text-black font-semibold">
        Step Blocks — Level {levelIndex + 1}
      </h1>

      <div className="flex gap-8">
        {renderStructure("left", leftBlocks)}
        {renderStructure("right", rightBlocks)}
      </div>

      {dragging && preview && (
        <div
          className="absolute top-0 left-0 pointer-events-none z-50"
          style={{
            transform: `translate(${draggingMouse[0] - mouseOffset[0]}px, ${draggingMouse[1] - mouseOffset[1]}px)`,
          }}
        >
          {dragging.coords.map(([r, c], i) => (
            <div
              key={i}
              className={`w-14 h-14 border-2 absolute ${colorClassMap[dragging.color]} opacity-70`}
              style={{
                top: `${(r - dragging.anchor[0]) * 56}px`,
                left: `${(c - dragging.anchor[1]) * 56}px`,
              }}
            />
          ))}
        </div>
      )}

      <div className="text-sm text-black">
        Drag any colored cell to move its entire group. Drop onto any cell (same or other side).
      </div>

      <div className="text-sm text-yellow-600">{msg}</div>

      {balanced && levelIndex + 1 < levels.length ? (
        <div className="text-green-500 text-xl font-bold mt-2">
           Balanced! Loading Next Level...
        </div>
      ) : balanced ? (
        <div className="text-green-600 text-xl font-bold mt-2">
           Game Completed!
        </div>
      ) : (
        <div className="text-gray-500 mt-2">
          Left: {leftWeight} — Right: {rightWeight}
        </div>
      )}
      <div className="text-lg text-black font-medium">
        ⏱ Time Left: {timeLeft}s
      </div> 

      <div className="mt-4">
        <button
          className="px-3 py-1 rounded bg-gray-700 text-white"
          onClick={() => {
            setLeftBlocks(levels[levelIndex].left);
            setRightBlocks(levels[levelIndex].right);
            setMsg("Level reset.");
            setPreview(null);
            setDragging(null);
          }}
        >
          Reset Level
        </button>
      </div>
    </div>
  );
}