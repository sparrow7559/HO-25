import React from 'react';

/**
 * MinigameTimer
 * Props:
 *  - remainingSeconds?: number | null
 *  - triesLeft?: number | null
 *  - compact?: boolean
 *  - className?: string
 */
export default function MinigameTimer({ remainingSeconds, triesLeft, compact = false, className = '' }) {
  const fmt = (secs) => {
    if (secs === null || secs === undefined) return '--:--';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
  };

  const danger = remainingSeconds !== null && remainingSeconds <= 10;
  const baseStyles = compact
    ? 'px-2 py-1 text-xs'
    : 'px-3 py-1.5 text-sm';

  return (
    <div className={`inline-flex items-center gap-2 rounded-full font-mono bg-slate-800/70 border ${danger ? 'border-red-500 text-red-300' : 'border-slate-600 text-slate-200'} shadow-sm backdrop-blur ${baseStyles} ${className}`.trim()}>
      <span title="Time Remaining">⏱ {fmt(remainingSeconds)}</span>
      {typeof triesLeft === 'number' && triesLeft > 0 && triesLeft!=null && (
        <span className="font-semibold" title="Tries Left">• Tries: {triesLeft}</span>
      )}
    </div>
  );
}