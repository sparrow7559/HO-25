import { useState, useRef, useEffect } from 'react';
import MinigameTimer from '../components/MinigameTimer';

function App({ config, onComplete, session, sessionApi }) {
  const numbers = [7, 3, 6, 11, 14, 10, 4, 9, 12, 6, 3, 8];

  const initialLeftTokens = [
    { id: 'L3-1', value: 3, color: 'red' },
    { id: 'L3-2', value: 3, color: 'red' },
    { id: 'L3-3', value: 3, color: 'red' },
    { id: 'L3-4', value: 3, color: 'red' },
    { id: 'L3-5', value: 3, color: 'red' },
    { id: 'L4-1', value: 4, color: 'red' },
    { id: 'L4-2', value: 4, color: 'red' },
    { id: 'L4-3', value: 4, color: 'red' },
    { id: 'L4-4', value: 4, color: 'red' },
    { id: 'L4-5', value: 4, color: 'red' },
    { id: 'L4-6', value: 4, color: 'red' },
    { id: 'L4-7', value: 4, color: 'red' },
    { id: 'L4-8', value: 4, color: 'red' }
  ];

  const initialRightTokens = [
    { id: 'R6-1', value: 6, color: 'blue' },
    { id: 'R6-2', value: 6, color: 'blue' },
    { id: 'R6-3', value: 6, color: 'blue' },
    { id: 'R6-4', value: 6, color: 'blue' },
    { id: 'R6-5', value: 6, color: 'blue' },
    { id: 'R8-1', value: 8, color: 'blue' },
    { id: 'R8-2', value: 8, color: 'blue' }
  ];

  const [leftTokens, setLeftTokens] = useState(initialLeftTokens);
  const [rightTokens, setRightTokens] = useState(initialRightTokens);
  const [numberStacks, setNumberStacks] = useState({});
  const [draggedToken, setDraggedToken] = useState(null);
  const [showWinner, setShowWinner] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);

  const alreadyEnded = useRef(false);

  const handleDragStart = (token, source) => {
    if (gameEnded || alreadyEnded.current) return;
    setDraggedToken({ ...token, source });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, numberIndex) => {
    e.preventDefault();
    if (!draggedToken || gameEnded || alreadyEnded.current) return;

    const currentStack = numberStacks[numberIndex] || [];
    const newStack = [...currentStack, draggedToken];

    setNumberStacks({
      ...numberStacks,
      [numberIndex]: newStack
    });

    if (draggedToken.source === 'left') {
      setLeftTokens(leftTokens.filter(t => t.id !== draggedToken.id));
    } else {
      setRightTokens(rightTokens.filter(t => t.id !== draggedToken.id));
    }

    setDraggedToken(null);

    setTimeout(() => checkWinCondition({
      ...numberStacks,
      [numberIndex]: newStack
    }), 100);
  };

  const handleRemoveToken = (numberIndex, tokenId) => {
    if (gameEnded || alreadyEnded.current) return;
    
    const stack = numberStacks[numberIndex];
    const token = stack.find(t => t.id === tokenId);

    if (token.source === 'left') {
      setLeftTokens([...leftTokens, token]);
    } else {
      setRightTokens([...rightTokens, token]);
    }

    const newStack = stack.filter(t => t.id !== tokenId);
    const newStacks = { ...numberStacks };

    if (newStack.length === 0) {
      delete newStacks[numberIndex];
    } else {
      newStacks[numberIndex] = newStack;
    }

    setNumberStacks(newStacks);
    setShowWinner(false);
  };

  const getStackValue = (numberIndex) => {
    const stack = numberStacks[numberIndex] || [];
    return stack.reduce((sum, token) => sum + token.value, 0);
  };

  const isCorrect = (numberIndex) => {
    const stack = numberStacks[numberIndex] || [];
    if (stack.length === 0) return false;
    return getStackValue(numberIndex) === numbers[numberIndex];
  };

  const checkWinCondition = (stacks) => {
    if (gameEnded || alreadyEnded.current) return;
    
    const allCorrect = numbers.every((num, idx) => {
      const stack = stacks[idx] || [];
      if (stack.length === 0) return false;
      const stackValue = stack.reduce((sum, token) => sum + token.value, 0);
      return stackValue === num;
    });

    if (allCorrect) {
      setShowWinner(true);
      setGameEnded(true);
      alreadyEnded.current = true;
      
      // Complete session on success
      (async () => {
        try {
          await sessionApi.completeSession();
          if (onComplete) onComplete(true);
        } catch (err) {
          console.error('Failed to complete session on win:', err);
        }
      })();
    }
  };

  const TokenDisplay = ({ value, color, size = 'normal' }) => {
    const sizeClass = size === 'small' ? 'w-12 h-12' : 'w-20 h-20';
    const tokens = Array.from({ length: value }, (_, i) => {
      const angle = (360 / value) * i;
      const radius = size === 'small' ? 18 : 28;
      const x = Math.cos((angle * Math.PI) / 180) * radius;
      const y = Math.sin((angle * Math.PI) / 180) * radius;

      return (
        <div
          key={i}
          className={`absolute w-6 h-6 ${color === 'red' ? 'bg-red-400' : 'bg-blue-400'}
            rounded-full border-2 ${color === 'red' ? 'border-red-600' : 'border-blue-600'}`}
          style={{
            transform: `translate(${x}px, ${y}px)`,
            top: '50%',
            left: '50%',
            marginTop: '-12px',
            marginLeft: '-12px'
          }}
        />
      );
    });

    return (
      <div className={`${sizeClass} relative flex items-center justify-center`}>
        {tokens}
        <div className="absolute w-10 h-10 bg-gradient-to-br from-white to-gray-100
          rounded-full border-2 border-gray-300 shadow-inner z-10" />
      </div>
    );
  };

  const reset = () => {
    if (gameEnded || alreadyEnded.current) return;
    
    setLeftTokens(initialLeftTokens);
    setRightTokens(initialRightTokens);
    setNumberStacks({});
    setShowWinner(false);
  };

  // Timer expiry is handled by MinigameLoader - no need to handle it here

  const remainingSeconds = session?.remainingSeconds ?? null;
  const triesLeft = session?.triesLeft ?? null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center p-8">
      {/* Timer */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
        <MinigameTimer remainingSeconds={remainingSeconds} />
      </div>
      <div className="relative flex gap-8">
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-3xl shadow-xl p-8
          border-4 border-red-300">
          <div className="flex flex-col gap-20">
            {[3, 4].map(value => {
              const tokens = leftTokens.filter(t => t.value === value);
              if (tokens.length === 0) return null;

              return (
                <div key={`left-pile-${value}`} className="relative" style={{ height: '80px', width: '100px' }}>
                  {tokens.map((token, idx) => (
                    <div
                      key={token.id}
                      draggable={!gameEnded && !alreadyEnded.current}
                      onDragStart={() => handleDragStart(token, 'left')}
                      className={`absolute ${gameEnded ? 'cursor-default' : 'cursor-grab active:cursor-grabbing hover:scale-110'} hover:z-50 transition-transform`}
                      style={{
                        top: `${idx * 3}px`,
                        left: `${idx * 2}px`,
                        zIndex: idx
                      }}
                    >
                      <TokenDisplay value={token.value} color={token.color} />
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-100 to-blue-50 rounded-3xl shadow-2xl p-16
          border-8 border-slate-600 relative">
          <div className="absolute inset-0 rounded-2xl border-4 border-slate-400 pointer-events-none"
            style={{ margin: '20px' }} />

          <div className="relative z-10 -ml-8">
            <div className="grid grid-cols-4 gap-8">
                {numbers.map((num, idx) => {
                  const stack = numberStacks[idx] || [];
                  const correct = isCorrect(idx);

                  return (
                    <div
                      key={idx}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, idx)}
                      className={`w-28 h-28 rounded-full flex items-center justify-center text-4xl font-bold
                        transition-all duration-300 shadow-lg relative
                        ${correct
                          ? 'bg-green-300 border-4 border-green-500 scale-105'
                          : 'bg-blue-200 border-4 border-blue-400'
                        }`}
                    >
                      {stack.length > 0 ? (
                        <div className="relative w-full h-full flex items-center justify-center">
                          <div className="absolute inset-0 flex items-center justify-center">
                            {stack.map((token, tIdx) => (
                              <div
                                key={token.id}
                                onClick={() => handleRemoveToken(idx, token.id)}
                                className={`absolute ${gameEnded ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
                                style={{
                                  zIndex: tIdx,
                                  transform: `rotate(${tIdx * 15}deg)`
                                }}
                              >
                                <TokenDisplay value={token.value} color={token.color} size="small" />
                              </div>
                            ))}
                          </div>
                          <span className={`relative z-20 ${correct ? 'text-green-800' : 'text-blue-800'}`}>
                            {num}
                          </span>
                        </div>
                      ) : (
                        <span className="text-blue-800">{num}</span>
                      )}
                    </div>
                  );
                })}
              </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl shadow-xl p-8
          border-4 border-blue-300">
          <div className="flex flex-col gap-20">
            {[6, 8].map(value => {
              const tokens = rightTokens.filter(t => t.value === value);
              if (tokens.length === 0) return null;

              return (
                <div key={`right-pile-${value}`} className="relative" style={{ height: '80px', width: '100px' }}>
                  {tokens.map((token, idx) => (
                    <div
                      key={token.id}
                      draggable={!gameEnded && !alreadyEnded.current}
                      onDragStart={() => handleDragStart(token, 'right')}
                      className={`absolute ${gameEnded ? 'cursor-default' : 'cursor-grab active:cursor-grabbing hover:scale-110'} hover:z-50 transition-transform`}
                      style={{
                        top: `${idx * 3}px`,
                        left: `${idx * 2}px`,
                        zIndex: idx
                      }}
                    >
                      <TokenDisplay value={token.value} color={token.color} />
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {showWinner && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-3xl p-12 shadow-2xl text-center">
              <h1 className="text-6xl font-bold text-green-600 mb-4">Congratulations!</h1>
              <p className="text-2xl text-gray-700 mb-6">You solved all the numbers!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;