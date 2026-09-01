import { useState, useEffect, useRef } from 'react';
import MinigameTimer from '../components/MinigameTimer';
import { ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react';
import { Map as MapIcon, X as CloseIcon } from 'lucide-react'; 
import choice1 from '../assets/choice1.jpg';
import choice2 from '../assets/choice2.jpg';
import choice3 from '../assets/choice3.jpg';
import deadend1 from '../assets/choice4.jpg';
import deadend2 from '../assets/choice5.jpg';
import img343 from '../assets/choice6.jpg';
import img205 from '../assets/img205.png';
import img420 from '../assets/img420.png';
import img505 from '../assets/img505.png';
import img609 from '../assets/img609.png';
import img777 from '../assets/img777.png';
import img911 from '../assets/img911.png';
import map from '../assets/map.png';

export default function MazeGame({ config, onComplete, session, sessionApi }) {
  const completionHandledRef = useRef(false);
  
  // ---------------- Maze Setup ----------------
  const nodes = {
    1: { images: choice1, connections: { up: 2 } },
    2: { images: choice3, connections: { left: 3, up: 19, right: 25 } },
    3: { images: choice3, connections: { left: 4, up: 18, right: 19 } },
    4: { images: choice2, connections: { left: 23, right: 5 } },
    5: { images: choice3, connections: { left: 6, up: 20, right: 21 } },
    6: { images: choice3, connections: { left: 7, up: 18, right: 23 } },
    7: { images: choice3, connections: { left: 19, up: 22, right: 8 } },
    8: { images: choice2, connections: { left: 22, right: 9 } },
    9: { images: choice2, connections: { left: 23, right: 10 } },
    10: { images: choice3, connections: { left: 11, up: 24, right: 19 } },
    11: { images: choice3, connections: { left: 12, up: 25, right: 24 } },
    12: { images: choice3, connections: { left: 13, up: 23, right: 20 } },
    13: { images: choice2, connections: { left: 14, right: 25 } },
    14: { images: choice3, connections: { left: 15, up: 24, right: 18 } },
    15: { images: choice2, connections: { left: 20, right: 16 } },
    16: { images: img343, connections: {} },
    17: { images: deadend2, connections: {} },
    18: { images: img420, connections: {} },
    19: { images: img205, connections: {} },
    20: { images: img609, connections: {} },
    21: { images: img911, connections: {} },
    22: { images: img777, connections: {} },
    23: { images: img505, connections: {} },
    24: { images: img911, connections: {} },
    25: { images: deadend1, connections: {} },
  };

  const deadEnds = [17, 25];
  const wrongRoom = [18, 19, 20, 21, 22, 23, 24];

  // ---------------- State ----------------
  const [currentNode, setCurrentNode] = useState(1);
  const [fadeState, setFadeState] = useState('fade-in');
  const [showMap, setShowMap] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // ---------------- Timer Effect ----------------
  // Auto-fail when backend timer expires
  useEffect(() => {
    if (!session || session.completed || completionHandledRef.current) return;
    if (session.remainingSeconds === 0 && gameStarted) {
      setGameStarted(false);
      setShowMap(true);
      completionHandledRef.current = true;
      
      (async () => {
        try {
          await sessionApi.completeSession();
          console.log('M11: Timer expired - session completed on backend');
          if (onComplete) onComplete(false);
        } catch (err) {
          console.error('M11: Failed to complete session on timer expiry:', err);
          if (onComplete) onComplete(false);
        }
      })();
    }
  }, [session, gameStarted, sessionApi, onComplete]);

  // Handle successful completion when reaching goal node 16
  useEffect(() => {
    if (currentNode === 16 && !completionHandledRef.current && gameStarted) {
      completionHandledRef.current = true;
      
      (async () => {
        try {
          await sessionApi.completeSession();
          console.log('M11: Reached goal (node 16) - session completed successfully');
          setTimeout(() => {
            if (onComplete) onComplete(true);
          }, 1500); // Give user time to see the goal image
        } catch (err) {
          console.error('M11: Failed to complete session on success:', err);
          if (onComplete) onComplete(true);
        }
      })();
    }
  }, [currentNode, gameStarted, sessionApi, onComplete]);

  // ---------------- Navigation ----------------
  const handleNavigation = (direction) => {
    const destination = nodes[currentNode].connections[direction];
    if (destination) {
      setFadeState('fade-out');
      setTimeout(() => {
        setCurrentNode(destination);
        setFadeState('fade-in');
      }, 300);
    }
  };

  const handleReset = () => {
    setCurrentNode(1);
    setFadeState('fade-in');
  };

  const availableDirections = nodes[currentNode].connections;
  const iswrongRoom = wrongRoom.includes(currentNode);
  const isDeadEnd = deadEnds.includes(currentNode);

  // ---------------- UI ----------------
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 gap-6 relative">
      {/* Timer Display */}
      {gameStarted && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-slate-800/60 rounded-full px-3 py-1">
            <MinigameTimer remainingSeconds={session?.remainingSeconds ?? null} />
          </div>
        </div>
      )}

      {!gameStarted ? (
        // Start screen
        <div className="flex flex-col items-center gap-6">
          <h1 className="text-white text-3xl font-bold">Maze Game</h1>
          <button
            onClick={() => setGameStarted(true)}
            className="bg-green-600 px-8 py-4 rounded-xl text-white font-bold text-xl hover:scale-110 active:scale-95"
          >
            Start Game
          </button>
        </div>
      ) : (
        <>
          {/* Game Area */}
          <div className="relative w-full max-w-4xl aspect-video bg-black">
            {/* Corridor Image */}
            <img
              src={nodes[currentNode].images}
              alt={`Corridor ${currentNode}`}
              className={`max-h-screen w-full object-contain transition-opacity duration-300 ${
                fadeState === 'fade-out' ? 'opacity-0' : 'opacity-100'
              }`}
            />

            {/* Navigation Arrows */}
            {!isDeadEnd && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {availableDirections.left && (
                  <button
                    onClick={() => handleNavigation('left')}
                    className="absolute left-4 pointer-events-auto bg-white/20 p-4 rounded-xl hover:scale-110 active:scale-95 border-2 border-gray-300"
                    aria-label="Go left"
                  >
                    <ChevronLeft className="w-8 h-8 text-white" />
                  </button>
                )}
                {availableDirections.right && (
                  <button
                    onClick={() => handleNavigation('right')}
                    className="absolute right-4 pointer-events-auto bg-white/20 p-4 rounded-xl hover:scale-110 active:scale-95 border-2 border-gray-300"
                    aria-label="Go right"
                  >
                    <ChevronRight className="w-8 h-8 text-white" />
                  </button>
                )}
                {availableDirections.up && (
                  <button
                    onClick={() => handleNavigation('up')}
                    className="absolute bottom-4 pointer-events-auto bg-white/20 p-4 rounded-xl hover:scale-110 active:scale-95 border-2 border-gray-300"
                    aria-label="Go up"
                  >
                    <ChevronUp className="w-8 h-8 text-white" />
                  </button>
                )}
              </div>
            )}

            {/* Dead End Message */}
            {isDeadEnd && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
                <div className="bg-white/20 px-6 py-4 rounded-xl border-2 border-gray-300 flex items-center gap-4">
                  <p className="text-gray-300 font-bold text-lg">Dead end!</p>
                  <button
                    onClick={handleReset}
                    className="bg-white/20 px-5 py-2 rounded-lg hover:scale-105 active:scale-95 border-2 border-white-300"
                  >
                    <span className="text-white font-bold">Reset</span>
                  </button>
                </div>
              </div>
            )}

            {/* Wrong Room Message */}
            {iswrongRoom && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
                <div className="bg-white/20 px-6 py-4 rounded-xl border-2 border-gray-300 flex items-center gap-4">
                  <p className="text-gray-300 font-bold text-lg">Wrong room!</p>
                  <button
                    onClick={handleReset}
                    className="bg-white/20 px-5 py-2 rounded-lg hover:scale-105 active:scale-95 border-2 border-white-300"
                  >
                    <span className="text-white font-bold">Reset</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar with Map Button */}
          <div className="flex flex-col items-center gap-4">
            {/* Map Button */}
            <button
              onClick={() => setShowMap(true)}
              className="bg-white/20 p-4 rounded-xl hover:scale-110 active:scale-95 border-2 border-gray-300"
            >
              <MapIcon className="w-8 h-8 text-white" />
            </button>
          </div>

          {/* Map Overlay */}
          {showMap && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
              <div className="relative max-w-3xl w-full">
                <img src={map} alt="Map" className="w-full h-auto rounded-lg" />
                {/* Close Button */}
                <button
                  onClick={() => setShowMap(false)}
                  className="absolute top-4 right-4 bg-white/30 p-2 rounded-full hover:scale-110"
                >
                  <CloseIcon className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}