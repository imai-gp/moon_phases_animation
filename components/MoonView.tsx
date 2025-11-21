import React from 'react';
import { getMoonPhasePath } from '../utils/moonMath';
import { Star } from '../types';

interface Props {
  angle: number;
  stars: Star[];
}

export const MoonView: React.FC<Props> = ({ angle, stars }) => {
  const radius = 100; // Large display radius
  const pathData = getMoonPhasePath(angle, radius);
  
  return (
    <svg viewBox="0 0 400 400" className="w-full h-full bg-slate-900 rounded-xl shadow-inner border border-slate-700 overflow-hidden" id="phase-svg">
      <defs>
        <filter id="moonGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo" />
          <feComposite in="SourceGraphic" in2="goo" operator="atop"/>
        </filter>
      </defs>

      {/* Stars Background (Randomized but consistent via prop) */}
      {stars.map((star, i) => (
        <circle key={`mv-${i}`} cx={star.x} cy={star.y} r={star.size} fill="white" opacity={star.opacity} />
      ))}

      {/* Center Container */}
      <g transform="translate(200, 200)">
        
        {/* Base Moon (Dark Side) */}
        <circle r={radius} fill="#1e293b" />
        
        {/* Lit Side (Path) */}
        <path d={pathData} fill="#f1f5f9" filter="url(#moonGlow)" />
        
        {/* Craters (Only visible on lit part - strictly masking is hard in single SVG without clipPaths on dynamic shapes properly) */}
        {/* Simplified: Draw faint craters on the lit part by using the same path as clip path? */}
        <defs>
            <clipPath id="litClip">
                <path d={pathData} />
            </clipPath>
        </defs>
        
        <g clipPath="url(#litClip)" opacity="0.3">
             <circle cx="-30" cy="-40" r="15" fill="#94a3b8" />
             <circle cx="40" cy="20" r="20" fill="#94a3b8" />
             <circle cx="-10" cy="50" r="10" fill="#94a3b8" />
             <circle cx="50" cy="-30" r="8" fill="#94a3b8" />
        </g>
      </g>
      
      <text x="200" y="360" fill="white" fontSize="16" textAnchor="middle" className="font-bold">地球から見た月</text>
    </svg>
  );
};
