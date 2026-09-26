/**
 * domain/entities/Location.ts
 *
 * Core value object representing a geographic coordinate snapshot.
 * Immutable — create a new instance for each observation.
 */
export interface Location {
  /** WGS-84 latitude in decimal degrees */
  readonly latitude: number;
  /** WGS-84 longitude in decimal degrees */
  readonly longitude: number;
  /** Horizontal accuracy radius in metres (lower = more precise) */
  readonly accuracy: number;
  /** ISO-8601 timestamp of when the fix was recorded */
  readonly timestamp: string;
  /** Optional altitude in metres above sea level */
  readonly altitude?: number;
  /** Optional speed in m/s */
  readonly speed?: number;
}
