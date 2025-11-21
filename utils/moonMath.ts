import { PHASE_DATA } from '../constants';
import { PhaseInfo, PhaseType } from '../types';

/**
 * Normalizes an angle to the 0-360 range.
 */
export const normalizeAngle = (angle: number): number => {
  let a = angle % 360;
  if (a < 0) a += 360;
  return a;
};

/**
 * Determines the current moon phase info based on the angle.
 * Assumes 0 is New Moon, increasing counter-clockwise.
 */
export const getPhaseInfo = (angle: number): PhaseInfo => {
  const normalized = normalizeAngle(angle);
  
  // Find the closest phase
  // We divide the 360 degrees into 8 segments centered around the standard phases
  const segment = 360 / 8;
  const offset = segment / 2;
  
  if (normalized >= 360 - offset || normalized < 0 + offset) return PHASE_DATA.find(p => p.type === PhaseType.NEW_MOON)!;
  if (normalized >= 45 - offset && normalized < 45 + offset) return PHASE_DATA.find(p => p.type === PhaseType.WAXING_CRESCENT)!;
  if (normalized >= 90 - offset && normalized < 90 + offset) return PHASE_DATA.find(p => p.type === PhaseType.FIRST_QUARTER)!;
  if (normalized >= 135 - offset && normalized < 135 + offset) return PHASE_DATA.find(p => p.type === PhaseType.WAXING_GIBBOUS)!;
  if (normalized >= 180 - offset && normalized < 180 + offset) return PHASE_DATA.find(p => p.type === PhaseType.FULL_MOON)!;
  if (normalized >= 225 - offset && normalized < 225 + offset) return PHASE_DATA.find(p => p.type === PhaseType.WANING_GIBBOUS)!;
  if (normalized >= 270 - offset && normalized < 270 + offset) return PHASE_DATA.find(p => p.type === PhaseType.LAST_QUARTER)!;
  if (normalized >= 315 - offset && normalized < 315 + offset) return PHASE_DATA.find(p => p.type === PhaseType.WANING_CRESCENT)!;
  
  return PHASE_DATA[0];
};

/**
 * Generates the SVG path data for the shadow on the moon.
 * @param angle The orbital angle (0 = New Moon).
 * @param radius The radius of the moon circle.
 */
export const getMoonPhasePath = (angle: number, radius: number): string => {
  // Ensure angle is 0-360
  const a = normalizeAngle(angle);
  const rad = (a * Math.PI) / 180;
  
  // The phase calculation depends on the relative position.
  // We want to draw the "lit" part or the "shadow" part.
  // Let's draw the LIT part.
  
  // At 0 (New Moon), lit is 0.
  // At 180 (Full Moon), lit is 100%.
  
  // We project the terminator line. The x-coordinate of the terminator on a unit circle
  // projected onto 2D view is -cos(a).
  // However, visual logic is simpler:
  // We compose the moon of two semi-circles or a semi-circle and a semi-ellipse.
  
  // Let's use a different approach compatible with standard phase rendering.
  // Light comes from Right in Orbit view -> 0 degrees = New Moon (Moon between Earth/Sun).
  // Actually, if Sun is on Right, New Moon is when Moon is at 0 degrees (Right side).
  // Wait, let's align coordinate systems.
  // Standard: 0 degrees is usually 'East' (Right).
  // If Sun is on Right (East):
  // Moon at 0 deg (Right) -> Between Earth and Sun? No, Moon is at same side as Sun.
  // If Moon is at 0 deg (Right) and Sun is at Right -> Moon is between Earth and Sun.
  // This is NEW MOON. Correct.
  
  // Moon Phase Appearance:
  // At 0 deg (New Moon): Dark.
  // At 90 deg (First Quarter - Top): Right side lit.
  // At 180 deg (Full Moon - Left): Fully lit.
  // At 270 deg (Last Quarter - Bottom): Left side lit.
  
  const isWaxing = a < 180;
  
  // The width of the lit section varies from 0 to 2*radius.
  // We can use an elliptical arc for the terminator.
  // x-radius of the terminator ellipse: r * cos(a)
  
  const xRadius = radius * Math.cos(rad);
  
  // Path construction:
  // Start at Top (0, -r)
  // Arc to Bottom (0, r) with radius (r, r) [Outer circle edge]
  // Arc back to Top (0, -r) with radius (|xRadius|, r) [Terminator]
  
  // Coordinate system for SVG path (center at 0,0)
  const startY = -radius;
  const endY = radius;
  
  // SVG Arc command: A rx ry x-axis-rotation large-arc-flag sweep-flag x y
  
  // Directions depend on Waxing vs Waning
  
  if (a === 0) {
    // New Moon - all dark
    return ""; 
  }
  
  if (Math.abs(a - 180) < 0.1) {
    // Full Moon - circle
    return `M 0 ${startY} A ${radius} ${radius} 0 1 1 0 ${endY} A ${radius} ${radius} 0 1 1 0 ${startY}`;
  }

  // 1. Draw the outer semi-circle that is always lit (or the side that is lit)
  // If Waxing (0-180), Right side is lit.
  // If Waning (180-360), Left side is lit.
  
  const sweepOuter = isWaxing ? 1 : 0; 
  // Move to top
  let d = `M 0 ${startY}`;
  // Outer arc
  d += ` A ${radius} ${radius} 0 0 ${sweepOuter} 0 ${endY}`;
  
  // Inner terminator arc
  // The terminator bulges OUT towards the dark side if Gibbous (>50% lit)
  // It bulges IN towards the lit side if Crescent (<50% lit)
  
  // Waxing Crescent (0-90): Lit is Right. Terminator bulges Right (concave).
  // Waxing Gibbous (90-180): Lit is Right. Terminator bulges Left (convex).
  
  // Helper: cos(a) is positive for 0-90 (Crescent/Terminator matches side)
  // cos(a) is negative for 90-180 (Gibbous/Terminator opposes side)
  
  // For the elliptical arc, we need to determine the sweep flag.
  
  const largeArc = 0;
  const sweepInner = isWaxing ? (a < 90 ? 0 : 1) : (a < 270 ? 0 : 1);
  
  d += ` A ${Math.abs(xRadius)} ${radius} 0 ${largeArc} ${sweepInner} 0 ${startY}`;
  
  return d;
};
