import { useState, useEffect, useRef } from 'react';
import { Check } from 'lucide-react';
import MinigameTimer from '../components/MinigameTimer';

export default function MusicArcade({ config, onComplete, session, sessionApi }) {
  const [gameStarted, setGameStarted] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [currentTime, setCurrentTime] = useState(0);
  const [draggedWire, setDraggedWire] = useState(null);
  const [connections, setConnections] = useState({});
  const [completedInstructions, setCompletedInstructions] = useState({});
  const completionHandledRef = useRef(false);

  const instructions = [
    { id: 1, start: 10, end: 20, items: ['1', 'volume', 'record'], speaker: 'left', label: '1 + volume + record' },
    { id: 2, start: 15, end: 25, items: ['2', '3', 'fade'], speaker: 'right', label: '2 + 3 + fade' },
    { id: 3, start: 20, end: 30, items: ['4', 'pitch', 'record'], speaker: 'left', label: '4 + pitch + record' },
    { id: 4, start: 25, end: 35, items: ['1', '2', 'volume'], speaker: 'right', label: '1 + 2 + volume' },
    { id: 5, start: 30, end: 40, items: ['base', '3', 'pitch'], speaker: 'left', label: 'base + 3 + pitch' },
    { id: 6, start: 35, end: 45, items: ['pitch', '4', 'fade'], speaker: 'right', label: 'pitch + 4 + fade' },
    { id: 7, start: 40, end: 50, items: ['3', 'record', 'volume'], speaker: 'left', label: '3 + record + volume' },
    { id: 8, start: 45, end: 55, items: ['1', 'base', 'record'], speaker: 'right', label: '1 + base + record' },
    { id: 9, start: 50, end: 60, items: ['2', 'pitch', 'volume'], speaker: 'left', label: '2 + pitch + volume' },
    { id: 10, start: 55, end: 65, items: ['4', 'fade', 'base'], speaker: 'right', label: '4 + fade + base' }
  ];

  const wires = [
    { id: 1, color: '#8B4513' },
    { id: 2, color: '#8B4513' },
    { id: 3, color: '#8B4513' }
  ];

  const buttonSpaces = [
    ['1', '2', '3', '4'],
    ['base', 'volume', 'pitch'],
    ['fade', 'record']
  ];

  useEffect(() => {
    if (!gameStarted && countdown > 0) {
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setGameStarted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(countdownInterval);
    }

    if (gameStarted) {
      const interval = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 0.1;
          if (newTime >= 60) {
            clearInterval(interval);
            return 60;
          }
          return newTime;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [gameStarted, countdown]);

  useEffect(() => {
    const activeInstructions = instructions.filter(
      inst => currentTime >= inst.start && currentTime <= inst.end
    );

    activeInstructions.forEach(inst => {
      if (!completedInstructions[inst.id]) {
        const connectedButtons = Object.values(connections);
        const normalizedInstructionItems = inst.items.slice();
        
        const hasExactMatch = 
          connectedButtons.length === normalizedInstructionItems.length &&
          normalizedInstructionItems.every(item => connectedButtons.includes(item)) &&
          connectedButtons.every(button => normalizedInstructionItems.includes(button));

        if (hasExactMatch) {
          setCompletedInstructions(prev => ({
            ...prev,
            [inst.id]: true
          }));
        }
      }
    });
  }, [currentTime, connections]);

  // Handle successful completion when all instructions are completed
  useEffect(() => {
    const totalCompleted = Object.keys(completedInstructions).length;
    if (totalCompleted === instructions.length && !completionHandledRef.current) {
      completionHandledRef.current = true;
      
      (async () => {
        try {
          await sessionApi.completeSession();
          console.log('M9B: All instructions completed - session completed successfully');
          setTimeout(() => {
            if (onComplete) onComplete(true);
          }, 1500); // Give user time to see completion
        } catch (err) {
          console.error('M9B: Failed to complete session on success:', err);
          if (onComplete) onComplete(true);
        }
      })();
    }
  }, [completedInstructions, sessionApi, onComplete]);

  // Auto-fail when backend timer expires
  useEffect(() => {
    if (!session || session.completed || completionHandledRef.current) return;
    if (session.remainingSeconds === 0) {
      setGameStarted(false);
      setCurrentTime(60);
      completionHandledRef.current = true;
      
      (async () => {
        try {
          await sessionApi.completeSession();
          console.log('M9B: Timer expired - session completed on backend');
          if (onComplete) onComplete(false);
        } catch (err) {
          console.error('M9B: Failed to complete session on timer expiry:', err);
          if (onComplete) onComplete(false);
        }
      })();
    }
  }, [session, sessionApi, onComplete]);

  const getActiveInstructions = () => {
    return instructions.filter(
      inst => currentTime >= inst.start && currentTime <= inst.end
    );
  };

  const activeInstructions = getActiveInstructions();
  const leftInstructions = activeInstructions.filter(inst => inst.speaker === 'left');
  const rightInstructions = activeInstructions.filter(inst => inst.speaker === 'right');

  const handleDragStart = (wireId, e) => {
    setDraggedWire(wireId);
    if (connections[wireId]) {
      e.dataTransfer.effectAllowed = 'move';
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (buttonName) => {
    if (draggedWire !== null) {
      setConnections(prev => ({
        ...prev,
        [draggedWire]: buttonName
      }));
      setDraggedWire(null);
    }
  };

  const handleButtonDragStart = (buttonName, e) => {
    const wireId = Object.keys(connections).find(key => connections[key] === buttonName);
    if (wireId) {
      setDraggedWire(parseInt(wireId));
      e.dataTransfer.effectAllowed = 'move';
    } else {
      e.preventDefault();
    }
  };

  const handleWireClick = (wireId) => {
    if (connections[wireId]) {
      setConnections(prev => {
        const newConnections = { ...prev };
        delete newConnections[wireId];
        return newConnections;
      });
    }
  };

  const handleButtonClick = (buttonName) => {
    const wireId = Object.keys(connections).find(key => connections[key] === buttonName);
    if (wireId) {
      setConnections(prev => {
        const newConnections = { ...prev };
        delete newConnections[wireId];
        return newConnections;
      });
    }
  };

  const isButtonActive = (buttonName) => {
    return Object.values(connections).includes(buttonName);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 via-yellow-50 to-orange-100 p-8 flex flex-col items-center justify-center relative">
      {/* Timer Display */}
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-slate-800/60 rounded-full px-3 py-1">
          <MinigameTimer remainingSeconds={session?.remainingSeconds ?? null} />
        </div>
      </div>
      
      <h1 className="text-5xl font-bold text-amber-900 mb-8 tracking-wider" style={{ fontFamily: 'serif', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>MUSIC ARCADE</h1>
      
      {!gameStarted && countdown > 0 ? (
        <div className="flex flex-col items-center justify-center gap-8">
          <div className="text-amber-900 text-2xl font-semibold">Get Ready!</div>
          <div className="text-9xl font-bold text-amber-600 animate-pulse">
            {countdown}
          </div>
          <div className="text-amber-900 text-lg">Game starting soon...</div>
        </div>
      ) : (
        <>
          <div className="flex items-start gap-8 mb-8">
            <div className="flex flex-col items-center">
              <div className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-6 shadow-2xl border-4 border-gray-800 w-64 h-80 relative" style={{ 
                backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 100%)',
                boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5), 0 10px 30px rgba(0,0,0,0.4)'
              }}>
                <div className="absolute top-3 left-1/2 -translate-x-1/2 text-gray-300 text-sm font-bold tracking-widest" style={{ fontFamily: 'monospace' }}>
                  CHANNEL L
                </div>

                {/* High Frequency Driver */}
                <div className="absolute top-14 left-1/2 -translate-x-1/2 w-12 h-12 bg-gray-800 rounded border-2 border-gray-600" style={{
                  boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.7), 0 1px 3px rgba(255,255,255,0.1)'
                }}>
                  {/* Horn */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-gray-700 rounded border border-gray-500" style={{
                    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.8)'
                  }}></div>
                </div>

                {/* Mid Range Driver */}
                <div className="absolute top-28 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full border-3 border-gray-600" style={{
                  background: 'linear-gradient(135deg, #374151, #1f2937)',
                  boxShadow: 'inset 0 3px 10px rgba(0,0,0,0.8), 0 2px 5px rgba(255,255,255,0.1)'
                }}>
                  {/* Driver Cone */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full border-2 border-gray-500" style={{
                    background: 'conic-gradient(from 0deg, #6b7280, #4b5563, #374151, #6b7280)',
                    boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.6)'
                  }}>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gray-400 rounded-full border border-gray-300" style={{
                      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5)'
                    }}></div>
                  </div>
                </div>

                {/* Bass Woofer */}
                <div className="absolute top-44 left-1/2 -translate-x-1/2 w-28 h-28 rounded-full border-4 border-gray-700" style={{
                  background: 'radial-gradient(circle at 30% 30%, #4b5563, #1f2937, #111827)',
                  boxShadow: 'inset 0 4px 15px rgba(0,0,0,0.9), 0 3px 8px rgba(255,255,255,0.1)'
                }}>
                  {/* Woofer Surround */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-2 border-gray-600" style={{
                    background: 'conic-gradient(from 45deg, #6b7280, #4b5563, #374151, #6b7280)',
                    boxShadow: 'inset 0 3px 10px rgba(0,0,0,0.7)'
                  }}>
                    {/* Center Cap */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-gray-500 rounded-full border border-gray-400" style={{
                      boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.6), 0 1px 2px rgba(255,255,255,0.2)'
                    }}></div>
                  </div>
                </div>

                {/* Active Instructions Display */}
                <div className="absolute bottom-16 left-2 right-2 min-h-[60px]">
                  {leftInstructions.map((inst, idx) => (
                    <div key={`${inst.start}-${idx}`} className="bg-orange-900 bg-opacity-60 rounded p-1 border border-orange-600 mb-1">
                      <div className="flex gap-1 justify-center flex-wrap">
                        {inst.items.map((item, i) => (
                          <span key={i} className="bg-orange-400 text-black px-1 py-0.5 rounded text-xs font-bold">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-gray-300 text-xs font-bold z-10 tracking-wide" style={{ fontFamily: 'monospace' }}>
                  OUTPUT
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-6">
              <div className="bg-gradient-to-br from-stone-800 to-stone-900 rounded-lg p-8 shadow-2xl border-4 border-stone-950" style={{
                boxShadow: 'inset 0 2px 15px rgba(0,0,0,0.6), 0 10px 40px rgba(0,0,0,0.5)'
              }}>
                <div className="flex flex-col gap-4">
                  {buttonSpaces.map((row, rowIdx) => (
                    <div key={rowIdx} className="flex gap-4 justify-center">
                      {row.map((button) => (
                        <div
                          key={button}
                          draggable={isButtonActive(button)}
                          onDragStart={(e) => handleButtonDragStart(button, e)}
                          onDragOver={handleDragOver}
                          onDrop={() => handleDrop(button)}
                          onClick={() => handleButtonClick(button)}
                          className={`w-20 h-20 rounded-full border-4 flex items-center justify-center text-xs font-bold transition-all ${
                            isButtonActive(button)
                              ? 'bg-amber-400 border-amber-600 text-black shadow-lg cursor-grab'
                              : 'bg-stone-700 border-stone-900 text-stone-400 cursor-pointer shadow-inner'
                          }`}
                          style={{
                            boxShadow: isButtonActive(button) 
                              ? '0 0 20px rgba(251, 191, 36, 0.6), inset 0 2px 5px rgba(0,0,0,0.3)'
                              : 'inset 0 3px 8px rgba(0,0,0,0.6)',
                            fontFamily: 'monospace'
                          }}
                        >
                          {button}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 justify-center flex-wrap">
                {wires.map((wire) => (
                  <div
                    key={wire.id}
                    draggable
                    onDragStart={(e) => handleDragStart(wire.id, e)}
                    onClick={() => handleWireClick(wire.id)}
                    className="cursor-grab active:cursor-grabbing"
                  >
                    <div
                      className="w-14 h-14 rounded-full border-4 shadow-lg hover:scale-110 transition-transform"
                      style={{ 
                        backgroundColor: wire.color,
                        borderColor: '#1c1917',
                        opacity: connections[wire.id] ? 0.5 : 1,
                        boxShadow: connections[wire.id] 
                          ? 'inset 0 2px 8px rgba(0,0,0,0.6)' 
                          : '0 4px 12px rgba(0,0,0,0.4), inset 0 1px 3px rgba(255,255,255,0.3)'
                      }}
                    >
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-br from-stone-800 to-stone-900 rounded-lg p-4 shadow-2xl border-4 border-stone-950 w-full max-w-xl" style={{
                boxShadow: 'inset 0 2px 15px rgba(0,0,0,0.6), 0 10px 40px rgba(0,0,0,0.5)'
              }}>
                <h2 className="text-xl font-bold text-amber-400 mb-3 text-center tracking-widest" style={{ fontFamily: 'monospace' }}>MISSION LOG</h2>
                <div className="grid grid-cols-2 gap-2">
                  {instructions.map((inst) => (
                    <div
                      key={inst.id}
                      className={`flex items-center gap-2 p-2 rounded transition-all border-2 ${
                        completedInstructions[inst.id]
                          ? 'bg-green-900 bg-opacity-40 border-green-600'
                          : 'bg-stone-900 border-stone-700'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                        completedInstructions[inst.id]
                          ? 'bg-green-600 border-green-500'
                          : 'bg-stone-800 border-stone-600'
                      }`}>
                        {completedInstructions[inst.id] && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`text-xs ${
                        completedInstructions[inst.id] ? 'text-green-300 font-semibold' : 'text-stone-400'
                      }`} style={{ fontFamily: 'monospace' }}>
                        case {inst.id}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-center">
                  <span className="text-amber-400 font-bold text-base" style={{ fontFamily: 'monospace' }}>
                    {Object.keys(completedInstructions).length} / {instructions.length}
                  </span>
                  <span className="text-stone-400 text-xs ml-2" style={{ fontFamily: 'monospace' }}>COMPLETED</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-6 shadow-2xl border-4 border-gray-800 w-64 h-80 relative" style={{ 
                backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 100%)',
                boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5), 0 10px 30px rgba(0,0,0,0.4)'
              }}>
                <div className="absolute top-3 left-1/2 -translate-x-1/2 text-gray-300 text-sm font-bold tracking-widest" style={{ fontFamily: 'monospace' }}>
                  CHANNEL R
                </div>

                {/* High Frequency Driver */}
                <div className="absolute top-14 left-1/2 -translate-x-1/2 w-12 h-12 bg-gray-800 rounded border-2 border-gray-600" style={{
                  boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.7), 0 1px 3px rgba(255,255,255,0.1)'
                }}>
                  {/* Horn */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-gray-700 rounded border border-gray-500" style={{
                    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.8)'
                  }}></div>
                </div>

                {/* Mid Range Driver */}
                <div className="absolute top-28 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full border-3 border-gray-600" style={{
                  background: 'linear-gradient(135deg, #374151, #1f2937)',
                  boxShadow: 'inset 0 3px 10px rgba(0,0,0,0.8), 0 2px 5px rgba(255,255,255,0.1)'
                }}>
                  {/* Driver Cone */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full border-2 border-gray-500" style={{
                    background: 'conic-gradient(from 0deg, #6b7280, #4b5563, #374151, #6b7280)',
                    boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.6)'
                  }}>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gray-400 rounded-full border border-gray-300" style={{
                      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5)'
                    }}></div>
                  </div>
                </div>

                {/* Bass Woofer */}
                <div className="absolute top-44 left-1/2 -translate-x-1/2 w-28 h-28 rounded-full border-4 border-gray-700" style={{
                  background: 'radial-gradient(circle at 30% 30%, #4b5563, #1f2937, #111827)',
                  boxShadow: 'inset 0 4px 15px rgba(0,0,0,0.9), 0 3px 8px rgba(255,255,255,0.1)'
                }}>
                  {/* Woofer Surround */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-2 border-gray-600" style={{
                    background: 'conic-gradient(from 45deg, #6b7280, #4b5563, #374151, #6b7280)',
                    boxShadow: 'inset 0 3px 10px rgba(0,0,0,0.7)'
                  }}>
                    {/* Center Cap */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-gray-500 rounded-full border border-gray-400" style={{
                      boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.6), 0 1px 2px rgba(255,255,255,0.2)'
                    }}></div>
                  </div>
                </div>

                {/* Active Instructions Display */}
                <div className="absolute bottom-16 left-2 right-2 min-h-[60px]">
                  {rightInstructions.map((inst, idx) => (
                    <div key={`${inst.start}-${idx}`} className="bg-orange-900 bg-opacity-60 rounded p-1 border border-orange-600 mb-1">
                      <div className="flex gap-1 justify-center flex-wrap">
                        {inst.items.map((item, i) => (
                          <span key={i} className="bg-orange-400 text-black px-1 py-0.5 rounded text-xs font-bold">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-gray-300 text-xs font-bold z-10 tracking-wide" style={{ fontFamily: 'monospace' }}>
                  OUTPUT
                </div>
              </div>
            </div>
          </div>

          <div className="text-amber-900 text-center mt-4 bg-amber-50 bg-opacity-80 px-6 py-3 rounded-lg border-2 border-amber-800 shadow-lg" style={{
            fontFamily: 'monospace',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.3)'
          }}>
            <p className="text-sm font-semibold">Drag patch cables to knobs or click to disconnect and reuse!</p>
          </div>
        </>
      )}
    </div>
  );
}