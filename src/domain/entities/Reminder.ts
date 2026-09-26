/**
 * domain/entities/Reminder.ts
 *
 * Core business entity. A Reminder is attached to a Geofence
 * and is surfaced as a notification when the trigger fires.
 */
import type { GeofenceEvent } from './Geofence';

export type ReminderStatus = 'active' | 'paused' | 'completed';

export interface Reminder {
  /** Globally-unique identifier (UUID v4) */
  readonly id: string;
  /** ID of the associated Geofence */
  readonly geofenceId: string;
  /** Short title shown in the notification */
  readonly title: string;
  /** Optional longer description */
  readonly body?: string;
  /** Which geofence event fires this reminder */
  readonly triggerEvent: GeofenceEvent;
  /** Current lifecycle status */
  readonly status: ReminderStatus;
  /** ISO-8601 creation timestamp */
  readonly createdAt: string;
  /** ISO-8601 timestamp of last trigger (undefined if never fired) */
  readonly lastTriggeredAt?: string;
}
