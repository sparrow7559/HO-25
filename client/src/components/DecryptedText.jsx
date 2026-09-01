import React, { useState, useEffect } from "react";

const DecryptedText = ({
  text,
  speed = 90,
  maxIterations = 1,
  characters = "QWERTUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm!@#$%&",
  sequential = false,
  revealDirection = "start", // "start", "end", "center"
}) => {
  const [displayText, setDisplayText] = useState("");
  const [isScrambling, setIsScrambling] = useState(true);

  // Utility: shuffle characters randomly
  const shuffleText = (finalText, revealed) => {
    return finalText
      .split("")
      .map((ch, i) => (revealed[i] ? ch : characters[Math.floor(Math.random() * characters.length)]))
      .join("");
  };

  useEffect(() => {
    let currentIteration = 0;
    let revealed = Array(text.length).fill(false);

    if (sequential) {
      // Sequential reveal logic
      let index = 0;
      const interval = setInterval(() => {
        revealed[index] = true;
        setDisplayText(shuffleText(text, revealed));
        index++;
        if (index >= text.length) {
          clearInterval(interval);
          setIsScrambling(false);
          setDisplayText(text);
        }
      }, speed);
      return () => clearInterval(interval);
    } else {
      // Non-sequential (random shuffle first, then smooth reveal)
      const interval = setInterval(() => {
        setDisplayText(shuffleText(text, revealed));
        currentIteration++;

        if (currentIteration >= maxIterations) {
          clearInterval(interval);

          // Smooth reveal phase
          let revealIndex = 0;
          const revealInterval = setInterval(() => {
            let idx;
            if (revealDirection === "start") {
              idx = revealIndex;
            } else if (revealDirection === "end") {
              idx = text.length - 1 - revealIndex;
            } else if (revealDirection === "center") {
              const mid = Math.floor(text.length / 2);
              idx =
                revealIndex % 2 === 0
                  ? mid - Math.floor(revealIndex / 2)
                  : mid + Math.ceil(revealIndex / 2);
            }

            if (idx >= 0 && idx < text.length) {
              revealed[idx] = true;
              setDisplayText(shuffleText(text, revealed));
            }

            revealIndex++;
            if (revealIndex >= text.length) {
              clearInterval(revealInterval);
              setIsScrambling(false);
              setDisplayText(text);
            }
          }, speed / 1.5); // Adjust divisor for smoothness
        }
      }, speed);

      return () => clearInterval(interval);
    }
  }, [text, speed, maxIterations, characters, sequential, revealDirection]);

  return <span>{displayText}</span>;
};

export default DecryptedText;
