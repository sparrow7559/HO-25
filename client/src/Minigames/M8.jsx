import React, { useEffect, useRef, useState, useCallback } from "react";
import MinigameTimer from "../components/MinigameTimer";
import letterSrc from "../assets/letter.jpg";
import letterbg from "../assets/plainletter.jpg";

// =================================================================
// New ClockDialLock Component for the Secret Code Stage (Final Optimization)
// =================================================================
const ClockDialLock = ({ onSequenceComplete, setCodeMsg }) => {
  const DIAL_SIZE = 200;
  const NUMBERS = 12; // 1 to 12
  const ROTATION_FACTOR = 360 / NUMBERS; // 30 degrees per number

  // The required sequence of target numbers
  const requiredSequence = [3, 4, 7, 12];

  // We use 12 as the start value, corresponding to 0 degrees rotation
  const [currentValue, setCurrentValue] = useState(12);
  const [enteredSequence, setEnteredSequence] = useState([]); // Stores all recorded stops
  
  // This state is now only updated on snap (PointerUp) to minimize re-renders
  const [snappedDegrees, setSnappedDegrees] = useState(0); 
  const [isDragging, setIsDragging] = useState(false);
  
  const dialRef = useRef(null);
  const dragStateRef = useRef({
    startAngle: 0,
    startRotationDegrees: 0,
    currentVisualRotation: 0, // Track rotation during drag
  });


  // Helper to convert 1-12 clock value to CCW degrees from 12 position (0 index)
  const clockToDegrees = useCallback((value) => {
    // 12 -> 0, 1 -> 1, ..., 11 -> 11
    const index = (value === 12 ? 0 : value);
    return index * ROTATION_FACTOR;
  }, [ROTATION_FACTOR]);

  // Helper to convert rotation in degrees (CW/positive) to the clock value at the 12 position
  const degreesToClock = useCallback((degrees) => {
    // Negate degrees because the dial rotates CW (positive degrees) but the clock values move CCW.
    // Normalize to 0-360 positive CCW rotation relative to the numbers.
    let normalized = (-degrees % 360);
    if (normalized < 0) normalized += 360;
    
    // Calculate index (0 for 12, 1 for 1, etc.)
    const index = Math.round(normalized / ROTATION_FACTOR) % NUMBERS;
    
    // Convert index back to 1-12 clock value
    return index === 0 ? 12 : index;
  }, [ROTATION_FACTOR, NUMBERS]);
  
  const handlePointerDown = (e) => {
    e.preventDefault();
    const rect = dialRef.current.getBoundingClientRect();
    const centerX = rect.left + DIAL_SIZE / 2;
    const centerY = rect.top + DIAL_SIZE / 2;

    const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);

    dragStateRef.current = {
      startAngle: currentAngle,
      startRotationDegrees: snappedDegrees, // Start from the last snapped position
      currentVisualRotation: snappedDegrees,
    };
    setIsDragging(true);
    setCodeMsg('');

    // Remove the CSS transition temporarily for fluid dragging
    dialRef.current.style.transition = 'none';
  };

  useEffect(() => {
    const onPointerMove = (e) => {
      if (!isDragging || !dialRef.current) return;

      const rect = dialRef.current.getBoundingClientRect();
      const centerX = rect.left + DIAL_SIZE / 2;
      const centerY = rect.top + DIAL_SIZE / 2;

      const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
      
      let angleDiff = currentAngle - dragStateRef.current.startAngle;
      
      // Handle wrap-around
      if (angleDiff > 180) angleDiff -= 360;
      if (angleDiff < -180) angleDiff += 360;
      
      // Calculate new visual rotation
      const newRotationDegrees = dragStateRef.current.startRotationDegrees + angleDiff;
            
      // Update DOM directly using CSS variable for smooth, jitter-free dragging
      dialRef.current.style.setProperty('--rotation-degrees', `${newRotationDegrees}deg`);
      
      // *** CHANGE APPLIED HERE ***
      // The redundant loop to update number rotation was removed.
      // The numbers now correctly use the parent's CSS variable, which is more efficient.
      
      dragStateRef.current.currentVisualRotation = newRotationDegrees;

      // Update the current value shown to the user 
      const visibleValue = degreesToClock(newRotationDegrees);
      setCurrentValue(visibleValue);
    };

    const onPointerUp = () => {
      if (!isDragging) return;
      setIsDragging(false);

      const finalDragRotation = dragStateRef.current.currentVisualRotation;
      
      // 1. Snap to the nearest 30-degree position
      const snapped = Math.round(finalDragRotation / ROTATION_FACTOR) * ROTATION_FACTOR;
      
      // 2. Update state to commit the snapped rotation
      setSnappedDegrees(snapped);
      
      // 3. Re-enable CSS transition for the snap animation
      // *** CHANGE APPLIED HERE ***
      // Switched to a cubic-bezier for a smoother, more physical "snap" effect.
      dialRef.current.style.transition = 'transform 150ms cubic-bezier(0.2, 0.8, 0.2, 1)';
      
      // 4. Calculate the final value after the snap
      const finalValue = degreesToClock(snapped);
      setCurrentValue(finalValue);

      // 5. Store the entered value. NO VALIDATION YET.
      setEnteredSequence(prev => [...prev, finalValue]);

      // 6. Clear any previous code message
      setCodeMsg('');
    };

    if (isDragging) {
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
    }

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [isDragging, snappedDegrees, requiredSequence, setCodeMsg, degreesToClock, ROTATION_FACTOR]);

  // --- Submit and Validation Logic ---
  const handleSubmitCode = () => {
    if (enteredSequence.length === 0) {
      setCodeMsg(' Enter a sequence before submitting.');
      return;
    }
    
    // Check if the entered sequence matches the required sequence
    const sequenceMatch = requiredSequence.every((target, index) => target === enteredSequence[index]);
    
    // And check if the length is correct
    const lengthMatch = enteredSequence.length === requiredSequence.length;

    if (sequenceMatch && lengthMatch) {
      onSequenceComplete();
    } else {
      setCodeMsg(`Incorrect Code... Resetting`);
      
      // Reset the state after failure
      setEnteredSequence([]);
      setSnappedDegrees(0);
      setCurrentValue(12);
    }
  };
  
  const handleResetCode = () => {
    setEnteredSequence([]);
    setSnappedDegrees(0);
    setCurrentValue(12);
    setCodeMsg('Sequence cleared.');
  }

  // Render clock numbers
  const clockNumbers = Array.from({ length: NUMBERS }, (_, i) => i + 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* 1. Clock Dial and Indicator (Visually placed high) */}
        <div 
            ref={dialRef}
            onPointerDown={handlePointerDown}
            style={{
                // Set CSS variable for runtime rotation update
                '--rotation-degrees': `${snappedDegrees}deg`,
                
                width: DIAL_SIZE,
                height: DIAL_SIZE,
                borderRadius: "50%",
                background: "#6b4f2c",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                position: "relative",
                cursor: isDragging ? "grabbing" : "grab",
                boxShadow: "0 8px 20px rgba(0,0,0,0.7)",
                border: "6px solid #8b6539",
                
                // Use the CSS variable for transformation
                transform: 'rotate(var(--rotation-degrees))',
                
                // *** CHANGE APPLIED HERE ***
                // Initial transition for snapping now uses the smoother cubic-bezier.
                transition: "transform 150ms cubic-bezier(0.2, 0.8, 0.2, 1)", 
            }}
        >
            {/* Clock Numbers */}
            {clockNumbers.map(num => {
                const angle = clockToDegrees(num);
                const radius = DIAL_SIZE / 2 * 0.8;
                const x = radius * Math.sin(angle * Math.PI / 180);
                const y = -radius * Math.cos(angle * Math.PI / 180);
                
                return (
                    <div
                        key={num}
                        className="clock-number" 
                        style={{
                            // *** CHANGE APPLIED HERE ***
                            // Removed unused '--inverse-rotation' variable. The transform below works correctly.

                            position: 'absolute',
                            left: `calc(50% + ${x}px - 10px)`,
                            top: `calc(50% + ${y}px - 10px)`,
                            width: 20,
                            height: 20,
                            textAlign: 'center',
                            fontSize: 16,
                            color: 'white',
                            fontWeight: 700,
                            // This transform uses the parent's CSS variable to keep numbers upright
                            transform: 'rotate(calc(-1 * var(--rotation-degrees)))', 
                            userSelect: 'none',
                        }}
                    >
                        {num}
                    </div>
                );
            })}
            
            {/* Center Pin */}
            <div style={{ position: 'absolute', width: 10, height: 10, borderRadius: '50%', background: '#4f3c25', zIndex: 10 }}></div>
            
        </div>
        
        {/* Indicator */}
        <div style={{ position: 'relative', width: DIAL_SIZE, height: 0, marginTop: -DIAL_SIZE * 0.9 }}>
            <div style={{ 
                position: 'absolute', 
                top: 0, 
                left: '50%', 
                transform: 'translate(-50%, -100%)',
                width: 0, 
                height: 0, 
                borderLeft: '10px solid transparent',
                borderRight: '10px solid transparent',
                borderBottom: '15px solid red', // Pointer
            }}></div>
        </div>
        
        <div style={{ marginTop: 30, fontSize: 24, color: 'white' }}>
            Dial Value: <span style={{ fontWeight: 700 }}>{currentValue}</span>
        </div>

        {/* 2. Entered Sequence Display */}
        <div style={{ marginTop: 140, fontSize: 18, color: '#b4aeaeff', minHeight: 25 }}>
            
            <span style={{ fontWeight: 500, color: 'white', marginLeft: 8 }}>
              {enteredSequence.join(' - ')}
            </span>
        </div>

        {/* 3. Submit/Reset Buttons (Now correctly positioned below sequence) */}
        <div style={{ marginTop: 20 }}>
          <button 
            onClick={handleSubmitCode}
            style={{ padding: '10px 20px', background: '#518908ff', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', marginRight: 10 }}
            disabled={enteredSequence.length === 0}
          >
            Submit Code
          </button>
          <button 
            onClick={handleResetCode}
            style={{ padding: '10px 20px', background: '#9f3633ff', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}
          >
            Reset
          </button>
        </div>
    </div>
  );
};


// =================================================================
// Main Letter Component (with original Puzzle/Decode stages)
// =================================================================
export default function Letter({ config, onComplete, session, sessionApi }) {
  const containerRef = useRef(null);
  const [isBroken, setIsBroken] = useState(true);
  const [message, setMessage] = useState("");
  const [stage, setStage] = useState("puzzle"); // Start on puzzle
  const completionHandledRef = useRef(false);
  
  const [boardW, setBoardW] = useState(1000);
  const [boardH, setBoardH] = useState(680);

  const COLS = 8;
  const ROWS = 6;
  const [pieces, setPieces] = useState([]);
  const draggingRef = useRef(null);

  // ---------------- Helper: Board rect ----------------
  const getBoardRect = () => {
    const winW = window.innerWidth;
    const winH = window.innerHeight;
    const left = Math.max(20, Math.round((winW - boardW) / 2));
    const top = Math.max(20, Math.round((winH - boardH) / 2));
    return { left, top, width: boardW, height: boardH };
  };

  // ---------------- Load image & compute board ----------------
  useEffect(() => {
    const img = new Image();
    img.src = letterSrc;
    img.onload = () => {
      const aspect = img.naturalWidth / img.naturalHeight;
      const maxW = Math.min(0.9 * window.innerWidth, 1400);
      const maxH = 0.85 * window.innerHeight;
      let computedW = maxW;
      let computedH = computedW / aspect;
      if (computedH > maxH) {
        computedH = maxH;
        computedW = computedH * aspect;
      }
      setBoardW(Math.round(computedW));
      setBoardH(Math.round(computedH));
    };
  }, []);

  // ---------------- Puzzle Pieces ----------------
  const generatePieces = () => {
    const board = getBoardRect();
    const pieceW = boardW / COLS;
    const pieceH = boardH / ROWS;

    const newPieces = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const id = `${r}-${c}`;
        const side = Math.random() < 0.5 ? "left" : "right";
        const margin = 20;
        const leftRangeMin = margin;
        const leftRangeMax = Math.max(margin, board.left - pieceW - 40);
        const rightRangeMin = Math.min(
          window.innerWidth - pieceW - margin,
          board.left + board.width + 40
        );
        const rightRangeMax = window.innerWidth - pieceW - margin;

        const posX =
          side === "left"
            ? Math.round(
                Math.random() * Math.max(0, leftRangeMax - leftRangeMin) +
                  leftRangeMin
              )
            : Math.round(
                Math.random() * Math.max(0, rightRangeMax - rightRangeMin) +
                  rightRangeMin
              );

        const posY = Math.round(
          Math.random() * Math.max(0, window.innerHeight - pieceH - margin) +
            margin
        );
        const rot = Math.round((Math.random() - 0.5) * 40);

        newPieces.push({ id, row: r, col: c, posX, posY, rot, placed: false });
      }
    }
    setPieces(newPieces);
    setMessage("");
  };

  useEffect(() => {
    generatePieces();
  }, [boardW, boardH]);

  // Auto-fail when backend timer expires
  useEffect(() => {
    if (!session || session.completed || completionHandledRef.current) return;
    if (session.remainingSeconds === 0) {
      setMessage('TIME EXPIRED');
      setStage('expired');
      completionHandledRef.current = true;
      
      (async () => {
        try {
          await sessionApi.completeSession();
          console.log('M8: Timer expired - session completed on backend');
          if (onComplete) onComplete(false);
        } catch (err) {
          console.error('M8: Failed to complete session on timer expiry:', err);
          if (onComplete) onComplete(false);
        }
      })();
    }
  }, [session, sessionApi, onComplete]);

  // ---------------- Dragging logic ----------------
  useEffect(() => {
    const onPointerMove = (e) => {
      if (!draggingRef.current) return;
      const { id, offsetX, offsetY } = draggingRef.current;
      const x = e.clientX - offsetX;
      const y = e.clientY - offsetY;
      setPieces((prev) =>
        prev.map((p) => (p.id === id ? { ...p, posX: x, posY: y } : p))
      );
    };

    const onPointerUp = () => {
      if (!draggingRef.current) return;
      const { id } = draggingRef.current;
      const board = getBoardRect();
      const pieceW = boardW / COLS;
      const pieceH = boardH / ROWS;
      setPieces((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p;
          const targetX = Math.round(board.left + p.col * pieceW);
          const targetY = Math.round(board.top + p.row * pieceH);
          const dx = Math.abs(p.posX - targetX);
          const dy = Math.abs(p.posY - targetY);
          const SNAP = Math.max(18, Math.min(pieceW / 4, 40));
          if (dx < SNAP && dy < SNAP) {
            return { ...p, posX: targetX, posY: targetY, rot: 0, placed: true };
          }
          return { ...p, placed: false };
        })
      );
      draggingRef.current = null;
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [boardW, boardH]);

  const handlePointerDown = (e, id) => {
    e.preventDefault();
    const piece = pieces.find((p) => p.id === id);
    if (!piece) return;
    const offsetX = e.clientX - piece.posX;
    const offsetY = e.clientY - piece.posY;
    draggingRef.current = { id, offsetX, offsetY };
    setPieces((prev) => {
      const others = prev.filter((p) => p.id !== id);
      const target = prev.find((p) => p.id === id);
      return [...others, target];
    });
  };

  const handleSubmit = () => {
    const board = getBoardRect();
    const pieceW = boardW / COLS;
    const pieceH = boardH / ROWS;
    let correct = 0;
    pieces.forEach((p) => {
      const targetX = Math.round(board.left + p.col * pieceW);
      const targetY = Math.round(board.top + p.row * pieceH);
      if (Math.abs(p.posX - targetX) < 6 && Math.abs(p.posY - targetY) < 6)
        correct++;
    });

    if (correct === pieces.length) {
      setMessage("The letter is restored ✉️");
      setIsBroken(false);
        // *** CHANGE APPLIED HERE ***
      setTimeout(() => setStage("decode"), 500); // Automatically advance to the decode stage
    } else {
      setMessage(`Not correct yet — ${correct}/${pieces.length} pieces placed.`);
    }
  };

  // ---------------- Decode Stage ----------------
  const codedText = `DSVM GSV XOLXP HGIRPVH GSIVV
NVVG NV ZG GSV YZHVNVMG
DV DLFOW SZEV VCZXGOB ULFI
SLFIH GL GVHG GSV VCKVIRNVMG
ZH RNNVWRZGVOB ZUGVI GSZG DV
MVVW GL IFHS GL GSV ZUGVI KZIGB
GSZG DROO TL LM GROO NRWMRTSG`;

  const answerText = `WHEN THE CLOCK STRIKES THREE
MEET ME AT THE BASEMENT
WE WOULD HAVE EXACTLY FOUR
HOURS TO TEST THE EXPERIMENT
AS IMMEDIATELY AFTER THAT WE
NEED TO RUSH TO THE AFTER PARTY
THAT WILL GO ON TILL MIDNIGHT`;

  const vowels = ["A", "E", "I", "O", "U"];
  const [userInput, setUserInput] = useState(
    answerText.split("").map((ch) =>
      vowels.includes(ch.toUpperCase()) ? ch.toUpperCase() : ""
    )
  );
  const [decodeMsg, setDecodeMsg] = useState("");
  const [highlightedIdxs, setHighlightedIdxs] = useState([]);

  const handleInputFocus = (i) => {
    const targetChar = codedText[i].toUpperCase();
    if (!/[A-Z]/.test(targetChar)) {
      setHighlightedIdxs([]);
      return;
    }
    const indexes = codedText
      .split("")
      .map((ch, idx) => (ch.toUpperCase() === targetChar ? idx : -1))
      .filter((idx) => idx !== -1);
    setHighlightedIdxs(indexes);
  };

  const handleInputChange = (i, val) => {
    setUserInput((prev) => {
      const copy = [...prev];
      const targetChar = codedText[i].toUpperCase();
      copy.forEach((_, idx) => {
        if (codedText[idx].toUpperCase() === targetChar) {
          copy[idx] = val.toUpperCase();
        }
      });
      return copy;
    });
  };

  const handleDecodeSubmit = () => {
    const built = userInput
      .map((char, idx) => {
        const ansChar = answerText[idx];
        if (ansChar === " " || ansChar === "\n") return ansChar;
        return char || "";
      })
      .join("");
    if (built.toUpperCase() === answerText.toUpperCase()) {
      setDecodeMsg("You've decoded the secret message!");
      setTimeout(() => setStage("secretCode"), 1000); // Move to secret code stage
    } else {
      setDecodeMsg(" Not correct yet");
    }
  };

  // ---------------- Secret Code Stage Logic ----------------
  const [codeMsg, setCodeMsg] = useState("");

  const handleSequenceComplete = async () => {
    if (completionHandledRef.current) return;
    completionHandledRef.current = true;
    
    setCodeMsg("You successfully cracked the code!");
    
    try {
      await sessionApi.completeSession();
      console.log('M8: Secret code cracked - session completed successfully');
      setTimeout(() => {
        if (onComplete) onComplete(true);
      }, 1500);
    } catch (err) {
      console.error('M8: Failed to complete session on success:', err);
      if (onComplete) onComplete(true);
    }
  };

  // ---------------- Render ----------------
  const boardRect = getBoardRect();
  if (stage === "decode") {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          background: "#3a2a1c",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          overflowY: "auto",
          padding: 20,
          color: "black",
          position: "relative",
        }}
      >
        {/* Timer Display */}
        <div style={{ position: 'absolute', top: 18, right: 18, zIndex: 500 }}>
          <div className="bg-slate-800/60 rounded-full px-3 py-1">
            <MinigameTimer remainingSeconds={session?.remainingSeconds ?? null} />
          </div>
        </div>
        <div
          style={{
            backgroundImage: `url(${letterbg})`,
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            width: boardW,
            height: boardH,
            position: "absolute",
            left: boardRect.left,
            top: boardRect.top,
            padding: "60px 80px",
            whiteSpace: "pre-wrap",
            fontFamily:
              "'Cinzel Decorative', 'Papyrus', 'UnifrakturCook', cursive",
            fontSize: 16,
            lineHeight: "0.8em",
            color: "#020100ff",
            textAlign: "center",
            textShadow: "0.5px 0.5px 1px rgba(0,0,0,0.4)",
          }}
        >
          {codedText.split("").map((ch, i) => {
            if (ch === "\n")
              return (
                <div key={i} style={{ height: "1.4em", width: "100%" }}>
                  {"\n"}
                </div>
              );
            if (ch === " ")
              return (
                <span key={i} style={{ display: "inline-block", width: 10 }}>
                  {" "}
                </span>
              );
            const val = userInput[i] || "";
            const correct = vowels.includes(answerText[i]?.toUpperCase());
            return (
              <span
                key={i}
                style={{ display: "inline-block", textAlign: "center", width: 20 }}
              >
                <input
                  type="text"
                  maxLength={1}
                  value={val}
                  onFocus={() => handleInputFocus(i)}
                  onChange={(e) => handleInputChange(i, e.target.value)}
                  disabled={correct}
                  style={{
                    width: 18,
                    height: 18,
                    background: "transparent",
                    border: "none",
                    borderBottom: highlightedIdxs.includes(i)
                      ? "2px solid darkblue"
                      : "1px solid black",
                    color: "black",
                    textAlign: "center",
                    outline: "none",
                    fontSize: 16,
                    marginBottom: 4,
                    fontWeight: highlightedIdxs.includes(i) ? 700 : 400,
                  }}
                />
                <br />
                {ch}
              </span>
            );
          })}
        </div>

        <div style={{ marginTop: boardRect.top + boardH + 40 }}>
          <button
            onClick={handleDecodeSubmit}
            style={{
              padding: "10px 20px",
              borderRadius: 6,
              background: "#518908ff",
              color: "white",
              cursor: "pointer",
              marginRight: 8,
            }}
          >
            Submit
          </button>
        </div>

        <div style={{ marginTop: 10 }}>{decodeMsg}</div>
      </div>
    );
  }

  if (stage === "secretCode") {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          background: "#3a2a1c",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
          fontFamily: "monospace",
          gap: '20px', // Provides spacing
          position: "relative",
        }}
      >
        {/* Timer Display */}
        <div style={{ position: 'absolute', top: 18, right: 18, zIndex: 500 }}>
          <div className="bg-slate-800/60 rounded-full px-3 py-1">
            <MinigameTimer remainingSeconds={session?.remainingSeconds ?? null} />
          </div>
        </div>
        
        <h2 style={{ fontSize: '26px' }}>Enter the 4 digit Combination</h2>
        
        <ClockDialLock 
          onSequenceComplete={handleSequenceComplete} 
          setCodeMsg={setCodeMsg}
        />

        {/* Message container is positioned below the clock area */}
        <div style={{ marginTop: 10, fontSize: 22 }}>{codeMsg}</div>
      </div>
    );
  }

  // ---------------- Puzzle Stage Render ----------------
  const pieceW = boardW / COLS;
  const pieceH = boardH / ROWS;
  const board = getBoardRect();

  return (
    <div
      ref={containerRef}
      style={{
        width: "100vw",
        height: "100vh",
        background: "#3a2a1c",
        position: "relative",
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      {/* Submit button positioned at center-bottom */}
      <div style={{ position: "absolute", bottom: 18, left: "50%", transform: "translateX(-50%)", zIndex: 500 }}>
        <button
          onClick={handleSubmit}
          style={{
            padding: "10px 24px",
            background: "#518908ff",
            color: "white",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Submit
        </button>
      </div>

      <div
        style={{
          position: "absolute",
          top: 18,
          right: 18,
          color: "white",
          zIndex: 500,
        }}
      >
        <div className="bg-slate-800/60 rounded-full px-3 py-1">
          <MinigameTimer remainingSeconds={session?.remainingSeconds ?? null} />
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div
          style={{
            position: "absolute",
            top: 60,
            right: 18,
            color: "white",
            zIndex: 500,
            background: "rgba(0,0,0,0.7)",
            padding: "8px 12px",
            borderRadius: 6,
          }}
        >
          {message}
        </div>
      )}

      <div
        style={{
          position: "absolute",
          left: board.left,
          top: board.top,
          width: board.width,
          height: board.height,
          border: "4px solid rgba(255,255,255,0.85)",
          borderRadius: 6,
          backgroundColor: "rgba(255,255,255,0.02)",
          display: "grid",
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gridTemplateRows: `repeat(${ROWS}, 1fr)`,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
          backgroundSize: `${boardW / COLS}px ${boardH / ROWS}px`,
          zIndex: 100,
        }}
      ></div>

      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
          zIndex: 400,
        }}
      >
        {pieces.map((p, idx) => {
          const style = {
            position: "absolute",
            left: p.posX,
            top: p.posY,
            width: Math.ceil(pieceW),
            height: Math.ceil(pieceH),
            backgroundImage: `url(${letterSrc})`,
            backgroundSize: `${board.width}px ${board.height}px`,
            backgroundPosition: `-${Math.round(p.col * pieceW)}px -${Math.round(
              p.row * pieceH
            )}px`,
            borderRadius: 3,
            cursor: "grab",
            transform: `rotate(${p.rot}deg)`,
            boxShadow: p.placed
              ? "0 4px 8px rgba(0,255,0,0.12)"
              : "0 6px 18px rgba(0,0,0,0.6)",
            zIndex: 100 + idx,
            transition: "transform 120ms ease, left 80ms ease, top 80ms ease",
          };
          return (
            <div
              key={p.id}
              onPointerDown={(e) => handlePointerDown(e, p.id)}
              style={style}
            />
          );
        })}
      </div>
    </div>
  );
}