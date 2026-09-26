/**
 * src/components/LocusLogo.tsx
 *
 * Black Pinstripe Minimalist Logo for LOCUS integrating the letter "L" inside a geofence radar:
 *
 * 1. 'l-radar-core' (Default): Architectural dual-pinstripe "L" centered within concentric geofence radar rings
 * 2. 'l-radar-sweep': 90-degree radar sector where the letter "L" forms the primary axes with sweeping concentric geofence waves
 * 3. 'l-radar-reticle': Technical coordinate reticle with an interlaced pinstripe "L" and cardinal radar ticks
 */
import React from 'react';

export type LogoVariant = 'l-radar-core' | 'l-radar-sweep' | 'l-radar-reticle';

interface Props {
  variant?: LogoVariant;
  size?: number;
  className?: string;
  withWordmark?: boolean;
  wordmarkClassName?: string;
}

export const LocusLogo: React.FC<Props> = ({
  variant = 'l-radar-core',
  size = 32,
  className = '',
  withWordmark = false,
  wordmarkClassName = '',
}) => {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Concept 1: Dual-Pinstripe 'L' inside Concentric Geofence Radar */}
      {variant === 'l-radar-core' && (
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0 transition-transform duration-200"
        >
          {/* Outer dashed perimeter geofence ring (Boundary radius 3) */}
          <circle
            cx="50"
            cy="50"
            r="44"
            stroke="#1C1B1F"
            strokeWidth="1.2"
            strokeDasharray="6 3"
          />

          {/* Intermediate geofence ring (Boundary radius 2) */}
          <circle
            cx="50"
            cy="50"
            r="35"
            stroke="#1C1B1F"
            strokeWidth="1.4"
          />

          {/* Inner core geofence ring (Boundary radius 1) */}
          <circle
            cx="50"
            cy="50"
            r="24"
            stroke="#1C1B1F"
            strokeWidth="1.0"
            strokeDasharray="3 3"
            opacity="0.8"
          />

          {/* Cardinal Radar Crosshairs */}
          <line x1="50" y1="2" x2="50" y2="18" stroke="#1C1B1F" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="50" y1="82" x2="50" y2="98" stroke="#1C1B1F" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="2" y1="50" x2="18" y2="50" stroke="#1C1B1F" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="82" y1="50" x2="98" y2="50" stroke="#1C1B1F" strokeWidth="1.4" strokeLinecap="round" />

          {/* 45-degree Precision Orientation Ticks */}
          <line x1="21" y1="21" x2="26" y2="26" stroke="#1C1B1F" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="79" y1="21" x2="74" y2="26" stroke="#1C1B1F" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="21" y1="79" x2="26" y2="74" stroke="#1C1B1F" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="79" y1="79" x2="74" y2="74" stroke="#1C1B1F" strokeWidth="1.2" strokeLinecap="round" />

          {/* --- THE LETTER "L" INTEGRATION --- */}
          {/* Outer track pinstripe of 'L' */}
          <path
            d="M37 26V71H73"
            stroke="#1C1B1F"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Inner parallel pinstripe of 'L' creating the luxury dual-line look */}
          <path
            d="M44 32V64H68"
            stroke="#1C1B1F"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Fine hairline echo track */}
          <path
            d="M31 26V77H76"
            stroke="#1C1B1F"
            strokeWidth="1.0"
            strokeDasharray="4 2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Locus Target Center Dot inside the vertex corner */}
          <circle cx="44" cy="64" r="2.8" fill="#1C1B1F" />
          <circle cx="44" cy="64" r="1.2" fill="#FFFFFF" />

          {/* Core Radar Origin Point */}
          <circle cx="50" cy="50" r="1.8" fill="#1C1B1F" />
        </svg>
      )}

      {/* Concept 2: The 90-Degree Radar Arc Sector 'L' */}
      {variant === 'l-radar-sweep' && (
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0 transition-transform duration-200"
        >
          {/* Concentric Geofence Radar Arcs radiating from the L corner (22, 78) */}
          <path
            d="M22 22 A56 56 0 0 1 78 78"
            stroke="#1C1B1F"
            strokeWidth="1.2"
            strokeDasharray="6 3"
          />
          <path
            d="M22 36 A42 42 0 0 1 64 78"
            stroke="#1C1B1F"
            strokeWidth="1.5"
          />
          <path
            d="M22 50 A28 28 0 0 1 50 78"
            stroke="#1C1B1F"
            strokeWidth="1.2"
          />
          <path
            d="M22 64 A14 14 0 0 1 36 78"
            stroke="#1C1B1F"
            strokeWidth="1.0"
            strokeDasharray="2 2"
          />

          {/* 45-degree Radar Sweep Beam line */}
          <line
            x1="22"
            y1="78"
            x2="68"
            y2="32"
            stroke="#1C1B1F"
            strokeWidth="1.2"
            strokeDasharray="4 2"
          />
          <circle cx="68" cy="32" r="3.5" stroke="#1C1B1F" strokeWidth="1.2" />
          <circle cx="68" cy="32" r="1.5" fill="#1C1B1F" />

          {/* --- THE LETTER "L" STRUCTURE --- */}
          {/* Main Primary Pinstripe Stem & Foot */}
          <path
            d="M22 14V78H86"
            stroke="#1C1B1F"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Parallel Inner Pinstripe of the L */}
          <path
            d="M28 20V72H80"
            stroke="#1C1B1F"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Parallel Outer Hairline Guide */}
          <path
            d="M16 14V84H86"
            stroke="#1C1B1F"
            strokeWidth="1.0"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Pivot Vertex Eyelet */}
          <circle cx="22" cy="78" r="5" fill="#1C1B1F" />
          <circle cx="22" cy="78" r="2" fill="#FFFFFF" />
        </svg>
      )}

      {/* Concept 3: Circular Radar Reticle with Interlaced Pinstripe 'L' */}
      {variant === 'l-radar-reticle' && (
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0 transition-transform duration-200"
        >
          {/* Outer continuous circular radar casing */}
          <circle cx="50" cy="50" r="45" stroke="#1C1B1F" strokeWidth="1.8" />
          
          {/* Secondary concentric distance ring */}
          <circle cx="50" cy="50" r="36" stroke="#1C1B1F" strokeWidth="1.0" strokeDasharray="4 2" />

          {/* Inner concentric core ring */}
          <circle cx="50" cy="50" r="26" stroke="#1C1B1F" strokeWidth="1.4" />

          {/* Innermost micro target ring */}
          <circle cx="50" cy="50" r="15" stroke="#1C1B1F" strokeWidth="0.9" opacity="0.6" />

          {/* Radar Reticle Crosshair Ticks (North, South, East, West) */}
          <line x1="50" y1="5" x2="50" y2="15" stroke="#1C1B1F" strokeWidth="1.5" />
          <line x1="50" y1="85" x2="50" y2="95" stroke="#1C1B1F" strokeWidth="1.5" />
          <line x1="5" y1="50" x2="15" y2="50" stroke="#1C1B1F" strokeWidth="1.5" />
          <line x1="85" y1="50" x2="95" y2="50" stroke="#1C1B1F" strokeWidth="1.5" />

          {/* --- THE LETTER "L" EMBEDDED IN RETICLE --- */}
          {/* Triple-pinstripe stylized modern "L" */}
          <path
            d="M38 24V68H72"
            stroke="#1C1B1F"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M44 28V62H66"
            stroke="#1C1B1F"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Radar target lock point at intersection */}
          <circle cx="50" cy="50" r="3.5" fill="#1C1B1F" />
          <circle cx="50" cy="50" r="1.5" fill="#FFFFFF" />

          {/* Diagonal range quadrant marks */}
          <line x1="28" y1="28" x2="33" y2="33" stroke="#1C1B1F" strokeWidth="1.2" />
          <line x1="72" y1="28" x2="67" y2="33" stroke="#1C1B1F" strokeWidth="1.2" />
          <line x1="72" y1="72" x2="67" y2="67" stroke="#1C1B1F" strokeWidth="1.2" />
        </svg>
      )}

      {withWordmark && (
        <div className={`flex flex-col leading-none select-none ${wordmarkClassName}`}>
          <span className="font-black text-sm tracking-[0.2em] uppercase text-[#1C1B1F]">
            LOCUS
          </span>
          <span className="text-[9px] font-semibold tracking-wider text-gray-400 uppercase mt-0.5">
            Geofence Radar
          </span>
        </div>
      )}
    </div>
  );
};
