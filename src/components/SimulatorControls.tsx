/**
 * src/components/SimulatorControls.tsx
 *
 * Floating bar allowing testing of geofence boundary transitions:
 * - Jump inside a selected geofence
 * - Simulate moving in or out
 * - Toggle browser live geolocation vs simulated position
 */
import React from 'react';
import { Play, Pause, Navigation, Radio, Check } from 'lucide-react';
import type { Geofence } from '../domain/entities/Geofence';
import { calculateDistanceMetres, formatDistance } from '../services/geoUtils';

interface Props {
  userLocation: { latitude: number; longitude: number } | null;
  geofences: Geofence[];
  onSetLocation: (loc: { latitude: number; longitude: number }) => void;
  isSimulatingWalk: boolean;
  onToggleSimulateWalk: () => void;
  useRealGps: boolean;
  onToggleUseRealGps: () => void;
}

export const SimulatorControls: React.FC<Props> = ({
  userLocation,
  geofences,
  onSetLocation,
  isSimulatingWalk,
  onToggleSimulateWalk,
  useRealGps,
  onToggleUseRealGps,
}) => {
  // Find nearest geofence
  const nearest: { geofence: Geofence; distance: number } | null = React.useMemo(() => {
    if (!userLocation || geofences.length === 0) return null;
    let minDistance = Infinity;
    let closest: Geofence | null = null;

    for (const g of geofences) {
      const d = calculateDistanceMetres(
        userLocation.latitude,
        userLocation.longitude,
        g.latitude,
        g.longitude,
      );
      if (d < minDistance) {
        minDistance = d;
        closest = g;
      }
    }

    return closest ? { geofence: closest, distance: minDistance } : null;
  }, [userLocation, geofences]);

  const jumpToGeofence = (geofence: Geofence, inside: boolean) => {
    if (inside) {
      // Position slightly inside the perimeter
      onSetLocation({
        latitude: geofence.latitude + (geofence.radius * 0.4) / 111320,
        longitude: geofence.longitude,
      });
    } else {
      // Position clearly outside the perimeter
      onSetLocation({
        latitude: geofence.latitude + (geofence.radius * 2.2) / 111320,
        longitude: geofence.longitude,
      });
    }
  };

  return (
    <div className="absolute bottom-16 sm:bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-[380px] z-[990]">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-xl border border-gray-100 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#1C1B1F]">
            <Radio className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
            <span>GPS Simulator & Testing</span>
          </div>

          <button
            onClick={onToggleUseRealGps}
            className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border transition-colors ${
              useRealGps
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-gray-100 text-gray-700 border-gray-200'
            }`}
          >
            {useRealGps ? 'Using Real GPS' : 'Manual / Sim'}
          </button>
        </div>

        {nearest && (
          <div className="text-[11px] text-gray-600 flex items-center justify-between bg-gray-50 px-2.5 py-1.5 rounded-xl border border-gray-100">
            <span className="truncate max-w-[170px] font-medium">
              Nearest: <strong>{nearest.geofence.name}</strong>
            </span>
            <span
              className={`font-bold ${
                nearest.distance <= nearest.geofence.radius
                  ? 'text-emerald-600'
                  : 'text-gray-500'
              }`}
            >
              {nearest.distance <= nearest.geofence.radius
                ? 'INSIDE'
                : formatDistance(nearest.distance)}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2">
          {nearest && (
            <>
              <button
                onClick={() => jumpToGeofence(nearest.geofence, true)}
                className="flex-1 py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-xl border border-emerald-200/60 transition-colors"
                title="Teleport coordinates inside the nearest geofence boundary"
              >
                Jump Inside
              </button>
              <button
                onClick={() => jumpToGeofence(nearest.geofence, false)}
                className="flex-1 py-1.5 px-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-[11px] font-bold rounded-xl transition-colors"
                title="Teleport coordinates outside the nearest geofence boundary"
              >
                Step Outside
              </button>
            </>
          )}

          <button
            onClick={onToggleSimulateWalk}
            className={`py-1.5 px-3 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors ${
              isSimulatingWalk
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-[#1C1B1F] hover:bg-black text-white'
            }`}
          >
            {isSimulatingWalk ? (
              <>
                <Pause className="w-3 h-3" />
                <span>Stop Walk</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3" />
                <span>Simulate Walk</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
