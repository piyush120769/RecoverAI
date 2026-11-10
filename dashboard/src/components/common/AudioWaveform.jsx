import React, { useState, useEffect } from 'react';
import { Play, Pause, Volume2, RotateCcw } from 'lucide-react';

export function AudioWaveform({ duration = '1m 24s' }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 2;
        });
      }, 200);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  // 36 bars for realistic voice wave
  const barHeights = [
    24, 40, 60, 30, 75, 45, 90, 60, 35, 70,
    85, 40, 20, 55, 95, 60, 30, 80, 50, 65,
    30, 90, 75, 40, 60, 85, 30, 45, 70, 50,
    35, 60, 40, 25, 45, 20
  ];

  return (
    <div className="bg-[#17243A] text-white p-5 rounded-xl border border-slate-800 shadow-2xs">
      <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
        <div className="flex items-center gap-2 font-medium text-slate-300">
          <Volume2 className="w-4 h-4 text-blue-400" />
          <span>RecoverAI Call Audio Recording (AES-256 Encrypted)</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-blue-400 font-semibold">{Math.floor((progress / 100) * 84)}s</span>
          <span>/</span>
          <span>{duration}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={togglePlay}
          className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition-transform active:scale-95 shrink-0 shadow-xs cursor-pointer"
          title={isPlaying ? 'Pause' : 'Play mock recording'}
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
        </button>

        {/* Audio Bars */}
        <div className="flex-1 flex items-center justify-between gap-[3px] h-10 px-1">
          {barHeights.map((h, i) => {
            const barPercent = (i / barHeights.length) * 100;
            const isPassed = barPercent <= progress;
            return (
              <div
                key={i}
                className="w-1.5 rounded-full transition-all duration-150"
                style={{
                  height: `${h}%`,
                  backgroundColor: isPassed ? '#38BDF8' : '#334155',
                  opacity: isPlaying && isPassed ? 1 : isPassed ? 0.85 : 0.45
                }}
              />
            );
          })}
        </div>

        <button
          onClick={handleReset}
          className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          title="Reset"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
