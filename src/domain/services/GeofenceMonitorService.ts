/**
 * domain/services/GeofenceMonitorService.ts
 *
 * Service port (interface) for registering/deregistering OS-level geofence regions.
 * The native implementation lives in data/adapters/GeofenceNativeBridge.ts.
 */
import type { Geofence, GeofenceEvent } from '../entities/Geofence';

export interface GeofenceTransition {
  geofenceId: string;
  event: GeofenceEvent;
  timestamp: string;
}

export type GeofenceTransitionCallback = (transition: GeofenceTransition) => void;

export interface GeofenceMonitorService {
  /**
   * Register a geofence with the OS. Replaces any existing registration with the same ID.
   * iOS: CLLocationManager.startMonitoring(for:)
   * Android: GeofencingClient.addGeofences()
   */
  register(geofence: Geofence): Promise<void>;

  /**
   * Deregister a geofence by ID. No-op if not registered.
   */
  deregister(id: string): Promise<void>;

  /**
   * Deregister all currently monitored geofences.
   */
  deregisterAll(): Promise<void>;

  /**
   * Subscribe to geofence transition events (ENTER/EXIT/DWELL).
   * Returns an unsubscribe function.
   */
  onTransition(callback: GeofenceTransitionCallback): () => void;
}
