import React from 'react';
import { ORBIT_RADIUS, MOON_RADIUS, EARTH_RADIUS, SUN_RADIUS } from '../constants';
import { Star } from '../types';

interface Props {
  angle: number;
  stars: Star[];
}

export const OrbitVisualizer: React.FC<Props> = ({ angle, stars }) => {
  // Sun is on the RIGHT side.
  // Center coordinates
  const cx = 200;
  const cy = 200;
  
  // Convert angle to radians. 
  // 0 degrees = Right.
  // Moon rotates counter-clockwise.
  const rad = (angle * Math.PI) / 180;
  
  // Moon Position
  const moonX = cx + ORBIT_RADIUS * Math.cos(rad);
  const moonY = cy + ORBIT_RADIUS * Math.sin(rad); // Y goes down in SVG
  // Actually, in space, counter-clockwise usually means y decreases if 0 is right. 
  // Standard Math: x = cos(a), y = -sin(a) for screen coords where y is down?
  // Let's stick to standard SVG trig: 
  // 0 deg = (cx + r, cy) -> Right
  // 90 deg = (cx, cy + r) -> Bottom (Screen). 
  // Ideally we want 90 deg (First Quarter) to be "Top" visually if we view from "Side"?
  // Let's align with the standard "Top-down" view diagram.
  // Sun on Right.
  // Earth Center.
  // New Moon = Moon between Earth and Sun (Angle 0).
  // Moon pos = (cx + r, cy). Correct.
  // First Quarter = Moon has moved 90 deg. 
  // In N. Hemisphere view, orbit is counter-clockwise.
  // So Moon goes UP (y decreases). 
  // So y = cy - r * sin(rad).
  const moonY_CCW = cy - ORBIT_RADIUS * Math.sin(rad);


  return (
    <svg viewBox="0 0 400 400" className="w-full h-full bg-slate-900 rounded-xl shadow-inner border border-slate-700 overflow-hidden" id="orbit-svg">
      <defs>
        {/* Glow filter for Sun */}
        <filter id="sunGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Stars Background */}
      {stars.map((star, i) => (
        <circle key={i} cx={star.x} cy={star.y} r={star.size} fill="white" opacity={star.opacity} />
      ))}

      {/* Sun Rays (Right side) */}
      <g transform="translate(360, 200)">
        {[...Array(8)].map((_, i) => (
           <line 
             key={i}
             x1="0" y1="0" 
             x2="-80" y2={(i - 3.5) * 20} 
             stroke="#fde047" 
             strokeWidth="2" 
             strokeDasharray="4 4"
             opacity="0.5"
           />
        ))}
        {/* The Sun Body (Partial on the right edge) */}
        <circle cx="60" cy="0" r={SUN_RADIUS} fill="#fde047" filter="url(#sunGlow)" />
      </g>

      {/* Orbit Path */}
      <circle cx={cx} cy={cy} r={ORBIT_RADIUS} fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="4 4" />

      {/* Earth */}
      <g transform={`translate(${cx}, ${cy})`}>
         {/* Atmosphere */}
         <circle r={EARTH_RADIUS + 2} fill="#3b82f6" opacity="0.3" />
         <circle r={EARTH_RADIUS} fill="#1d4ed8" />
         {/* Simple Continents */}
         <path d="M -10 -5 Q 0 -20 15 -10 T 20 5 T 5 20 T -15 10 Z" fill="#15803d" opacity="0.8" />
      </g>

      {/* Moon Group */}
      <g transform={`translate(${moonX}, ${moonY_CCW})`}>
        {/* Moon Body */}
        <circle r={MOON_RADIUS} fill="#94a3b8" />
        
        {/* Moon Shadow Side (Always facing away from Sun) */}
        {/* Since Sun is on RIGHT (0 degrees), Shadow is on LEFT of the moon relative to global coords */}
        {/* We rotate the moon shadow based on nothing, it's always the left half that is dark? 
            No, the side facing AWAY from sun is dark. 
            Since Sun is at infinity on Right, the LEFT half of the moon is ALWAYS dark in this view. */}
        <path d={`M 0 -${MOON_RADIUS} A ${MOON_RADIUS} ${MOON_RADIUS} 0 0 0 0 ${MOON_RADIUS} Z`} fill="#0f172a" opacity="0.9" />
      </g>

      {/* Labels */}
      <text x={350} y={380} fill="#fde047" fontSize="14" textAnchor="end" fontWeight="bold">太陽 (SUN)</text>
      <text x={cx} y={cy + EARTH_RADIUS + 20} fill="#3b82f6" fontSize="14" textAnchor="middle" fontWeight="bold">地球 (EARTH)</text>
      <text x={moonX} y={moonY_CCW - MOON_RADIUS - 10} fill="#cbd5e1" fontSize="12" textAnchor="middle">月</text>
    </svg>
  );
};
