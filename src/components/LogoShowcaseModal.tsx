/**
 * src/components/LogoShowcaseModal.tsx
 *
 * Interactive visual presentation of the 3 black pinstriping minimal logo concepts for LOCUS.
 * Allows the user to inspect each design, toggle between concepts, test light/dark contrasts,
 * and view the design theory behind each.
 */
import React, { useState } from 'react';
import { X, Check, Sparkles, Layers, Compass, Target, Download } from 'lucide-react';
import { LocusLogo, type LogoVariant } from './LocusLogo';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  activeVariant: LogoVariant;
  onSelectVariant: (variant: LogoVariant) => void;
}

interface LogoConcept {
  id: LogoVariant;
  title: string;
  tagline: string;
  description: string;
  characteristics: string[];
}

const CONCEPTS: LogoConcept[] = [
  {
    id: 'concentric',
    title: 'The Concentric Geofence Radar',
    tagline: 'Radial boundaries, cardinal crosshairs & focal point',
    description:
      'Nested hairline pinstripe rings evoking radar sweeps and precision geofence boundaries (100m, 200m, 500m). Sliced by micro-gaps with cardinal crosshairs converging on a pinpoint locus.',
    characteristics: [
      'Ultra-fine 1.2px pinstripes with alternating dashed perimeter',
      'Orthogonal crosshair axes for cartographic precision',
      'Centered locus aperture symbolising exact contextual arrival',
    ],
  },
  {
    id: 'monogram',
    title: 'The Triple Pinstripe Pin',
    tagline: 'Contoured map pin with nested contour tracks',
    description:
      'A luxury automotive-inspired triple pinstripe contour that outlines the classic map pin droplet with nested negative space channels and a centered target eyelet.',
    characteristics: [
      'Triple-track parallel contours with precision corner radii',
      'Subtle dashed intermediate layer creating depth without shading',
      'Instantly recognisable location pin silhouette at micro sizes',
    ],
  },
  {
    id: 'meridian',
    title: 'The Meridian Coordinate Locus',
    tagline: 'Orthographic grid, diamond framing & coordinate axes',
    description:
      'Diamond-framed latitude and longitude elliptical pinstripes intersecting at the prime coordinate center. Evokes global navigation systems and celestial instruments.',
    characteristics: [
      '45-degree diamond bezel enclosing spherical meridians',
      'Dual elliptical pinstripes representing spatial awareness',
      'Technical instrument aesthetic with high-contrast minimalism',
    ],
  },
];

export const LogoShowcaseModal: React.FC<Props> = ({
  isOpen,
  onClose,
  activeVariant,
  onSelectVariant,
}) => {
  const [previewDark, setPreviewDark] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1300] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl border border-gray-100 p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-gray-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-800 text-[10px] font-extrabold uppercase tracking-wider mb-1.5">
              <Sparkles className="w-3 h-3 text-purple-600" />
              Design Exploration
            </div>
            <h2 className="text-xl font-black text-[#1C1B1F] tracking-tight">
              LOCUS — Black Pinstripe Minimal Logos
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Precision line art concepts designed for location-aware contextual computing
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contrast Preview Mode Toggle */}
        <div className="flex items-center justify-between mt-5 mb-3 px-1">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Select Active Brand Mark
          </span>
          <button
            onClick={() => setPreviewDark((d) => !d)}
            className="text-xs font-bold px-3 py-1 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {previewDark ? 'Switch to Light Cards' : 'Switch to Dark Cards'}
          </button>
        </div>

        {/* 3 Logo Cards */}
        <div className="space-y-4">
          {CONCEPTS.map((concept) => {
            const isSelected = activeVariant === concept.id;

            return (
              <div
                key={concept.id}
                onClick={() => onSelectVariant(concept.id)}
                className={`cursor-pointer rounded-2xl p-5 border-2 transition-all flex flex-col sm:flex-row items-center sm:items-start gap-5 ${
                  isSelected
                    ? 'border-[#1C1B1F] bg-gray-50/70 shadow-md ring-2 ring-black/5'
                    : 'border-gray-200/80 hover:border-gray-300 bg-white'
                }`}
              >
                {/* Logo Canvas Preview Box */}
                <div
                  className={`w-28 h-28 rounded-2xl flex items-center justify-center shrink-0 border transition-colors shadow-xs ${
                    previewDark
                      ? 'bg-[#1C1B1F] border-gray-800 text-white'
                      : 'bg-white border-gray-200 text-[#1C1B1F]'
                  }`}
                >
                  <div className={previewDark ? 'invert' : ''}>
                    <LocusLogo variant={concept.id} size={64} />
                  </div>
                </div>

                {/* Concept Details */}
                <div className="flex-1 text-center sm:text-left min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <h3 className="text-base font-extrabold text-[#1C1B1F] tracking-tight">
                      {concept.title}
                    </h3>
                    {isSelected && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-[#1C1B1F] px-2.5 py-0.5 rounded-full self-center sm:self-auto shadow-xs">
                        <Check className="w-3 h-3" /> Active
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-semibold text-purple-700 mb-2">
                    {concept.tagline}
                  </p>

                  <p className="text-xs text-gray-600 leading-relaxed mb-3">
                    {concept.description}
                  </p>

                  <div className="space-y-1">
                    {concept.characteristics.map((c, i) => (
                      <div
                        key={i}
                        className="text-[11px] text-gray-500 flex items-center gap-1.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                        <span>{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Wordmark Lockup Preview */}
        <div className="mt-6 p-4 rounded-2xl bg-gray-50 border border-gray-200/70 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <LocusLogo variant={activeVariant} size={40} withWordmark />
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#1C1B1F] hover:bg-black text-white text-xs font-bold shadow-md transition-all active:scale-95"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
