import { useState, useEffect } from 'react'
import React from 'react';
import MinigameTimer from '../components/MinigameTimer';

export default function Pravar({ config, onComplete, session, sessionApi }) {
  const COLS = 20;
  const ROWS = 17;
  const completionHandledRef = React.useRef(false);

  const crosswordStructure = [
    [false, false, false, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
    [false, false, false, true, false, false, false, false, true, true, true, true, true, true, false, false, false, false, false, false],
    [false, false, false, true, false, false, false, false, true, false, false, false, false, true, false, false, false, false, false, false],
    [false, false, false, true, false, false, false, false, true, false, false, false, false, true, false, false, false, false, false, false],
    [false, false, false, true, true, true, true, true, true, true, true, false, false, true, false, false, false, false, false, false],
    [false, false, false, false, false, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
    [true, true, true, true, true, true, false, false, false, false, false, false, true, false, false, false, false, false, false, false],
    [false, false, false, false, false, true, true, true, true, true, true, true, true, false, false, false, false, false, false, false],
    [false, false, false, true, false, true, false, false, false, false, false, false, true, false, false, false, false, false, false, false],
    [false, false, true, true, true, true, true, false, false, false, false, false, true, false, false, true, true, true, true, true],
    [false, false, false, true, false, true, false, false, false, false, false, true, true, true, true, true, false, false, false, false],
    [false, false, false, true, false, false, false, false, false, false, false, false, true, false, false, true, false, false, false, false],
    [false, false, false, true, false, false, false, false, true, false, false, false, true, false, false, true, false, false, false, false],
    [false, false, false, false, false, false, false, false, true, true, true, true, true, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false]
  ];
  
  const [grid, setGrid] = useState(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
  const [draggedNumber, setDraggedNumber] = useState(null);
  const [draggedBox, setDraggedBox] = useState(null);
  const [hoverPos, setHoverPos] = useState(null);
  const [placedNumbers, setPlacedNumbers] = useState([]);

  const numberSets = [
    { box: 1, numbers: ['12213', '48212', '41172', '32764', '51332', '54221'] },
    { box: 2, numbers: ['5213174', '34522122', '32516123', '32511624'] },
    { box: 3, numbers: ['546111', '541123'] },
    { box: 4, numbers: ['5431', '3212', '5472', '2442'] }
  ];

  const [availableNumbers, setAvailableNumbers] = useState(numberSets);
  const [numberOrientations, setNumberOrientations] = useState({});
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);
  const [showLockPage, setShowLockPage] = useState(false);
  const [lockCode, setLockCode] = useState(['A', 'A', 'A', 'A', 'A']);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [showSolvedGrid, setShowSolvedGrid] = useState(false);

  const correctCode = ['F', 'A', 'C', 'E', 'D'];

  const highlightedCells = [
    { row: 1, col: 13 },
    { row: 4, col: 7 },
    { row: 8, col: 3 },
    { row: 10, col: 14 },
    { row: 14, col: 8 }
  ];

  const isHighlightedCell = (row, col) => {
    return highlightedCells.some(cell => cell.row === row && cell.col === col);
  };

  // Auto-fail when backend timer expires
  useEffect(() => {
    if (!session || session.completed || completionHandledRef.current) return;
    if (session.remainingSeconds === 0) {
      setShowLockPage(true);
      completionHandledRef.current = true;
      
      (async () => {
        try {
          await sessionApi.completeSession();
          console.log('M9A: Timer expired - session completed on backend');
          if (onComplete) onComplete(false);
        } catch (err) {
          console.error('M9A: Failed to complete session on timer expiry:', err);
          if (onComplete) onComplete(false);
        }
      })();
    }
  }, [session, sessionApi, onComplete]);

  const toggleNumberOrientation = (boxIdx, num) => {
    const key = `${boxIdx}-${num}`;
    setNumberOrientations(prev => ({
      ...prev,
      [key]: prev[key] === 'vertical' ? 'horizontal' : 'vertical'
    }));
  };

  const getNumberOrientation = (boxIdx, num) => {
    const key = `${boxIdx}-${num}`;
    return numberOrientations[key] || 'horizontal';
  };

  const handleDragStart = (num, boxIdx) => {
    setDraggedNumber(num);
    setDraggedBox(boxIdx);
  };

  const handleDragOver = (e, row, col) => {
    e.preventDefault();
    if (crosswordStructure[row][col]) {
      setHoverPos({ row, col });
    }
  };

  const canPlaceNumber = (row, col, digits, orient) => {
    if (orient === 'horizontal') {
      if (col + digits.length > COLS) return false;
      for (let i = 0; i < digits.length; i++) {
        if (!crosswordStructure[row][col + i]) return false;
        const existingDigit = grid[row][col + i];
        if (existingDigit !== null && existingDigit !== digits[i]) return false;
      }
      return true;
    } else {
      if (row + digits.length > ROWS) return false;
      for (let i = 0; i < digits.length; i++) {
        if (!crosswordStructure[row + i][col]) return false;
        const existingDigit = grid[row + i][col];
        if (existingDigit !== null && existingDigit !== digits[i]) return false;
      }
      return true;
    }
  };

  const handleDrop = (e, row, col) => {
    e.preventDefault();
    if (!draggedNumber || !crosswordStructure[row][col]) return;

    const newGrid = grid.map(r => [...r]);
    const digits = draggedNumber.split('');
    const orientation = getNumberOrientation(draggedBox, draggedNumber);

    if (!canPlaceNumber(row, col, digits, orientation)) return;

    const positions = [];
    const sharedPositions = [];

    if (orientation === 'horizontal') {
      digits.forEach((digit, idx) => {
        const currentCell = newGrid[row][col + idx];
        if (currentCell === null) {
          newGrid[row][col + idx] = digit;
          positions.push({ row, col: col + idx });
        } else if (currentCell === digit) {
          sharedPositions.push({ row, col: col + idx });
        }
      });
    } else {
      digits.forEach((digit, idx) => {
        const currentCell = newGrid[row + idx][col];
        if (currentCell === null) {
          newGrid[row + idx][col] = digit;
          positions.push({ row: row + idx, col });
        } else if (currentCell === digit) {
          sharedPositions.push({ row: row + idx, col });
        }
      });
    }

    setGrid(newGrid);
    setPlacedNumbers([...placedNumbers, { 
      number: draggedNumber, 
      positions, 
      sharedPositions,
      boxIdx: draggedBox 
    }]);
    
    setAvailableNumbers(prev => 
      prev.map((box, idx) => 
        idx === draggedBox 
          ? { ...box, numbers: box.numbers.filter(n => n !== draggedNumber) }
          : box
      )
    );

    setDraggedNumber(null);
    setDraggedBox(null);
    setHoverPos(null);
    
    checkCompletion(newGrid);
  };

  const handleNumberClick = (row, col) => {
    const placedIdx = placedNumbers.findIndex(pn => 
      pn.positions.some(pos => pos.row === row && pos.col === col) ||
      (pn.sharedPositions && pn.sharedPositions.some(pos => pos.row === row && pos.col === col))
    );

    if (placedIdx !== -1) {
      const placed = placedNumbers[placedIdx];
      const newGrid = grid.map(r => [...r]);
      
      const allPositions = [...placed.positions, ...(placed.sharedPositions || [])];
      
      allPositions.forEach(pos => {
        const isSharedByOther = placedNumbers.some((pn, idx) => 
          idx !== placedIdx && (
            pn.positions.some(p => p.row === pos.row && p.col === pos.col) ||
            (pn.sharedPositions && pn.sharedPositions.some(p => p.row === pos.row && p.col === pos.col))
          )
        );
        
        if (!isSharedByOther) {
          newGrid[pos.row][pos.col] = null;
        }
      });

      setGrid(newGrid);
      
      setAvailableNumbers(prev => 
        prev.map((box, idx) => 
          idx === placed.boxIdx
            ? { ...box, numbers: [...box.numbers, placed.number] }
            : box
        )
      );

      setPlacedNumbers(placedNumbers.filter((_, idx) => idx !== placedIdx));
    }
  };

  const getPreviewCells = (row, col) => {
    if (!draggedNumber || !hoverPos || hoverPos.row !== row || hoverPos.col !== col) return [];
    const digits = draggedNumber.split('');
    const orientation = getNumberOrientation(draggedBox, draggedNumber);
    const cells = [];
    
    if (orientation === 'horizontal' && canPlaceNumber(row, col, digits, 'horizontal')) {
      for (let i = 0; i < digits.length; i++) {
        cells.push({ row, col: col + i });
      }
    } else if (orientation === 'vertical' && canPlaceNumber(row, col, digits, 'vertical')) {
      for (let i = 0; i < digits.length; i++) {
        cells.push({ row: row + i, col });
      }
    }
    
    return cells;
  };

  const isCellInPreview = (row, col) => {
    if (!hoverPos) return false;
    const previewCells = getPreviewCells(hoverPos.row, hoverPos.col);
    return previewCells.some(cell => cell.row === row && cell.col === col);
  };

  const clearGrid = () => {
    setGrid(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
    setPlacedNumbers([]);
    setAvailableNumbers(numberSets);
    setShowCompletionPopup(false);
  };

  const checkCompletion = (newGrid) => {
    let totalActiveCells = 0;
    let filledCells = 0;
    
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        if (crosswordStructure[row][col]) {
          totalActiveCells++;
          if (newGrid[row][col] !== null) {
            filledCells++;
          }
        }
      }
    }
    
    if (totalActiveCells === filledCells && totalActiveCells > 0) {
      setShowCompletionPopup(true);
    }
  };

  const handleNextChallenge = () => {
    setShowCompletionPopup(false);
    setShowLockPage(true);
  };

  const changeLetter = (index, direction) => {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const currentIndex = letters.indexOf(lockCode[index]);
    let newIndex = currentIndex + direction;
    
    if (newIndex < 0) newIndex = letters.length - 1;
    if (newIndex >= letters.length) newIndex = 0;
    
    const newCode = [...lockCode];
    newCode[index] = letters[newIndex];
    setLockCode(newCode);
    
    if (newCode.join('') === correctCode.join('')) {
      setTimeout(() => {
        setIsUnlocked(true);
      }, 500);
    }
  };

  const tryUnlock = () => {
    if (lockCode.join('') === correctCode.join('')) {
      setIsUnlocked(true);
    } else {
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }
  };

  // Handle successful completion when lock is unlocked
  useEffect(() => {
    if (isUnlocked && !completionHandledRef.current) {
      completionHandledRef.current = true;
      
      (async () => {
        try {
          await sessionApi.completeSession();
          console.log('M9A: Lock unlocked - session completed successfully');
          setTimeout(() => {
            if (onComplete) onComplete(true);
          }, 2000); // Give user time to see success message
        } catch (err) {
          console.error('M9A: Failed to complete session on success:', err);
          if (onComplete) onComplete(true);
        }
      })();
    }
  }, [isUnlocked, sessionApi, onComplete]);

  if (showLockPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
        {/* Timer Display */}
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-slate-800/60 rounded-full px-3 py-1">
            <MinigameTimer remainingSeconds={session?.remainingSeconds ?? null} />
          </div>
        </div>
        
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtOCAyLTE2IDE2LTE2czE2IDggMTYgMTYtMiAxNi0xNiAxNi0xNi04LTE2LTE2em0wIDQ0YzAtOCAyLTE2IDE2LTE2czE2IDggMTYgMTYtMiAxNi0xNiAxNi0xNi04LTE2LTE2eiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
        
        {showSolvedGrid && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl p-4 sm:p-8 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600">Solved Grid</h2>
                <button
                  onClick={() => setShowSolvedGrid(false)}
                  className="w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg font-bold text-xl"
                >
                  ×
                </button>
              </div>
              <div className="overflow-x-auto pb-4">
                  <div className="inline-block border-4 border-purple-400 rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-white to-purple-50 p-3">
                    {grid.map((row, rowIdx) => (
                      <div key={rowIdx} className="flex">
                        {row.map((cell, colIdx) => {
                          const isActive = crosswordStructure[rowIdx][colIdx];
                          const isHighlighted = isHighlightedCell(rowIdx, colIdx);
                          
                          if (!isActive) return <div key={colIdx} className="w-11 h-11 flex-shrink-0"></div>;
                          
                          return (
                            <div
                              key={colIdx}
                              className={`w-11 h-11 border-2 flex-shrink-0 flex items-center justify-center text-lg font-bold ${
                                isHighlighted && cell
                                  ? 'bg-gradient-to-br from-yellow-300 to-amber-400 border-amber-500 text-amber-900 shadow-md ring-2 ring-amber-400'
                                  : isHighlighted
                                  ? 'bg-gradient-to-br from-yellow-100 to-amber-200 border-amber-400 shadow-inner ring-2 ring-amber-300'
                                  : cell 
                                  ? 'bg-gradient-to-br from-purple-100 to-purple-200 border-purple-400 text-purple-900 shadow-md' 
                                  : 'bg-white border-gray-300 shadow-inner'
                              }`}
                            >
                              {cell}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="relative z-10 text-center">
          {!isUnlocked ? (
            <div className="space-y-8">
              <h1 className="text-4xl sm:text-6xl font-bold text-white mb-4 drop-shadow-2xl">Final Challenge</h1>
              <p className="text-lg sm:text-xl text-gray-300 mb-8">Unlock the secret code</p>
              
              <button
                onClick={() => setShowSolvedGrid(true)}
                className="mb-4 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold text-lg rounded-xl hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 hover:scale-105 shadow-xl"
              >
                View Solved Grid
              </button>
              
              <div className={`bg-gradient-to-br from-slate-700 to-slate-800 p-6 sm:p-12 rounded-3xl shadow-2xl border-4 border-slate-600 transition-all duration-300 ${shaking ? 'animate-shake' : ''}`}>
                <div className="mb-8">
                  <svg className="w-24 h-24 sm:w-32 sm:h-32 mx-auto text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C9.243 2 7 4.243 7 7v3H6c-1.103 0-2 .897-2 2v8c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-8c0-1.103-.897-2-2-2h-1V7c0-2.757-2.243-5-5-5zm3 8V7c0-1.654-1.346-3-3-3S9 5.346 9 7v3h6z"/>
                  </svg>
                </div>
                
                <div className="flex justify-center gap-2 sm:gap-4 mb-8">
                  {lockCode.map((letter, index) => (
                    <div key={index} className="flex flex-col items-center gap-2">
                      <button
                        onClick={() => changeLetter(index, 1)}
                        className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-all duration-200 hover:scale-110 shadow-lg"
                      >
                        ▲
                      </button>
                      <div className="w-14 h-18 text-3xl sm:w-16 sm:h-20 sm:text-4xl bg-white rounded-lg flex items-center justify-center font-bold text-slate-800 shadow-xl border-4 border-slate-400">
                        {letter}
                      </div>
                      <button
                        onClick={() => changeLetter(index, -1)}
                        className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-all duration-200 hover:scale-110 shadow-lg"
                      >
                        ▼
                      </button>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={tryUnlock}
                  className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-slate-900 font-bold text-xl rounded-xl hover:from-yellow-400 hover:to-yellow-500 transition-all duration-300 hover:scale-105 shadow-2xl"
                >
                  Unlock
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-fadeIn">
              <div className="mb-8">
                <svg className="w-32 h-32 sm:w-40 sm:h-40 mx-auto text-green-400 animate-bounce" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C9.243 2 7 4.243 7 7v3H6c-1.103 0-2 .897-2 2v8c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-8c0-1.103-.897-2-2-2h-1V7c0-2.757-2.243-5-5-5zm3 8V7c0-1.654-1.346-3-3-3S9 5.346 9 7v3h6z"/>
                  <circle cx="12" cy="16" r="2" fill="#22c55e"/>
                </svg>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 mb-4 drop-shadow-2xl animate-pulse">
                🎉 Congratulations! 🎉
              </h1>
              <p className="text-2xl sm:text-3xl text-green-300 mb-8">You've successfully unlocked the puzzle!</p>
              <p className="text-lg sm:text-xl text-gray-300">You are a true puzzle master! 🏆</p>
            </div>
          )}
        </div>

        <style jsx>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
          }
          .animate-shake {
            animation: shake 0.3s ease-in-out;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.5s ease-out;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 p-2 sm:p-4 lg:p-8 relative">
      {/* Timer Display */}
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-slate-800/60 rounded-full px-3 py-1">
          <MinigameTimer remainingSeconds={session?.remainingSeconds ?? null} />
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-center mb-3 sm:mb-4 lg:mb-8 text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 drop-shadow-lg">
          Number Crossword Puzzle
        </h1>
        
        {showCompletionPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
            <div className="bg-gradient-to-br from-white to-purple-50 rounded-3xl p-6 sm:p-10 shadow-2xl w-full max-w-lg transform transition-all duration-500 animate-slideUp border-4 border-purple-200">
              <div className="text-center space-y-6">
                <div className="text-7xl animate-bounce">🎉</div>
                <h2 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
                  This seems right!
                </h2>
                <p className="text-lg sm:text-xl text-gray-700">
                  You've filled all the grid spaces perfectly!
                </p>
                <button
                  onClick={handleNextChallenge}
                  className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-bold text-xl rounded-2xl hover:from-purple-700 hover:to-fuchsia-700 transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl"
                >
                  Next Challenge →
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 lg:gap-6">
          <div className="flex-1">
            <div className="bg-white/80 backdrop-blur-sm p-3 sm:p-4 lg:p-6 rounded-2xl sm:rounded-3xl shadow-xl border border-purple-100">
              <div className="flex flex-col sm:flex-row items-center justify-between mb-3 sm:mb-4 lg:mb-6 gap-2 sm:gap-4">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600">Crossword Grid</h2>
                <button
                  onClick={clearGrid}
                  className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white text-sm sm:text-base font-bold rounded-xl hover:from-red-600 hover:to-rose-700 transition-all duration-200 hover:scale-105 shadow-lg w-full sm:w-auto"
                >
                  Clear Grid
                </button>
              </div>
              <div className="overflow-x-auto pb-2 sm:pb-4">
                <div className="inline-block border-2 sm:border-4 border-purple-400 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-white to-purple-50 p-1 sm:p-2 lg:p-3">
                    {grid.map((row, rowIdx) => (
                      <div key={rowIdx} className="flex">
                        {row.map((cell, colIdx) => {
                          const isActive = crosswordStructure[rowIdx][colIdx];
                          const isPreview = isCellInPreview(rowIdx, colIdx);
                          const isHighlighted = isHighlightedCell(rowIdx, colIdx);
                          
                          if (!isActive) return <div key={colIdx} className="w-8 h-8 sm:w-10 sm:h-10 lg:w-11 lg:h-11 flex-shrink-0"></div>;
                          
                          return (
                            <div
                              key={colIdx}
                              className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-11 lg:h-11 border-2 flex-shrink-0 flex items-center justify-center text-base sm:text-lg font-bold transition-all duration-200 ${
                                isHighlighted && cell
                                  ? 'bg-gradient-to-br from-yellow-300 to-amber-400 border-amber-500 text-amber-900 cursor-pointer hover:from-red-100 hover:to-red-200 hover:border-red-400 hover:scale-110 shadow-md ring-2 ring-amber-400'
                                  : isHighlighted
                                  ? 'bg-gradient-to-br from-yellow-100 to-amber-200 border-amber-400 shadow-inner ring-2 ring-amber-300'
                                  : cell 
                                  ? 'bg-gradient-to-br from-purple-100 to-purple-200 border-purple-400 text-purple-900 cursor-pointer hover:from-red-100 hover:to-red-200 hover:border-red-400 hover:scale-110 shadow-md' 
                                  : 'bg-white border-gray-300 shadow-inner'
                              } ${isPreview ? 'bg-gradient-to-br from-green-200 to-emerald-300 border-green-500 scale-110 shadow-xl ring-2 ring-green-400' : ''}`}
                              onDragOver={(e) => handleDragOver(e, rowIdx, colIdx)}
                              onDrop={(e) => handleDrop(e, rowIdx, colIdx)}
                              onClick={() => cell && handleNumberClick(rowIdx, colIdx)}
                            >
                              {cell}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mt-3 sm:mt-4 lg:mt-6 text-center">
                Drag numbers to the grid • Click placed numbers to remove them
              </p>
            </div>
          </div>

          <div className="w-full lg:w-80 xl:w-96">
            <div className="bg-white/80 backdrop-blur-sm p-3 sm:p-4 lg:p-6 rounded-2xl sm:rounded-3xl shadow-xl border border-purple-100">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 lg:mb-6 text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600">Number Sets</h2>
              <div className="space-y-3 sm:space-y-4 lg:space-y-5">
                {availableNumbers.map((box, boxIdx) => (
                  <div key={boxIdx} className="border-2 border-purple-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 bg-gradient-to-br from-purple-50 to-fuchsia-50 transition-all duration-200 hover:shadow-xl hover:scale-[1.02]">
                    <h3 className="font-bold text-purple-900 mb-2 sm:mb-3 lg:mb-4 text-base sm:text-lg lg:text-xl">Box {box.box}</h3>
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      {box.numbers.map((num, numIdx) => {
                        const orientation = getNumberOrientation(boxIdx, num);
                        const digits = num.split('');
                        return (
                          <div key={numIdx} className="relative group">
                            <div
                              draggable
                              onDragStart={() => handleDragStart(num, boxIdx)}
                              className={`bg-white border-2 border-purple-300 rounded-lg sm:rounded-xl p-2 sm:p-3 font-mono font-bold text-purple-900 transition-all duration-200 cursor-move hover:border-purple-500 hover:scale-110 hover:shadow-lg ${
                                orientation === 'vertical' ? 'flex flex-col items-center' : 'flex gap-1'
                              }`}
                            >
                              {digits.map((digit, idx) => (
                                <span key={idx} className="text-center w-5 sm:w-6 text-sm sm:text-base">{digit}</span>
                              ))}
                            </div>
                            <button
                              onClick={() => toggleNumberOrientation(boxIdx, num)}
                              className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-600 to-fuchsia-600 text-white rounded-full flex items-center justify-center hover:from-purple-700 hover:to-fuchsia-700 transition-all duration-200 hover:scale-110 shadow-lg text-xs sm:text-sm font-bold ring-2 ring-white"
                              title={orientation === 'horizontal' ? 'Switch to Vertical' : 'Switch to Horizontal'}
                            >
                              {orientation === 'horizontal' ? '→' : '↓'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(50px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}