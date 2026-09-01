import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MinigameTimer from '../components/MinigameTimer';
import useMinigameSession from '../lib/useMinigameSession';

// --- Pattern Definitions ---
const defaultImagePatterns = [
  { id: 'blank', url: '/images/blank.png' },
  { id: 'circle', url: '/images/circle.png' },
  { id: 'sum', url: '/images/sum.png' },
  { id: 'cross', url: '/images/cross.png' },
  { id: 'dtriangle', url: '/images/dtriangle.png' },
  { id: 'horns', url: '/images/horns.png' },
  { id: 'rectangle', url: '/images/rectangle.png' },
  { id: 'tick', url: '/images/tick.png' },
  { id: 'tie', url: '/images/tie.png' },
  { id: 'triangle', url: '/images/triangle.png' },
  { id: 'tvlines', url: '/images/tvlines.png' },
];

export default function PatternFillMinigame({ designSheet, patterns, questions, onComplete }) {
  const availablePatterns = patterns || defaultImagePatterns;
  const availablePatternIDs = availablePatterns.map(p => p.id);
  const BLANK_ID = 'blank';
  const selectablePatternIDs = availablePatternIDs.filter(id => id !== BLANK_ID);
  
  const defaultQuestions = [
    { pattern: ["circle", "_", "tvlines"], correct: ["dtriangle"] },
    { pattern: ["triangle", "_", "circle", "cross"], correct: ["tie"] },
    { pattern: ["horns", "rectangle", "_", "tick"], correct: ["tie"] },
    { pattern: ["circle", "tick", "tie", "_"], correct: ["sum"] },
    { pattern: ["triangle", "tie", "tvlines", "tie", "_", "dtriangle"], correct: ["cross"] },
  ];

  const qs = questions || defaultQuestions;
  const totalBlanks = qs.reduce((sum, q) => sum + q.correct.length, 0);

  const [userAnswers, setUserAnswers] = useState(Array(totalBlanks).fill(BLANK_ID));
  const [checked, setChecked] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showDesignSheet, setShowDesignSheet] = useState(false);

  const minigameId = 'M19';
  const { session, loading, error, remainingSeconds, triesLeft, api: sessionApi } = useMinigameSession(minigameId);
  const completionHandledRef = useRef(false);

  const OPTION_SIZE_CLASSES = 'w-28 h-28';
  const PATTERN_CONTAINER_CLASSES = `${OPTION_SIZE_CLASSES} p-0 rounded-lg border flex items-center justify-center transition-all duration-300`;

  const getPatternUrl = (id) => availablePatterns.find(p => p.id === id)?.url;

  function cyclePattern(index) {
    if (submitted || showDesignSheet) return; 

    setUserAnswers(prev => {
      const next = [...prev];
      let currentId = next[index];
      const selectableIDs = selectablePatternIDs;
      
      if (currentId === BLANK_ID) {
          next[index] = selectableIDs[0];
      } else {
          const currentIndex = selectableIDs.indexOf(currentId);
          const nextIndex = (currentIndex + 1);
          next[index] = nextIndex < selectableIDs.length ? selectableIDs[nextIndex] : BLANK_ID;
      }

      return next;
    });
    setChecked(false);
  }

  function handleSubmit() {
    if (submitted) return;
    setChecked(true);
    setSubmitted(true);
  }

  function resetGame() {
    setUserAnswers(Array(totalBlanks).fill(BLANK_ID));
    setChecked(false);
    setSubmitted(false);
  }

  const flatCorrects = qs.flatMap(q => q.correct);
  const correctnessMap = flatCorrects.map((correctId, i) => userAnswers[i] === correctId);
  const correctCount = correctnessMap.filter(Boolean).length;
  const allCorrect = correctCount === totalBlanks;

  // 🕒 TIMER EXPIRATION HANDLING — fixed version
  useEffect(() => {
    if (!session || completionHandledRef.current) return;

    if (remainingSeconds !== undefined && remainingSeconds <= 0) {
      completionHandledRef.current = true;

      console.log("⏰ Time's up — marking session as failed.");
      setSubmitted(true);
      setChecked(true);

      sessionApi
        .completeSession()
        .then(() => {
          if (typeof onComplete === "function") onComplete(false);
        })
        .catch((e) => {
          console.error("Failed to complete session on timeout:", e);
          if (typeof onComplete === "function") onComplete(false);
        });
    }
  }, [remainingSeconds, session, sessionApi, onComplete]);

  // ✅ Handle successful completion when all answers are correct
  useEffect(() => {
    if (!submitted || !allCorrect || completionHandledRef.current || !session) return;
    completionHandledRef.current = true;
    sessionApi.completeSession().then(() => {
      setTimeout(() => {
        if (typeof onComplete === 'function') onComplete(true);
      }, 300);
    }).catch((e) => {
      console.error('Failed to complete session on success:', e);
      if (typeof onComplete === 'function') onComplete(true);
    });
  }, [submitted, allCorrect, session, sessionApi, onComplete]);

  return (
    <div
      className="relative w-full min-h-screen flex flex-col items-center justify-center"
      style={{
        backgroundImage: `url('/images/m18game.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-white/60 -z-10" />

      {/* Design Sheet Toggle Button */}
      <button
        onClick={() => setShowDesignSheet(prev => !prev)}
        disabled={submitted}
        className={`fixed top-6 right-6 px-5 py-2 font-semibold rounded-lg shadow-lg transition-all duration-200 border-2 border-black ${
          showDesignSheet
            ? 'bg-rose-500 text-white hover:bg-rose-600'
            : 'bg-indigo-600 text-white hover:bg-indigo-700'
        } disabled:opacity-50`}
      >
        {showDesignSheet ? 'Hide Design Sheet' : 'View Design Sheet'}
      </button>

      <div className="relative z-10 max-w-4xl mx-auto p-4 mt-16">
        <div className="flex justify-between items-center mb-4">
          <MinigameTimer remainingSeconds={remainingSeconds} />
        </div>

        <div className={`grid gap-6 mt-4 ${showDesignSheet ? 'md:grid-cols-1' : 'md:grid-cols-3'}`}>
          {showDesignSheet ? (
            <motion.div
              key="design-sheet-visible"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="md:col-span-1 bg-white rounded-2xl shadow-lg border-2 border-gray-800 p-3"
            >
              <h3 className="font-semibold mb-2 text-gray-900">Design Sheet</h3>
              <img
                src={designSheet || "/images/mg_pattern.jpg"}
                alt="Design sheet"
                className="rounded-lg w-full object-contain border-2 border-gray-800"
              />
            </motion.div>
          ) : (
            <motion.div
              key="questions-panel-visible"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="md:col-span-3 bg-white rounded-2xl shadow-lg border-2 border-gray-800 p-4 flex flex-col gap-5"
            >
              <h3 className="font-semibold text-lg text-gray-900">Question Panel</h3>

              {qs.map((q, qIndex) => {
                let blankCounter = 0;
                return (
                  <div
                    key={qIndex}
                    className="p-3 border-2 border-gray-800 rounded-lg flex flex-wrap gap-4 items-center justify-center"
                  >
                    {q.pattern.map((symbolIdOrBlank, i) => {
                      if (symbolIdOrBlank === '_') {
                        const globalBlankIndex = qs
                          .slice(0, qIndex)
                          .reduce((sum, qq) => sum + qq.correct.length, 0) + blankCounter;

                        const userValId = userAnswers[globalBlankIndex];
                        const userValUrl = getPatternUrl(userValId);
                        blankCounter++;

                        const isBlank = userValId === BLANK_ID;
                        const neutralStyle = isBlank ? 'border-gray-700 bg-white' : 'border-gray-800';

                        return (
                          <motion.button
                            key={`blank-${qIndex}-${i}`}
                            onClick={() => cyclePattern(globalBlankIndex)}
                            whileTap={{ scale: 0.9 }}
                            disabled={submitted || showDesignSheet}
                            className={`${PATTERN_CONTAINER_CLASSES} border-2 ${neutralStyle} ${
                              submitted ? 'opacity-70 cursor-not-allowed' : ''
                            } ${showDesignSheet ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <AnimatePresence mode="wait">
                              {!isBlank && (
                                <motion.img
                                  key={userValId}
                                  src={userValUrl}
                                  alt={`Pattern ${userValId}`}
                                  className="w-full h-full object-contain"
                                  initial={{ opacity: 0, rotateY: 90 }}
                                  animate={{ opacity: 1, rotateY: 0 }}
                                  exit={{ opacity: 0, rotateY: -90 }}
                                  transition={{ duration: 0.25 }}
                                />
                              )}
                            </AnimatePresence>
                          </motion.button>
                        );
                      }

                      const fixedSymbolUrl = getPatternUrl(symbolIdOrBlank);
                      return (
                        <div
                          key={`sym-${qIndex}-${i}`}
                          className={`border-2 border-gray-800 ${PATTERN_CONTAINER_CLASSES}`}
                        >
                          <img
                            src={fixedSymbolUrl}
                            alt={`Symbol ${symbolIdOrBlank}`}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              <div className="flex gap-3 mt-2">
                <button
                  onClick={handleSubmit}
                  disabled={submitted || showDesignSheet}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg border-2 border-gray-800 hover:bg-indigo-700 disabled:opacity-50"
                >
                  Submit Answers
                </button>
                <button
                  onClick={resetGame}
                  disabled={showDesignSheet}
                  className="px-4 py-2 bg-gray-200 text-black rounded-lg border-2 border-gray-800 hover:bg-gray-300 disabled:opacity-50"
                >
                  Reset
                </button>
              </div>

              {/* ✅ Feedback Message */}
              {submitted && (
                <div
                  className={`mt-4 p-3 rounded-lg font-bold text-lg border-2 border-gray-800 ${
                    remainingSeconds <= 0
                      ? 'bg-yellow-100 text-yellow-800'
                      : allCorrect
                      ? 'bg-green-100 text-green-700'
                      : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {remainingSeconds <= 0
                    ? "Time’s up! Try again next time."
                    : allCorrect
                    ? "All Correct."
                    : "Incorrect. Keep trying."}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
