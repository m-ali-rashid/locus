/**
 * domain/use-cases/DeleteGeofenceUseCase.ts
 *
 * Removes a geofence from storage and deregisters it from the OS.
 * Also deletes all associated reminders.
 */
import type { GeofenceRepository } from '../repositories/GeofenceRepository';
import type { ReminderRepository } from '../repositories/ReminderRepository';
import type { GeofenceMonitorService } from '../services/GeofenceMonitorService';

export class DeleteGeofenceUseCase {
  constructor(
    private readonly geofenceRepo: GeofenceRepository,
    private readonly reminderRepo: ReminderRepository,
    private readonly monitor: GeofenceMonitorService,
  ) {}

  async execute(geofenceId: string): Promise<void> {
    // Deregister from OS first (safe even if registration is missing)
    await this.monitor.deregister(geofenceId);

    // Delete all reminders tied to this geofence
    const reminders = await this.reminderRepo.findByGeofenceId(geofenceId);
    await Promise.all(reminders.map(r => this.reminderRepo.delete(r.id)));

    // Remove the geofence itself
    await this.geofenceRepo.delete(geofenceId);
  }
}
