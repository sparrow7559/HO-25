import React, { useState, useEffect, useMemo } from "react";

/**
 * Connections.jsx
 *
 * Only the board geometry (slotPositions), the correct edges, tokensData,
 * and the fillSolution mapping were updated to match the reference images.
 *
 * The rest of your original game structure (selection, placement, edge coloring,
 * reset, return to pool, UI) is preserved exactly.
 */

const TokensPool = ({ tokens, selected, onSelect }) => {
  return (
    <div className="w-full flex flex-wrap gap-3 justify-center p-4">
      {tokens.map((t) => {
        const isSelected =
          selected?.from === "pool" && selected?.index === t.poolIndex;
        return (
          <button
            key={t.id}
            onClick={() => onSelect({ from: "pool", index: t.poolIndex })}
            className={`flex items-center justify-center w-14 h-14 rounded-full border-2 ${
              isSelected ? "ring-4 ring-blue-400" : "border-gray-300"
            } bg-white shadow-md`}
            title={t.label}
          >
            <div className="text-lg -tracking-tighter">
              <div style={{ lineHeight: 1 }}>{t.symbols[0]}</div>
              <div style={{ lineHeight: 1 }}>{t.symbols[1]}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

const Slot = ({
  index,
  x,
  y,
  occupant,
  onClick,
  selected,
  highlight,
  showIndex = false,
}) => {
  const isSelected =
    selected?.from === "slot" && selected?.index === index;
  return (
    <div
      onClick={() => onClick(index)}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: "translate(-50%, -50%)",
      }}
      className={`absolute w-16 h-16 rounded-full flex items-center justify-center border-4 ${
        isSelected ? "ring-4 ring-blue-400" : "border-gray-400"
      } bg-neutral-100 shadow-lg cursor-pointer select-none`}
    >
      {/* show occupant token or empty node */}
      {occupant ? (
        <div className="text-lg -tracking-tighter">
          <div style={{ lineHeight: 1 }}>{occupant.symbols[0]}</div>
          <div style={{ lineHeight: 1 }}>{occupant.symbols[1]}</div>
        </div>
      ) : (
        <div className="text-transparent">empty</div>
      )}

      {/* small highlight ring if the node has at least one green connection (optional) */}
      {highlight && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "9999px",
            boxShadow: "0 0 0 4px rgba(34,197,94,0.08)",
            pointerEvents: "none",
          }}
        />
      )}

      {showIndex && (
        <div
          style={{
            position: "absolute",
            bottom: -18,
            fontSize: 12,
            color: "#333",
            width: 36,
            textAlign: "center",
          }}
        >
          {index}
        </div>
      )}
    </div>
  );
};

export default function Connections() {
  // === Updated board geometry & graph (matches reference image) ===
  // Positions are percentages relative to container (left -> right)
  const slotPositions = [
    { x: 8.53122251539138, y: 45.230769230769226 }, // 0 - left-most mid
    { x: 16.182937554969218, y: 77.0 }, // 1 - bottom-left
    { x: 30.035180299032543, y: 39.46153846153846 }, // 2 - upper-left cluster
    { x: 34.87247141600703, y: 60.46153846153847 }, // 3 - left-center
    { x: 35.79595426561126, y: 84.53846153846155 }, // 4 - lower-leftish
    { x: 46.65787159190853, y: 41.30769230769231 }, // 5 - upper-mid-left
    { x: 47.4934036939314, y: 63.92307692307693 }, // 6 - center (empty in ref)
    { x: 57.29991204925242, y: 84.6923076923077 }, // 7 - lower-mid-right
    { x: 62.18117854001759, y: 56.84615384615385 }, // 8 - mid-right
    { x: 71.06420404573439, y: 71.38461538461539 }, // 9 - lower-right-mid
    { x: 77.9683377308707, y: 86.0 }, // 10 - bottom-right
    { x: 78.93579595426561, y: 51.38461538461539 }, // 11 - right-most upper-mid
  ];

  // === Updated edges (only the actual connections from the reference) ===
  // These indices correspond to the slotPositions order above (left-to-right ordering).
  const edges = [
    [0, 2],
    [0, 3],
    [0, 7],
    [0, 8],
    [0, 10],
    [0, 11],
    [1, 5],
    [1, 6],
    [2, 3],
    [2, 7],
    [2, 8],
    [2, 11],
    [3, 4],
    [3, 5],
    [4, 7],
    [4, 10],
    [5, 9],
    [5, 11],
    [7, 9],
    [7, 10],
    [8, 9],
    [8, 10],
    [9, 10],
    [9, 11],
  ];

  // === TokensData updated to match exact tokens & counts seen in the reference ===
  // NOTE: unicode emoji used: grapes 🍇, sword ⚔️, fish 🐟, cow 🐂, shield 🛡️, olive 🫒 (leaf)
  // The reference layout uses 11 placed tokens (one center node is left empty),
  // so we've defined the token set exactly as seen in the ref image.
  const tokensData = [
    { id: "t1", symbols: ["🐟", "⚔️"], label: "Fish + Sword" }, // placed at slot 0
    { id: "t2", symbols: ["🐟", "⚔️"], label: "Fish + Sword" }, // placed at slot 1
    { id: "t3", symbols: ["🍇", "🛡️"], label: "Grapes + Shield" }, // slot 2
    { id: "t4", symbols: ["🐂", "🫒"], label: "Cow + Olive" }, // slot 3
    { id: "t5", symbols: ["🛡️", "🐟"], label: "Shield + Fish" }, // slot 4
    { id: "t6", symbols: ["🐟", "🛡️"], label: "Fish + Shield" }, // slot 5
    { id: "t7", symbols: ["🐟", "🫒"], label: "Fish + Olive" }, // slot 7
    { id: "t8", symbols: ["⚔️", "🍇"], label: "Sword + Grapes" }, // slot 8
    { id: "t9", symbols: ["🐂", "🛡️"], label: "Cow + Shield" }, // slot 9
    { id: "t10", symbols: ["⚔️", "🍇"], label: "Sword + Grapes" }, // slot 10
    { id: "t11", symbols: ["🍇", "⚔️"], label: "Grapes + Sword" }, // slot 11
  ];

  // --- Helper: shuffle and attach poolIndex for display
  const initialPool = useMemo(() => {
    const arr = tokensData.map((t, i) => ({ ...t, poolIndex: i }));
    // Fisher-Yates shuffle so initial pool order is random on each load
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.map((t, i) => ({ ...t, poolIndex: i }));
    // eslint-disable-next-line
  }, []);

  // State: pool tokens (list)
  const [pool, setPool] = useState(initialPool);

  // State: slots (12). null or token object (token also carries its original id)
  const [slots, setSlots] = useState(Array(slotPositions.length).fill(null));

  // Selected: { from: "pool"|"slot", index: number }
  const [selected, setSelected] = useState(null);

  // Edge colors computed from current slots occupancy
  const [edgeStates, setEdgeStates] = useState(() =>
    edges.map(() => "white")
  );

  // Win state
  const [won, setWon] = useState(false);

  // Utility: check if tokenA and tokenB share any symbol
  const shareSymbol = (a, b) => {
    if (!a || !b) return false;
    return a.symbols.some((s) => b.symbols.includes(s));
  };

  // Recompute edge states whenever slots change
  useEffect(() => {
    const newEdgeStates = edges.map(([a, b]) => {
      const ta = slots[a];
      const tb = slots[b];
      if (ta && tb) {
        // if they share a symbol => NOT green (bad), so white
        if (shareSymbol(ta, tb)) return "white";
        else return "green";
      } else {
        return "white";
      }
    });
    setEdgeStates(newEdgeStates);

    // Check win: all edges are green
    const allGreen = newEdgeStates.every((s) => s === "green");
    setWon(allGreen);
  }, [slots]); // eslint-disable-line

  // Handler: click a token in pool OR a occupied slot
  const handleTokenClick = (from, index) => {
    // if clicking same selection -> deselect
    const already =
      selected && selected.from === from && selected.index === index;
    if (already) {
      setSelected(null);
      return;
    }
    setSelected({ from, index });
  };

  // Handler: click a slot to place token (if empty), or pick up token
  const handleSlotClick = (slotIndex) => {
    const slotOccupant = slots[slotIndex];

    // If slot has occupant and nothing selected -> pick it up
    if (!selected && slotOccupant) {
      // pick up from slot (prepare to move)
      setSelected({ from: "slot", index: slotIndex });
      return;
    }

    // If selected from pool: attempt to place into empty slot
    if (selected?.from === "pool") {
      const token = pool.find((t) => t.poolIndex === selected.index);
      if (!token) {
        setSelected(null);
        return;
      }
      // only allow placement into empty slot
      if (slots[slotIndex]) {
        // user requested to allow placement only into empty slots; do nothing if occupied
        return;
      }

      // remove token from pool
      setPool((p) => p.filter((pt) => pt.poolIndex !== selected.index));

      // place token into the slot
      setSlots((prev) => {
        const copy = [...prev];
        copy[slotIndex] = token;
        return copy;
      });

      setSelected(null);
      return;
    }

    // If selected from slot (move token to another empty slot OR pick back to pool)
    if (selected?.from === "slot") {
      const fromIdx = selected.index;
      const token = slots[fromIdx];
      if (!token) {
        setSelected(null);
        return;
      }

      // If clicked same slot -> deselect
      if (fromIdx === slotIndex) {
        setSelected(null);
        return;
      }

      // Only allow moving to empty slot in this version
      if (!slots[slotIndex]) {
        setSlots((prev) => {
          const copy = [...prev];
          copy[slotIndex] = token;
          copy[fromIdx] = null;
          return copy;
        });
        setSelected(null);
        return;
      }
      // If target occupied -> do nothing (or swap if you want)
      return;
    }
  };

  // Allow removing a placed token back to pool by clicking the slot while selected is null and then clicking "Return to Pool"
  const returnSlotToPool = (slotIndex) => {
    const token = slots[slotIndex];
    if (!token) return;
    // recycle into pool with new poolIndex (end)
    setPool((prev) => {
      const nextIndex = prev.length
        ? Math.max(...prev.map((p) => p.poolIndex)) + 1
        : 0;
      return [...prev, { ...token, poolIndex: nextIndex }];
    });
    setSlots((prev) => {
      const copy = [...prev];
      copy[slotIndex] = null;
      return copy;
    });
    setSelected(null);
  };

  // Restart / Reset
  const handleReset = () => {
    // re-create shuffled pool and empty slots
    const arr = tokensData.map((t, i) => ({ ...t, poolIndex: i }));
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setPool(arr.map((t, i) => ({ ...t, poolIndex: i })));
    setSlots(Array(slotPositions.length).fill(null));
    setSelected(null);
    setWon(false);
  };

  // Fill slots with the exact solution placement (as in the reference image)
  const fillSolution = () => {
    // NOTE: indices correspond to the slotPositions array above (left-to-right ordering).
    // This places the tokens exactly like in the reference image.
    const newSlots = Array(slotPositions.length).fill(null);

    // mapping (slot index -> token)
    // center slot (index 6) is intentionally left empty in the reference layout
    newSlots[0] = { ...tokensData[0], poolIndex: null }; // Fish + Sword
    newSlots[1] = { ...tokensData[1], poolIndex: null }; // Fish + Sword
    newSlots[2] = { ...tokensData[2], poolIndex: null }; // Grapes + Shield
    newSlots[3] = { ...tokensData[3], poolIndex: null }; // Cow + Olive
    newSlots[4] = { ...tokensData[4], poolIndex: null }; // Shield + Fish
    newSlots[5] = { ...tokensData[5], poolIndex: null }; // Fish + Shield
    newSlots[6] = null; // center left empty (matches reference)
    newSlots[7] = { ...tokensData[6], poolIndex: null }; // Fish + Olive
    newSlots[8] = { ...tokensData[7], poolIndex: null }; // Sword + Grapes
    newSlots[9] = { ...tokensData[8], poolIndex: null }; // Cow + Shield
    newSlots[10] = { ...tokensData[9], poolIndex: null }; // Sword + Grapes
    newSlots[11] = { ...tokensData[10], poolIndex: null }; // Grapes + Sword

    // place them and empty the visible pool (reference shows tokens placed on board)
    setSlots(newSlots);
    setPool([]);
    setSelected(null);
  };

  // Helper: find pool element by index
  const poolByIndex = (i) => pool.find((p) => p.poolIndex === i);

  // Render SVG lines for edges (draw under slots)
  const BoardSVG = () => {
    return (
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none", // allow clicks to pass to nodes
        }}
      >
        {edges.map(([a, b], idx) => {
          const aPos = slotPositions[a];
          const bPos = slotPositions[b];
          const state = edgeStates[idx]; // "green" | "white"
          const strokeColor = state === "green" ? "#16a34a" : "#e6e6e6";
          const strokeWidth = state === "green" ? 1.6 : 1.2;
          return (
            <line
              key={idx}
              x1={aPos.x}
              y1={aPos.y}
              x2={bPos.x}
              y2={bPos.y}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              style={{
                filter:
                  state === "green"
                    ? "drop-shadow(0 0 2px rgba(16,185,129,0.25))"
                    : undefined,
              }}
            />
          );
        })}
      </svg>
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="flex items-center justify-between p-4">
        <h2 className="text-2xl font-bold">Connections</h2>
        <div className="flex gap-2 items-center">
          <button
            className="px-3 py-1 bg-gray-100 border rounded shadow-sm"
            onClick={handleReset}
          >
            Reset
          </button>
          <button
            className="px-3 py-1 bg-gray-100 border rounded shadow-sm"
            onClick={() => fillSolution()}
          >
            Fill Solution (debug)
          </button>
          <div className="px-3 py-1 bg-white border rounded shadow-sm">
            Edges: {edges.length}
          </div>
        </div>
      </div>

      {/* Pool of tokens at top */}
      <div className="bg-slate-50 rounded-lg shadow-inner">
        <TokensPool
          tokens={pool}
          selected={selected}
          onSelect={({ from, index }) => handleTokenClick(from, index)}
        />
      </div>

      {/* Board area */}
      <div
        className="relative mt-6 bg-[url('/placeholder-board.png')] bg-cover bg-center rounded-lg"
        style={{
          height: 520,
          backgroundColor: "#f6f0e6",
          border: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        {/* SVG lines */}
        <BoardSVG />

        {/* Slots rendered absolutely */}
        {slotPositions.map((pos, i) => {
          const occupant = slots[i];
          // highlight if any green edge touches this node
          const touchingEdges = edges.some(([a, b], idx) => {
            if (a === i || b === i) {
              return edgeStates[idx] === "green";
            }
            return false;
          });
          return (
            <div key={i}>
              <div
                style={{
                  position: "absolute",
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: "translate(-50%, -50%)",
                  width: 110,
                  height: 110,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none",
                }}
              >
                {/* Outer background ring (visual only) */}
                <div
                  style={{
                    width: 90,
                    height: 90,
                    borderRadius: "9999px",
                    background: "rgba(255,255,255,0.6)",
                    boxShadow: "inset 0 2px 6px rgba(0,0,0,0.1)",
                    pointerEvents: "none",
                  }}
                />
              </div>

              <div
                style={{ position: "absolute", left: `${pos.x}%`, top: `${pos.y}%`, transform: "translate(-50%, -50%)", width: 68, height: 68 }}
              >
                <Slot
                  index={i}
                  x={50}
                  y={50}
                  occupant={occupant}
                  selected={selected}
                  onClick={(idx) => {
                    // actual handler uses slot absolute index
                    handleSlotClick(i);
                  }}
                  highlight={touchingEdges}
                />

                {/* If the slot is occupied, show a small "return" control */}
                {slots[i] && (
                  <button
                    onClick={() => returnSlotToPool(i)}
                    className="absolute -right-2 -top-2 w-6 h-6 rounded-full bg-white border text-xs"
                    style={{ pointerEvents: "auto" }}
                    title="Return to pool"
                  >
                    ↩
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer: selected info and win message */}
      <div className="mt-6 p-4 flex items-center justify-between">
        <div>
          {selected ? (
            selected.from === "pool" ? (
              <div>
                Selected token (pool):{" "}
                <strong>
                  {poolByIndex(selected.index)
                    ? poolByIndex(selected.index).symbols.join(" ")
                    : ""}
                </strong>
              </div>
            ) : (
              <div>
                Selected token (slot {selected.index}):{" "}
                <strong>
                  {slots[selected.index]
                    ? slots[selected.index].symbols.join(" ")
                    : ""}
                </strong>
              </div>
            )
          ) : (
            <div>Click a token (above) or a placed token to move it.</div>
          )}
        </div>

        <div className="text-right">
          {won ? (
            <div className="flex items-center gap-3">
              <div className="text-2xl font-extrabold text-green-600">You Win!</div>
              <button
                className="px-3 py-1 bg-green-100 rounded shadow-sm"
                onClick={handleReset}
              >
                Play again
              </button>
            </div>
          ) : (
            <div className="text-sm text-gray-600">
              Green edges: {edgeStates.filter((e) => e === "green").length} /{" "}
              {edges.length}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
