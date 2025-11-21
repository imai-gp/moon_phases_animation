import React from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface Props {
  isPlaying: boolean;
  onTogglePlay: () => void;
  speed: number;
  onSpeedChange: (s: number) => void;
  angle: number;
  onAngleChange: (a: number) => void;
}

export const Controls: React.FC<Props> = ({ 
  isPlaying, 
  onTogglePlay, 
  speed, 
  onSpeedChange,
  angle,
  onAngleChange
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-800 rounded-xl border border-slate-700 shadow-lg w-full max-w-2xl mx-auto">
      
      <button 
        onClick={onTogglePlay}
        className="flex items-center justify-center w-12 h-12 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full transition-all shadow-md focus:ring-2 focus:ring-indigo-300"
      >
        {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
      </button>

      <div className="flex-1 w-full space-y-2">
        <div className="flex justify-between text-xs text-slate-300 font-bold">
          <span>操作 (Manual)</span>
          <span>{Math.round(angle)}°</span>
        </div>
        <input 
          type="range" 
          min="0" 
          max="360" 
          step="1"
          value={angle}
          onChange={(e) => onAngleChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-indigo-400"
        />
      </div>

      <div className="flex flex-col w-full sm:w-32 space-y-1">
        <label className="text-xs text-slate-400 font-bold">速さ (Speed)</label>
        <input 
          type="range" 
          min="0.1" 
          max="2.0" 
          step="0.1"
          value={speed}
          onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-emerald-400"
        />
      </div>
    </div>
  );
};
