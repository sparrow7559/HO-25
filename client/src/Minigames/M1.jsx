import React, { useState, useEffect } from "react";
import valImg from "../assets/TilesWall.jpg";
import MinigameTimer from "../components/MinigameTimer";
import useMinigameSession from "../lib/useMinigameSession"; // ✅ your hook

export default function M1({ tileSize = 106.25, imageSrc = valImg, onComplete }) {
  const minigameId = "M1"; // unique backend ID for this minigame

  // ✅ Hook that fetches and polls session from backend
  const { session, loading, error, remainingSeconds, triesLeft, api: sessionApi } =
    useMinigameSession(minigameId);

  const cols = 4;
  const rows = 5;
  const totalTiles = cols * rows; // 20
  const imageTiles = 16; // 4x4 top portion
  const [tiles, setTiles] = useState([]);
  const [won, setWon] = useState(false);
  const sizePx = tileSize * cols;

  // Scramble board on mount
  useEffect(() => {
    const initial = Array.from({ length: totalTiles }, (_, i) => i);
    let scrambled = [...initial];
    const scrambleMoves = Math.max(30, totalTiles * 6);
    for (let m = 0; m < scrambleMoves; m++) {
      const r = Math.floor(Math.random() * (rows - 1));
      const c = Math.floor(Math.random() * (cols - 1));
      scrambled = rotate2x2(scrambled, r, c, cols);
    }
    setTiles(scrambled);
    setWon(false);
  }, [tileSize, imageSrc]);

// ✅ Fail automatically when timer hits zero
useEffect(() => {
  if (!session || session.completed || remainingSeconds == null) return;

  if (remainingSeconds === 0) {
    // Prevent multiple triggers
    let didFail = false;

    (async () => {
      if (didFail) return;
      didFail = true;
      try {
        await sessionApi.completeSession(); // notify backend of fail
        if (onComplete) onComplete(false);
      } catch (err) {
        console.error("Failed to mark session as failed:", err);
      }
    })();
  }
}, [remainingSeconds, session, sessionApi, onComplete]);


  // ✅ Auto-complete when solved
  useEffect(() => {
    if (won) {
      setTimeout(async () => {
        await sessionApi.completeSession(); // mark success
        if (onComplete) onComplete(true);
      }, 1500);
    }
  }, [won, onComplete, sessionApi]);

  // Helper functions
  function rotate2x2(board, row, col, N) {
    const newBoard = board.slice();
    const idx = (r, c) => r * N + c;

    const a = idx(row, col);
    const b = idx(row, col + 1);
    const cIdx = idx(row + 1, col);
    const d = idx(row + 1, col + 1);

    const tmp = newBoard[a];
    newBoard[a] = newBoard[cIdx];
    newBoard[cIdx] = newBoard[d];
    newBoard[d] = newBoard[b];
    newBoard[b] = tmp;

    return newBoard;
  }

  function isSolved(board) {
    for (let i = 0; i < imageTiles; i++) {
      if (board[i] !== i) return false;
    }
    const lastFour = board.slice(16, 20);
    return (
      new Set(lastFour).size === 4 &&
      lastFour.every((x) => [16, 17, 18, 19].includes(x))
    );
  }

  async function handleKnobClick(row, col) {
    if (won || loading) return;

    const newTiles = rotate2x2(tiles, row, col, cols);
    setTiles(newTiles);

    if (isSolved(newTiles)) {
      setWon(true);
    } 
    // The 'else' block that decremented tries has been removed.
  }

  // ================== UI ==================
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
      style={{
        background: "#0D1A2F",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        padding: 20,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18 }}>
        <h1 style={{ margin: 0 }}>Knob Rotation Puzzle</h1>
        {/* ✅ Timer fully connected to backend - triesLeft prop removed */}
        <MinigameTimer
          remainingSeconds={remainingSeconds}
        />
      </div>

      {won && (
        <div
          style={{
            marginBottom: 12,
            padding: "8px 16px",
            borderRadius: 8,
            background: "rgba(196,164,132,0.12)",
            color: "#c4a484",
            boxShadow: "0 0 18px rgba(196,164,132,0.25)",
            fontWeight: "700",
          }}
        >
          🎉 Congratulations — the image is restored! 🎉
        </div>
      )}

      {/* Game grid */}
      <div
        style={{
          position: "relative",
          width: `${cols * tileSize}px`,
          height: `${rows * tileSize}px`,
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, ${tileSize}px)`,
          gridTemplateRows: `repeat(${rows}, ${tileSize}px)`,
          background: "#111",
        }}
      >
        {tiles.map((tileIndex, i) => {
          const isBottomRow = tileIndex >= imageTiles;
          const imgRow = Math.floor(tileIndex / cols);
          const imgCol = tileIndex % cols;
          return (
            <div
              key={i}
              style={{
                width: `${tileSize}px`,
                height: `${tileSize}px`,
                background: isBottomRow
                  ? "black"
                  : `url(${imageSrc})`,
                backgroundSize: `${sizePx}px ${sizePx}px`,
                backgroundPosition: isBottomRow
                  ? "center"
                  : `-${imgCol * tileSize}px -${imgRow * tileSize}px`,
                border: "1px solid rgba(255,255,255,0.05)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
                color: isBottomRow ? "white" : "red",
              }}
            >
              {tileIndex + 1}
            </div>
          );
        })}

        {Array.from({ length: rows - 1 }).map((_, r) =>
          Array.from({ length: cols - 1 }).map((_, c) => {
            const leftPct = ((c + 1) / cols) * 100;
            const topPct = ((r + 1) / rows) * 100;
            return (
              <button
                key={`knob-${r}-${c}`}
                onClick={() => handleKnobClick(r, c)}
                style={{
                  position: "absolute",
                  left: `${leftPct}%`,
                  top: `${topPct}%`,
                  transform: "translate(-50%, -50%)",
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  border: "2px solid black",
                  background:
                    "radial-gradient(circle at 35% 30%, white, rgba(200,200,200,0.8))",
                  cursor: "pointer",
                }}
              />
            );
          })
        )}
      </div>

      <div style={{ marginTop: 16, color: "#bbb", fontSize: 13 }}>
        Click any knob to rotate the 2×2 block clockwise.
      </div>
    </div>
  );
}