/**
 * domain/repositories/GeofenceRepository.ts
 *
 * Repository port (interface) for persisting and querying Geofence entities.
 * Data layer provides the concrete implementation; domain layer stays pure.
 */
import type { Geofence } from '../entities/Geofence';

export interface GeofenceRepository {
  /** Persist a new geofence. Throws if ID already exists. */
  save(geofence: Geofence): Promise<void>;

  /** Retrieve all stored geofences. */
  findAll(): Promise<Geofence[]>;

  /** Retrieve a single geofence by ID. Returns undefined if not found. */
  findById(id: string): Promise<Geofence | undefined>;

  /** Update a geofence. Throws if ID does not exist. */
  update(geofence: Geofence): Promise<void>;

  /** Remove a geofence by ID. No-op if not found. */
  delete(id: string): Promise<void>;
}
