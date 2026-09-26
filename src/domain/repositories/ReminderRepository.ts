/**
 * domain/repositories/ReminderRepository.ts
 *
 * Repository port (interface) for persisting and querying Reminder entities.
 */
import type { Reminder } from '../entities/Reminder';

export interface ReminderRepository {
  save(reminder: Reminder): Promise<void>;
  findAll(): Promise<Reminder[]>;
  findById(id: string): Promise<Reminder | undefined>;
  findByGeofenceId(geofenceId: string): Promise<Reminder[]>;
  update(reminder: Reminder): Promise<void>;
  delete(id: string): Promise<void>;
}
