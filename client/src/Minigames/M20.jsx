import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import MinigameTimer from '../components/MinigameTimer';
import useMinigameSession from '../lib/useMinigameSession';

// --- CONFIGURATION AND INITIAL GRID SETUP ---

const ROW_LENGTHS = [8, 9, 8, 9, 8, 9, 8];

const HARDCODED_GRID_VALUES = [
    ['0', '1', '2', 'x', '3', 'x', '1', '0'],
    ['1', '2', 'x', '4', 'x', '4', '2', '1', '1'],
    ['x', '3', '2', 'x', 'x', 'x', '2', 'x'],
    ['2', 'x', '2', '3', '3', '2', '1', '1', '1'],
    ['2', '2', 'x', 'x', '2', '1', '0', '1'],
    ['x', '3', '3', 'x', '4', 'x', '2', '1', 'x'],
    ['x', 'x', '3', 'x', '3', 'x', '1', '1'],
];

const STARTER_TILES_COORDS = [
    { r: 0, c: 0 }, { r: 0, c: 4 }, { r: 0, c: 7 },
    { r: 1, c: 5 },
    { r: 2, c: 1 },
    { r: 3, c: 3 },
    { r: 6, c: 4 },
];

const getNeighbors = (r, c, grid) => {
    const neighbors = [];
    const isEvenRow = r % 2 === 0;

    let offsets;
    if (isEvenRow) {
        offsets = [
            [0, -1], [0, 1],
            [-1, -1], [-1, 0],
            [1, 0], [1, 1],
        ];
    } else {
        offsets = [
            [0, -1], [0, 1],
            [-1, 0], [-1, 1],
            [1, 0], [1, 1],
        ];
    }

    for (const [dr, dc] of offsets) {
        const nr = r + dr;
        const nc = c + dc;

        if (
            nr >= 0 && nr < grid.length &&
            nc >= 0 && nc < grid[nr].length
        ) {
            neighbors.push(grid[nr][nc]);
        }
    }
    return neighbors;
};

const createInitialGrid = () => {
    const grid = [];
    let safeTilesCount = 0;
    let totalMines = 0;

    const starterSet = new Set(STARTER_TILES_COORDS.map(coord => `${coord.r},${coord.c}`));

    for (let r = 0; r < ROW_LENGTHS.length; r++) {
        const row = [];
        const length = ROW_LENGTHS[r];
        for (let c = 0; c < length; c++) {
            const value = HARDCODED_GRID_VALUES[r][c];
            const isMine = value === 'x';
            
            const mineCount = isMine ? 0 : parseInt(value, 10);
            const isStarter = starterSet.has(`${r},${c}`);

            if (!isMine) {
                safeTilesCount++;
            } else {
                totalMines++;
            }
            
            row.push({
                r,
                c,
                isMine,
                mineCount,
                isRevealed: false,
                isFlagged: false,
                isStarter,
            });
        }
        grid.push(row);
    }
    
    return { grid, totalSafeTiles: safeTilesCount, totalMines }; 
};

