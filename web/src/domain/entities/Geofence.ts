/**
 * domain/entities/Geofence.ts
 *
 * Value object describing a named circular geographic region.
 * The app monitors this boundary and fires reminders on transitions.
 */
export type GeofenceEvent = 'ENTER' | 'EXIT' | 'DWELL';

export interface Geofence {
  /** Globally-unique identifier (UUID v4) */
  readonly id: string;
  /** Human-readable place name, e.g. "Home", "Office" */
  readonly name: string;
  /** Centre latitude (WGS-84) */
  readonly latitude: number;
  /** Centre longitude (WGS-84) */
  readonly longitude: number;
  /** Monitoring radius in metres (min 100m recommended by OS) */
  readonly radius: number;
  /** Which transitions trigger a reminder */
  readonly triggerOn: GeofenceEvent[];
  /** Whether this geofence is currently active */
  readonly isActive: boolean;
  /** ISO-8601 creation timestamp */
  readonly createdAt: string;
}
