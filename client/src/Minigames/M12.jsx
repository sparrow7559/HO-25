import React, { useState, useEffect, useRef } from "react";
import MinigameTimer from "../components/MinigameTimer";
import { motion, AnimatePresence } from "framer-motion";

export default function BinaryBulbGame({ config, onComplete, session, sessionApi }) {
  const completionHandledRef = useRef(false);
  const colors = ['R', 'G', 'B', 'Y'];

  const generateScenes = () => {
    const newScenes = [];
    for (let i = 0; i < 4; i++) {
      const scene = {};
      colors.forEach(color => {
        scene[color] = Math.random() < 0.5 ? 0 : 1;
      });
      newScenes.push(scene);
    }
    return newScenes;
  };

  const calculateAnswers = (scenes) => {
    const answers = {};
    colors.forEach(color => {
      let value = 0;
      scenes.forEach((scene, idx) => {
        value += scene[color] * Math.pow(2, 3 - idx); // MSB first
      });
      answers[color] = value;
    });
    return answers;
  };

  const [scenes, setScenes] = useState([]);
  const [correctAnswers, setCorrectAnswers] = useState({});
  const [currentScene, setCurrentScene] = useState(0);
  const [showInput, setShowInput] = useState(false);
  const [inputs, setInputs] = useState({ R: "", G: "", B: "", Y: "" });
  const [result, setResult] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);

  // Generate new random sequence only once on component mount
  useEffect(() => {
    const initialScenes = generateScenes();
    setScenes(initialScenes);
    setCorrectAnswers(calculateAnswers(initialScenes));
  }, []);

  useEffect(() => {
    if (gameStarted && currentScene < scenes.length) {
      const timer = setTimeout(() => {
        setCurrentScene((prev) => prev + 1);
      }, 500);
      return () => clearTimeout(timer);
    } else if (gameStarted && currentScene === scenes.length) {
      const revealTimer = setTimeout(() => {
        setShowInput(true);
      }, 500);
      return () => clearTimeout(revealTimer);
    }
  }, [currentScene, gameStarted, scenes.length]);

  const handleChange = (e, key) => {
    setInputs({ ...inputs, [key]: e.target.value });
  };

  const handleSubmit = async () => {
    const isCorrect = colors.every(color => parseInt(inputs[color]) === correctAnswers[color]);
    setResult(isCorrect ? "🎉 Amazing! You cracked the code!" : "❌ Oops! Try to decode the lights again!");
    
    if (isCorrect && !completionHandledRef.current) {
      completionHandledRef.current = true;
      
      try {
        await sessionApi.completeSession();
        console.log('M12: Code cracked - session completed successfully');
        setTimeout(() => {
          if (onComplete) onComplete(true);
        }, 1500); // Give user time to see success message
      } catch (err) {
        console.error('M12: Failed to complete session on success:', err);
        if (onComplete) onComplete(true);
      }
    }
  };

  const handleReplay = () => {
    // Replay uses the same scenes and answers
    setCurrentScene(0);
    setShowInput(false);
    setInputs({ R: "", G: "", B: "", Y: "" });
    setResult(null);
    setGameStarted(true);
  };

  const Bulb = ({ active, color }) => (
    <motion.div
      className={`w-12 h-12 rounded-full ${active ? color : "bg-gray-400"} shadow-lg flex items-center justify-center`}
      initial={{ scale: 0.5, opacity: 0.7 }}
      animate={{ scale: active ? 1.2 : 1, opacity: active ? 1 : 0.7 }}
      transition={{ duration: 0.3 }}
    >
      {!active && <div className="w-8 h-8 rounded-full bg-gray-500 opacity-40" />}
    </motion.div>
  );

  // Auto-fail when backend timer expires
  useEffect(() => {
    if (!session || session.completed || completionHandledRef.current) return;
    if (session.remainingSeconds === 0) {
      completionHandledRef.current = true;
      
      (async () => {
        try {
          await sessionApi.completeSession();
          console.log('M12: Timer expired - session completed on backend');
          if (onComplete) onComplete(false);
        } catch (err) {
          console.error('M12: Failed to complete session on timer expiry:', err);
          if (onComplete) onComplete(false);
        }
      })();
    }
  }, [session, sessionApi, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6 relative">
      {/* Timer Display */}
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-slate-800/60 rounded-full px-3 py-1">
          <MinigameTimer remainingSeconds={session?.remainingSeconds ?? null} />
        </div>
      </div>

      <h1 className="text-3xl font-bold mb-4 text-yellow-300">💡 Binary Bulb Challenge 💡</h1>
      <p className="text-gray-300 mb-6 text-center max-w-md">
        Welcome, Code Breaker! Observe the colored bulbs as they flicker in mysterious sequences. Once the show ends, enter the hidden number behind each color (top to bottom) to unlock the secret code.
      </p>

      {!gameStarted && (
        <button
          onClick={() => setGameStarted(true)}
          className="px-6 py-3 bg-green-600 rounded-lg hover:bg-green-700 text-lg font-bold"
        >
          ▶ Start the Challenge
        </button>
      )}

      <AnimatePresence>
        {gameStarted && !showInput && currentScene > 0 && (
          <div className="flex space-x-4">
            {colors.map((key) => (
              <div key={key} className={`flex flex-col space-y-4 p-3 rounded-lg ${
                key === 'R' ? 'border-2 border-red-500' :
                key === 'G' ? 'border-2 border-green-500' :
                key === 'B' ? 'border-2 border-blue-500' : 'border-2 border-yellow-400'
              } bg-gray-800`}> 
                {scenes.slice(0, currentScene).map((scene, idx) => (
                  <Bulb key={idx} active={scene[key] === 1} color={
                    key === 'R' ? 'bg-red-500' : key === 'G' ? 'bg-green-500' : key === 'B' ? 'bg-blue-500' : 'bg-yellow-400'
                  } />
                ))}
              </div>
            ))}
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showInput && (
          <motion.div
            className="mt-8 space-y-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
              {colors.map((key) => (
                <div key={key} className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                    key === 'R' ? 'bg-red-500' : key === 'G' ? 'bg-green-500' : key === 'B' ? 'bg-blue-500' : 'bg-yellow-400'
                  }`}> 
                    <span className="text-white font-bold text-lg">{key}</span>
                  </div>
                  <input
                    type="number"
                    value={inputs[key]}
                    onChange={(e) => handleChange(e,key)}
                    placeholder="?"
                    className="w-20 p-2 bg-gray-800 border-2 border-white rounded text-white text-center text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-center space-x-4 mt-6">
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 text-lg font-bold"
              >
                Submit Code
              </button>
              <button
                onClick={handleReplay}
                className="px-6 py-2 bg-yellow-500 rounded-lg hover:bg-yellow-600 text-lg font-bold"
              >
                Replay Sequence
              </button>
            </div>
            {result && <p className="mt-4 text-lg font-bold text-center text-green-400">{result}</p>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}