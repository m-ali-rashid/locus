/**
 * domain/use-cases/TriggerReminderUseCase.ts
 *
 * Called by the headless background task when the OS fires a geofence transition.
 * Finds all active reminders for the geofence, dispatches notifications,
 * and stamps lastTriggeredAt.
 *
 * This use-case runs in a headless JS context — no React, no hooks.
 */
import type { ReminderRepository } from '../repositories/ReminderRepository';
import type { NotificationService } from '../services/NotificationService';
import type { GeofenceTransition } from '../services/GeofenceMonitorService';
import type { Reminder } from '../entities/Reminder';

export class TriggerReminderUseCase {
  constructor(
    private readonly reminderRepo: ReminderRepository,
    private readonly notificationService: NotificationService,
  ) {}

  async execute(transition: GeofenceTransition): Promise<void> {
    const reminders = await this.reminderRepo.findByGeofenceId(
      transition.geofenceId,
    );

    const matching = reminders.filter(
      r => r.status === 'active' && r.triggerEvent === transition.event,
    );

    await Promise.all(matching.map(r => this.dispatchAndStamp(r, transition)));
  }

  private async dispatchAndStamp(
    reminder: Reminder,
    transition: GeofenceTransition,
  ): Promise<void> {
    await this.notificationService.displayNotification({
      title: reminder.title,
      body: reminder.body ?? '',
      data: {
        reminderId: reminder.id,
        geofenceId: reminder.geofenceId,
        event: transition.event,
      },
    });

    await this.reminderRepo.update({
      ...reminder,
      lastTriggeredAt: transition.timestamp,
    });
  }
}
