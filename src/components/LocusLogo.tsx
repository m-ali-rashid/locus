/**
 * src/components/LocusLogo.tsx
 *
 * Black Pinstripe Minimalist Logo for LOCUS.
 * Features 3 vector pinstripe concepts crafted with precision line art:
 *
 * 1. 'concentric' (Default): Concentric geofence radar rings with precision crosshair ticks
 * 2. 'monogram': Parallel triple-pinstripe ribbon looping into an 'L' and pin drop
 * 3. 'meridian': Precision celestial compass and coordinate locus grid
 */
import React from 'react';

export type LogoVariant = 'concentric' | 'monogram' | 'meridian';

interface Props {
  variant?: LogoVariant;
  size?: number;
  className?: string;
  withWordmark?: boolean;
  wordmarkClassName?: string;
}

export const LocusLogo: React.FC<Props> = ({
  variant = 'concentric',
  size = 32,
  className = '',
  withWordmark = false,
  wordmarkClassName = '',
}) => {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Concept 1: Concentric Pinstripe Geofence Radar */}
      {variant === 'concentric' && (
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0 transition-transform duration-200"
        >
          {/* Outer hairline ring */}
          <circle cx="50" cy="50" r="44" stroke="#1C1B1F" strokeWidth="1.2" strokeDasharray="6 3" />
          
          {/* Secondary concentric boundary ring */}
          <circle cx="50" cy="50" r="35" stroke="#1C1B1F" strokeWidth="1.8" />
          
          {/* Intermediate pinstripe ring */}
          <circle cx="50" cy="50" r="26" stroke="#1C1B1F" strokeWidth="1.2" />

          {/* Core focal boundary ring */}
          <circle cx="50" cy="50" r="16" stroke="#1C1B1F" strokeWidth="2.2" />

          {/* Focal Center Locus Point */}
          <circle cx="50" cy="50" r="4.5" fill="#1C1B1F" />
          <circle cx="50" cy="50" r="1.5" fill="#FFFFFF" />

          {/* Pinstripe Crosshair Axis Lines */}
          <line x1="50" y1="2" x2="50" y2="20" stroke="#1C1B1F" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="50" y1="80" x2="50" y2="98" stroke="#1C1B1F" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="2" y1="50" x2="20" y2="50" stroke="#1C1B1F" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="80" y1="50" x2="98" y2="50" stroke="#1C1B1F" strokeWidth="1.5" strokeLinecap="round" />

          {/* Precision Cardinal Micro Ticks */}
          <line x1="50" y1="31" x2="50" y2="39" stroke="#1C1B1F" strokeWidth="1.5" />
          <line x1="50" y1="61" x2="50" y2="69" stroke="#1C1B1F" strokeWidth="1.5" />
          <line x1="31" y1="50" x2="39" y2="50" stroke="#1C1B1F" strokeWidth="1.5" />
          <line x1="61" y1="50" x2="69" y2="50" stroke="#1C1B1F" strokeWidth="1.5" />

          {/* Diagonal Corner Guides */}
          <line x1="22" y1="22" x2="27" y2="27" stroke="#1C1B1F" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="78" y1="22" x2="73" y2="27" stroke="#1C1B1F" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="22" y1="78" x2="27" y2="73" stroke="#1C1B1F" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="78" y1="78" x2="73" y2="73" stroke="#1C1B1F" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      )}

      {/* Concept 2: Geometric Triple Pinstripe Pin ("L" + Drop) */}
      {variant === 'monogram' && (
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0 transition-transform duration-200"
        >
          {/* Outer pinstripe contour */}
          <path
            d="M50 8C33.43 8 20 21.43 20 38C20 58 50 90 50 90C50 90 80 58 80 38C80 21.43 66.57 8 50 8Z"
            stroke="#1C1B1F"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Middle nested pinstripe contour */}
          <path
            d="M50 16C37.85 16 28 25.85 28 38C28 53 50 78 50 78C50 78 72 53 72 38C72 25.85 62.15 16 50 16Z"
            stroke="#1C1B1F"
            strokeWidth="1.2"
            strokeDasharray="4 2"
          />

          {/* Inner core pinstripe contour */}
          <path
            d="M50 24C42.27 24 36 30.27 36 38C36 48 50 66 50 66C50 66 64 48 64 38C64 30.27 57.73 24 50 24Z"
            stroke="#1C1B1F"
            strokeWidth="2"
          />

          {/* Center Target Eyelet */}
          <circle cx="50" cy="38" r="6" stroke="#1C1B1F" strokeWidth="1.6" />
          <circle cx="50" cy="38" r="2" fill="#1C1B1F" />
        </svg>
      )}

      {/* Concept 3: Meridian Coordinate Grid & Compass Locus */}
      {variant === 'meridian' && (
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0 transition-transform duration-200"
        >
          {/* Framed Diamond Perimeter */}
          <rect x="50" y="8" width="59.4" height="59.4" transform="rotate(45 50 8)" stroke="#1C1B1F" strokeWidth="1.2" />

          {/* Latitude & Longitude elliptical pinstripes */}
          <circle cx="50" cy="50" r="38" stroke="#1C1B1F" strokeWidth="1.8" />
          <ellipse cx="50" cy="50" rx="38" ry="18" stroke="#1C1B1F" strokeWidth="1.2" />
          <ellipse cx="50" cy="50" rx="18" ry="38" stroke="#1C1B1F" strokeWidth="1.2" />

          {/* Horizontal and Vertical Meridian Pinstripes */}
          <line x1="12" y1="50" x2="88" y2="50" stroke="#1C1B1F" strokeWidth="1.5" />
          <line x1="50" y1="12" x2="50" y2="88" stroke="#1C1B1F" strokeWidth="1.5" />

          {/* Focal Central Point */}
          <circle cx="50" cy="50" r="4.5" fill="#1C1B1F" />
          <circle cx="50" cy="50" r="1.5" fill="#FFFFFF" />
        </svg>
      )}

      {withWordmark && (
        <div className={`flex flex-col leading-none select-none ${wordmarkClassName}`}>
          <span className="font-black text-sm tracking-[0.2em] uppercase text-[#1C1B1F]">
            LOCUS
          </span>
          <span className="text-[9px] font-semibold tracking-wider text-gray-400 uppercase mt-0.5">
            Geofence OS
          </span>
        </div>
      )}
    </div>
  );
};