export default function HexMinesweeperGame({ onComplete }) {
    const { grid: initialGrid, totalSafeTiles, totalMines: initialTotalMines } = useMemo(createInitialGrid, []);

    const { session, loading, error, remainingSeconds, triesLeft, api: sessionApi } = useMinigameSession('M20');
    const completionHandledRef = useRef(false);

    const [grid, setGrid] = useState(initialGrid);
    const [gameState, setGameState] = useState('playing');
    const [revealedCount, setRevealedCount] = useState(0);

    useEffect(() => {
        if (gameState === 'playing' && revealedCount === totalSafeTiles) {
            setGameState('won');
        }
    }, [revealedCount, totalSafeTiles, gameState]);

    // handle backend session state changes (timeout FIRST, then tries exhausted)
    useEffect(() => {
        if (!session || completionHandledRef.current) return;

        // IMPORTANT: Check timeout FIRST before checking tries
        // This ensures when timer expires, we treat it as a timeout not as tries exhausted
        if (typeof remainingSeconds === 'number' && remainingSeconds <= 0) {
            completionHandledRef.current = true;
            setGameState('lost'); // Update UI to show game over
            sessionApi.completeSession().then(() => {
                if (typeof onComplete === 'function') onComplete(false);
            }).catch(() => {
                if (typeof onComplete === 'function') onComplete(false);
            });
            return;
        }

        // Handle tries exhausted (only if time hasn't run out)
        if (typeof session.triesLeft === 'number' && session.triesLeft <= 0) {
            completionHandledRef.current = true;
            setGameState('lost');
            sessionApi.completeSession().then(() => {
                if (typeof onComplete === 'function') onComplete(false);
            }).catch(() => {
                if (typeof onComplete === 'function') onComplete(false);
            });
            return;
        }
    }, [session, remainingSeconds, sessionApi, onComplete]);

    // handle local win/loss
    useEffect(() => {
        if (completionHandledRef.current) return;
        if (gameState === 'won') {
            completionHandledRef.current = true;
            sessionApi.completeSession().then(() => {
                if (typeof onComplete === 'function') onComplete(true);
            }).catch(() => {
                if (typeof onComplete === 'function') onComplete(true);
            });
        } else if (gameState === 'lost') {
            completionHandledRef.current = true;
            sessionApi.completeSession().then(() => {
                if (typeof onComplete === 'function') onComplete(false);
            }).catch(() => {
                if (typeof onComplete === 'function') onComplete(false);
            });
        }
    }, [gameState, sessionApi, onComplete]);

    const revealTileAndNeighbors = useCallback((r, c, currentGrid) => {
        const queue = [{ r, c }];
        const newGrid = currentGrid.map(row => row.map(tile => ({ ...tile })));
        let newRevealedCount = 0;

        const processTile = (tile) => {
            if (!tile || tile.isRevealed || tile.isFlagged || tile.isMine) return;

            if (!newGrid[tile.r][tile.c].isRevealed) {
                newGrid[tile.r][tile.c].isRevealed = true;
                newRevealedCount++;
            }

            if (tile.mineCount === 0) {
                const neighbors = getNeighbors(tile.r, tile.c, newGrid);
                neighbors.forEach(neighbor => {
                    if (!neighbor.isRevealed && !neighbor.isFlagged) {
                        queue.push(neighbor);
                    }
                });
            }
        };

        const visited = new Set();

        while (queue.length > 0) {
            const tile = queue.shift();
            const key = `${tile.r},${tile.c}`;

            if (visited.has(key)) continue;
            visited.add(key);

            const currentTileInNewGrid = newGrid[tile.r][tile.c];
            processTile(currentTileInNewGrid);
        }

        return { newGrid, newRevealedCount };
    }, []);

    const handleTileClick = useCallback(async (r, c) => {
        if (gameState !== 'playing') return;

        const tile = grid[r][c];
        if (tile.isRevealed || tile.isFlagged) return;

        if (tile.isMine) {
            // Reveal only the clicked mine (don't reveal all mines)
            const newGrid = grid.map(row => row.map(t => (t.r === r && t.c === c ? { ...t, isRevealed: true } : t)));
            setGrid(newGrid);
            
            // Decrement try - the tries exhausted effect will end game if tries reach 0
            try {
                await sessionApi.decrementTry();
                // Don't set gameState to 'lost' here - let player continue if tries remain
            } catch (err) {
                console.error('Failed to decrement try:', err);
            }
            return;
        }

        if (tile.mineCount === 0) {
            const { newGrid, newRevealedCount } = revealTileAndNeighbors(r, c, grid);
            setGrid(newGrid);
            setRevealedCount(prev => prev + newRevealedCount);
        } else {
            const newGrid = grid.map(row => row.map(t => (t.r === r && t.c === c ? { ...t, isRevealed: true } : t)));
            setGrid(newGrid);
            setRevealedCount(prev => prev + 1);
        }

    }, [grid, gameState, revealTileAndNeighbors, sessionApi]);

    const handleFlag = useCallback((e, r, c) => {
        e.preventDefault();
        if (gameState !== 'playing') return;

        const tile = grid[r][c];
        if (tile.isRevealed) return;

        const newGrid = grid.map(row =>
            row.map(t => (t.r === r && t.c === c ? { ...t, isFlagged: !t.isFlagged } : t))
        );
        setGrid(newGrid);
    }, [grid, gameState]);

    const handleRestart = () => {
        const { grid: newGrid } = createInitialGrid();
        setGrid(newGrid);
        setRevealedCount(0);
        setGameState('playing');
    };

    const getTileContent = (tile) => {
        if (tile.isFlagged && !tile.isRevealed) {
            return '🚩';
        }
        if (tile.isRevealed) {
            if (tile.isMine) {
                return '💣';
            }
            if (tile.mineCount > 0) {
                return tile.mineCount;
            }
            return '';
        }

        if (tile.isStarter && !tile.isRevealed && !tile.isFlagged) {
            return '★'; 
        }
        
        return '';
    };

    const MINE_COUNT_COLORS = {
        1: 'text-blue-800', 
        2: 'text-green-800', 
        3: 'text-red-800', 
        4: 'text-purple-800', 
        5: 'text-black',
        6: 'text-black',
        7: 'text-black',
        8: 'text-black',
    };

    const UNREVEALED_COLOR = '#e4b547';
    const REVEALED_COLOR = '#ffe9b2';
    const BOMB_COLOR = '#e46947';

    const HexagonTile = ({ tile }) => {
        const content = getTileContent(tile);
        const mineColorClass = MINE_COUNT_COLORS[tile.mineCount] || 'text-gray-900'; 

        let visualClass = 'hexagon m-0.5 flex items-center justify-center cursor-pointer text-xl font-inter';
        let customStyle = {};

        if (tile.isRevealed) {
            if (tile.isMine) {
                customStyle.backgroundColor = BOMB_COLOR;
                visualClass += ' text-white shadow-inner'; 
            } else {
                customStyle.backgroundColor = REVEALED_COLOR;
                visualClass += ' shadow-inner'; 
            }
        } else {
            customStyle.backgroundColor = UNREVEALED_COLOR;
            visualClass += ' shadow-lg';
        }

        customStyle.width = '4rem'; 
        customStyle.height = '3.46rem';
        customStyle.clipPath = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)';
        customStyle.transition = 'all 0.15s ease';

        return (
            <div
                className={`${visualClass} ${tile.isRevealed ? mineColorClass : 'text-amber-950'}`}
                style={customStyle}
                onClick={() => handleTileClick(tile.r, tile.c)}
                onContextMenu={(e) => handleFlag(e, tile.r, tile.c)}
            >
                {content}
            </div>
        );
    };

    const gridDisplay = grid.map((row, r) => {
        const isOddRow = r % 2 !== 0;

        return (
            <div
                key={r}
                className={`flex justify-center -mt-[17px] ${isOddRow ? 'ml-0' : 'ml-[32px]'}`}
            >
                {row.map((tile, c) => (
                    <HexagonTile key={`${r}-${c}`} tile={tile} />
                ))}
            </div>
        );
    });

    return (
        <div className="flex flex-col items-center p-6 min-h-screen bg-amber-50 font-inter">
                {/* Timer (fixed at top center) */}
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
                    <MinigameTimer remainingSeconds={remainingSeconds}/>
                </div>
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
                    body { font-family: 'Inter', sans-serif; }
                `}
            </style>
            
            <h1 className="text-4xl font-extrabold text-amber-950 mb-2 mt-6 tracking-tight">Hexagonal Mine Hunt</h1>
            <p className="text-lg text-amber-900 mb-6">Mines: {initialTotalMines} | Safe Tiles Remaining: {totalSafeTiles - revealedCount}</p>

            {/* ✅ Added padding inside the box */}
            <div className="mb-8 p-6 rounded-2xl shadow-2xl bg-white border border-gray-200">
                <div className="flex flex-col items-start min-w-[500px]">
                    {gridDisplay}
                </div>
            </div>

            <div className="flex flex-col items-center">
                {gameState !== 'playing' && (
                    <div className={`p-4 mb-4 rounded-xl font-bold text-2xl w-full text-center ${gameState === 'won' ? 'bg-green-100 text-green-700' : 'bg-white-100 text-red-700'}`}>
                        {gameState === 'won' ? 'YOU WON! All mines avoided.' : 'Game Over !  You hit a mine.'}
                    </div>
                )}
                <button
                    onClick={handleRestart}
                    className="px-6 py-3 bg-amber-900 text-white text-lg font-semibold rounded-full shadow-lg hover:bg-amber-950 transition duration-150 transform hover:scale-105"
                >
                    {gameState === 'playing' ? 'Restart Game' : 'Play Again'}
                </button>
                {/* ❌ Removed the “Left-Click / Right-Click” instruction line */}
            </div>
        </div>
    );
}
