/**
 * domain/use-cases/SaveGeofenceUseCase.ts
 *
 * Validates and persists a new geofence, then registers it with the OS monitor.
 */
import type { GeofenceRepository } from '../repositories/GeofenceRepository';
import type { GeofenceMonitorService } from '../services/GeofenceMonitorService';
import type { Geofence } from '../entities/Geofence';
import { AppError } from '../../core/errors/AppError';
import { APP_CONSTANTS } from '../../core/constants/AppConstants';

export class SaveGeofenceUseCase {
  constructor(
    private readonly repo: GeofenceRepository,
    private readonly monitor: GeofenceMonitorService,
  ) {}

  async execute(geofence: Geofence): Promise<void> {
    // Business rule: radius must be within OS-supported bounds
    if (geofence.radius < APP_CONSTANTS.GEOFENCE.MIN_RADIUS_METERS) {
      throw new AppError(
        'INVALID_RADIUS',
        `Radius must be at least ${APP_CONSTANTS.GEOFENCE.MIN_RADIUS_METERS}m.`,
      );
    }
    if (geofence.radius > APP_CONSTANTS.GEOFENCE.MAX_RADIUS_METERS) {
      throw new AppError(
        'INVALID_RADIUS',
        `Radius cannot exceed ${APP_CONSTANTS.GEOFENCE.MAX_RADIUS_METERS}m.`,
      );
    }
    // Business rule: must trigger on at least one event type
    if (geofence.triggerOn.length === 0) {
      throw new AppError(
        'INVALID_TRIGGER',
        'Geofence must trigger on at least one event (ENTER, EXIT, or DWELL).',
      );
    }

    await this.repo.save(geofence);
    await this.monitor.register(geofence);
  }
}
