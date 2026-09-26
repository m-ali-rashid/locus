/**
 * src/services/geoUtils.ts
 *
 * Geographic calculation utilities: Haversine distance, bounds,
 * and geofence inside/outside state evaluations.
 */

export interface LatLng {
  latitude: number;
  longitude: number;
}

/**
 * Calculates distance between two points in metres using Haversine formula
 */
export function calculateDistanceMetres(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371e3; // Earth radius in metres
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Formats distance cleanly (e.g. "45m", "1.2km")
 */
export function formatDistance(metres: number): string {
  if (metres < 1000) {
    return `${Math.round(metres)}m`;
  }
  return `${(metres / 1000).toFixed(1)}km`;
}

/**
 * Play an audible chime using Web Audio API when a reminder is triggered
 */
export function playAlertChime(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
    osc2.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.35); // D6

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start();
    osc2.start(ctx.currentTime + 0.15);
    osc1.stop(ctx.currentTime + 0.6);
    osc2.stop(ctx.currentTime + 0.6);
  } catch (err) {
    console.warn('Audio playback error:', err);
  }
}
