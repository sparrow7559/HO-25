import React, { useState, useCallback, useEffect } from 'react';
import MinigameTimer from '../components/MinigameTimer';

const M3 = ({ config, onComplete, session, sessionApi }) => {
  const BOARD_SIZE = 10;
  const CHIP_POSITIONS = [
    { row: 0, col: 1, value: 1 }, { row: 0, col: 3, value: 4 }, { row: 0, col: 5, value: 3 }, { row: 0, col: 6, value: 5 }, { row: 0, col: 9, value: 4 },
    { row: 1, col: 0, value: 2 }, { row: 1, col: 2, value: 2 },
    { row: 2, col: 3, value: 2 }, { row: 2, col: 6, value: 3 }, { row: 2, col: 8, value: 2 },
    { row: 3, col: 1, value: 2 }, { row: 3, col: 2, value: 4 }, { row: 3, col: 5, value: 3 }, { row: 3, col: 7, value: 3 }, { row: 3, col: 9, value: 4 },
    { row: 4, col: 0, value: 4 }, { row: 4, col: 6, value: 1 },
    { row: 5, col: 2, value: 1 }, { row: 5, col: 5, value: 2 }, { row: 5, col: 9, value: 2 },
    { row: 6, col: 0, value: 3 }, { row: 6, col: 4, value: 2 }, { row: 6, col: 6, value: 3 }, { row: 6, col: 8, value: 2 }
  ];

  const [chips, setChips] = useState(() => {
    const chipMap = {};
    CHIP_POSITIONS.forEach(chip => {
      const key = `${chip.row}-${chip.col}`;
      chipMap[key] = { ...chip, connections: [], currentConnections: 0 };
    });
    return chipMap;
  });
  
  const defaultConnections = [
  { from: '0-5', to: '0-6' },
  { from: '0-5', to: '0-6' },
  { from: '0-6', to: '0-9' },
  { from: '0-6', to: '0-9' },
  { from: '0-6', to: '2-6' },
  { from: '1-0', to: '4-0' },
  { from: '4-0', to: '6-0' },
  { from: '4-0', to: '4-6' }
];

  const [connections, setConnections] = useState(() => {
    const initial = defaultConnections.map((conn, idx) => ({
      ...conn,
      isDefault: true,
      id: `default-${idx}`,
    }));

    const updatedChips = { ...chips };
    for (const conn of initial) {
      updatedChips[conn.from].currentConnections += 1;
      updatedChips[conn.to].currentConnections += 1;
    }

    setChips(updatedChips);
    return initial;
  });

  const [selectedChip, setSelectedChip] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gridSize, setGridSize] = useState({ width: 0, height: 0 });

  // Session based expiry — rely on loader to finalize
  useEffect(() => {
    if (!session || session.completed) return;
    if (session.remainingSeconds === 0) {
      setIsGameOver(true);
    }
  }, [session]);

  const romanNumerals = ['', 'I', 'II', 'III', 'IV', 'V'];

  const getChipKey = (row, col) => `${row}-${col}`;

  const isValidConnection = (chip1Key, chip2Key) => {
    const chip1 = chips[chip1Key];
    const chip2 = chips[chip2Key];

    // 1. Don't connect if any chip is already at its limit
    if (chip1.currentConnections >= chip1.value || chip2.currentConnections >= chip2.value) {
      return false;
    }

    const [row1, col1] = chip1Key.split('-').map(Number);
    const [row2, col2] = chip2Key.split('-').map(Number);

    // 2. Must be on the same row or same column
    const isSameRow = row1 === row2;
    const isSameCol = col1 === col2;
    if (!isSameRow && !isSameCol) {
      return false;
    }

    // 3. Check for chips between them (no skipping over other chips)
    if (isSameRow) {
      const minCol = Math.min(col1, col2);
      const maxCol = Math.max(col1, col2);
      for (let col = minCol + 1; col < maxCol; col++) {
        const key = `${row1}-${col}`;
        if (chips[key]) {
          return false; // blocked by another chip
        }
      }
    } else if (isSameCol) {
      const minRow = Math.min(row1, row2);
      const maxRow = Math.max(row1, row2);
      for (let row = minRow + 1; row < maxRow; row++) {
        const key = `${row}-${col1}`;
        if (chips[key]) {
          return false; // blocked by another chip
        }
      }
    }

    // 4. Check if already 2 connections between the same chips
    const existingConnections = connections.filter(conn => {
      return (
        (conn.from === chip1Key && conn.to === chip2Key) ||
        (conn.from === chip2Key && conn.to === chip1Key)
      );
    });

    if (existingConnections.length >= 2) {
      return false;
    }

    // Valid connection
    return true;
  };

  const checkWiresCrossing = (newConnection) => {
    const [row1, col1] = newConnection.from.split('-').map(Number);
    const [row2, col2] = newConnection.to.split('-').map(Number);

    for (const conn of connections) {
      const [r1, c1] = conn.from.split('-').map(Number);
      const [r2, c2] = conn.to.split('-').map(Number);

      if (doLinesIntersect(row1, col1, row2, col2, r1, c1, r2, c2)) {
        return true;
      }
    }
    return false;
  };

  const doLinesIntersect = (x1, y1, x2, y2, x3, y3, x4, y4) => {
    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (denom === 0) return false;
    
    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;
    
    return t > 0 && t < 1 && u > 0 && u < 1;
  };

  const handleChipClick = (chipKey) => {

    if (!selectedChip) {
      setSelectedChip(chipKey);
    } else if (selectedChip === chipKey) {
      setSelectedChip(null);
    } else {
      if (isValidConnection(selectedChip, chipKey)) {
        const newConnection = { from: selectedChip, to: chipKey };
        
        if (!checkWiresCrossing(newConnection)) {
          setConnections(prev => [...prev, newConnection]);
          setChips(prev => ({
            ...prev,
            [selectedChip]: { ...prev[selectedChip], currentConnections: prev[selectedChip].currentConnections + 1 },
            [chipKey]: { ...prev[chipKey], currentConnections: prev[chipKey].currentConnections + 1 }
          }));
        }
      }
      setSelectedChip(null);
    }
  };

  const handleWireClick = (connectionIndex) => {
    const connection = connections[connectionIndex];
    if (connection.isDefault) return; // keep if you don't want default wires removable

    setConnections(prev => prev.filter((_, index) => index !== connectionIndex));
    setChips(prev => ({
      ...prev,
      [connection.from]: {
        ...prev[connection.from],
        currentConnections: prev[connection.from].currentConnections - 1
      },
      [connection.to]: {
        ...prev[connection.to],
        currentConnections: prev[connection.to].currentConnections - 1
      }
    }));
  };

  const checkGameComplete = useCallback(() => {
    const allChipsConnected = Object.values(chips).every(chip => chip.currentConnections === chip.value);
    setIsComplete(allChipsConnected);
    if (allChipsConnected && onComplete) {
      setTimeout(() => onComplete(true), 2000);
    }
    if (allChipsConnected && onComplete) {
      setTimeout(() => onComplete(true), 2000);
    }
  }, [chips, onComplete]);

  useEffect(() => {
    checkGameComplete();
  }, [checkGameComplete]);

  useEffect(() => {
    const updateGridSize = () => {
      const gridEl = document.querySelector('.game-grid');
      if (gridEl) {
        const rect = gridEl.getBoundingClientRect();
        setGridSize({ width: rect.width, height: rect.height });
      }
    };

    updateGridSize();
    window.addEventListener('resize', updateGridSize);
    return () => window.removeEventListener('resize', updateGridSize);
  }, []);

  const renderGrid = () => {
    const grid = [];
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const chipKey = getChipKey(row, col);
        const chip = chips[chipKey];
        const isSelected = selectedChip === chipKey;
        
        grid.push(
          <div key={chipKey} className="aspect-square flex items-center justify-center relative" style={{ gridRow: row + 1, gridColumn: col + 1 }}>
            {chip && (
              <div
                data-chip={chipKey}
                data-row={row}
                data-col={col}
                className={`w-full h-full max-w-12 max-h-12 sm:max-w-14 sm:max-h-14 md:max-w-16 md:max-h-16 rounded-full border-2 sm:border-4 flex items-center justify-center text-black font-bold text-sm sm:text-base md:text-lg transition-all duration-200 cursor-pointer select-none ${
                  isSelected ? 'bg-cyan-100 border-cyan-100 shadow-lg shadow-cyan-400/50' : chip.currentConnections === chip.value ? 'bg-green-300 border-green-100 shadow-lg shadow-green-400/50' : 'bg-cyan-400 border-cyan-200 shadow-lg shadow-cyan-500/50'
                } hover:scale-110`}
                onClick={() => handleChipClick(chipKey)}
                style={{ userSelect: 'none', WebkitUserSelect: 'none', msUserSelect: 'none' }}
              >
                {romanNumerals[chip.value]}
              </div>
            )}
          </div>
        );
      }
    }
    return grid;
  };

  const renderConnections = () => {
    const gridEl = document.querySelector('.game-grid');
    if (!gridEl) return null;
    
    const rect = gridEl.getBoundingClientRect();
    if (rect.width === 0) return null;

    const cellSize = rect.width / BOARD_SIZE;
    const chipRadius = Math.min(cellSize * 0.25, 30);
    
    const wireGroups = new Map();
    
    connections.forEach((connection, index) => {
      const key1 = connection.from;
      const key2 = connection.to;
      const sortedPair = [key1, key2].sort().join('|');
      
      if (!wireGroups.has(sortedPair)) {
        wireGroups.set(sortedPair, []);
      }
      wireGroups.get(sortedPair).push({ ...connection, originalIndex: index });
    });

    const rendered = [];

    wireGroups.forEach((group) => {
      if (group.length === 0) return;
      
      const firstConn = group[0];
      const [fromRow, fromCol] = firstConn.from.split('-').map(Number);
      const [toRow, toCol] = firstConn.to.split('-').map(Number);
      
      const fromX = fromCol * cellSize + cellSize / 2;
      const fromY = fromRow * cellSize + cellSize / 2;
      const toX = toCol * cellSize + cellSize / 2;
      const toY = toRow * cellSize + cellSize / 2;
      
      const dx = toX - fromX;
      const dy = toY - fromY;
      const mainAngle = Math.atan2(dy, dx);
      
      const WIRE_SPACING = Math.max(12, cellSize * 0.2);
      const wireCount = group.length;
      
      group.forEach((connection, wireIdx) => {
        let offsetDistance = 0;
        if (wireCount > 1) {
          const totalWidth = (wireCount - 1) * WIRE_SPACING;
          offsetDistance = (wireIdx * WIRE_SPACING) - (totalWidth / 2);
        }
        
        const offsetX = -Math.sin(mainAngle) * offsetDistance;
        const offsetY = Math.cos(mainAngle) * offsetDistance;
        
        const startX = fromX + Math.cos(mainAngle) * chipRadius + offsetX;
        const startY = fromY + Math.sin(mainAngle) * chipRadius + offsetY;
        const endX = toX - Math.cos(mainAngle) * chipRadius + offsetX;
        const endY = toY - Math.sin(mainAngle) * chipRadius + offsetY;
        
        const wireLength = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
        const wireAngle = Math.atan2(endY - startY, endX - startX);
        
        rendered.push(
          <div
            key={`wire_${connection.originalIndex}_${wireIdx}`}
            className="absolute bg-cyan-400 hover:bg-cyan-300 cursor-pointer transition-colors duration-200 z-10"
            style={{
              left: startX,
              top: startY,
              width: wireLength,
              height: 5,
              transformOrigin: '0 50%',
              transform: `rotate(${(wireAngle * 180) / Math.PI}deg)`,
              boxShadow: '0 0 8px rgba(34, 211, 238, 0.6)',
              borderRadius: 2,
            }}
            onClick={() => handleWireClick(connection.originalIndex)}
          />
        );
      });
    });

    return rendered;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-2 sm:p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-3xl mt-12 md:text-4xl font-bold text-cyan-300 mb-2">
            Electrical Chip Connection
          </h1>
          <p className="text-cyan-100 mb-2 text-sm sm:text-base px-2">
            Connect chips so each has the same number of connections as shown on the chip
          </p>
          
          <div className="flex justify-center items-center gap-3 sm:gap-6 mb-4 z-50">
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
              <div className="bg-slate-800/60 rounded-full px-2 py-1 inline-block">
                <MinigameTimer remainingSeconds={session?.remainingSeconds ?? null} triesLeft={session?.triesLeft ?? null} />
              </div>
            </div>
            {isComplete && (
              <div className="bg-green-500/20 px-3 sm:px-4 py-2 rounded-lg border border-green-400">
                <span className="text-green-300 font-bold text-sm sm:text-base">🎉 Completed!</span>
              </div>
            )}
          </div>
        </div>

        <div className="relative bg-slate-800/50 p-2 sm:p-4 md:p-7 rounded-xl border border-cyan-500/30 shadow-2xl mx-2">
          {isGameOver && (
            <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm bg-black/40 rounded-xl z-50">
              <div className="text-center p-6 sm:p-10 bg-slate-900/80 rounded-2xl border border-red-500/50 shadow-2xl">
                <h2 className="text-2xl sm:text-3xl font-bold text-red-400 mb-3">
                   Game Over
                </h2>
                <p className="text-red-200 text-sm sm:text-base">
                  Better luck next time!
                </p>
              </div>
            </div>
          )}
          <div 
            className="game-grid relative mx-auto w-full max-w-lg sm:max-w-xl md:max-w-2xl aspect-square"
            style={{ 
              display: 'grid',
              gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
              gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)`,
              gap: '2px'
            }}
          >
            {renderConnections()}
            {renderGrid()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default M3;