/**
 * domain/entities/Reminder.ts
 *
 * Core business entity for location-triggered reminders.
 * Attached to a geographical locus (latitude, longitude, radius)
 * and triggered by transition boundaries.
 */
import type { GeofenceEvent } from './Geofence';

export type TransitionType = 'ENTER' | 'EXIT';
export type ReminderStatus = 'active' | 'paused' | 'completed';

export interface Reminder {
  /** Globally-unique identifier (UUID v4) */
  readonly id: string;
  /** Short title describing the contextual reminder */
  readonly title: string;
  /** Center latitude of the geofence */
  readonly latitude: number;
  /** Center longitude of the geofence */
  readonly longitude: number;
  /** Monitoring radius in meters (min: 50m, max: 1000m) */
  readonly radius: number;
  /** Which transition boundary triggers this reminder */
  readonly transitionType: TransitionType;
  /** ID of the associated native Geofence */
  readonly geofenceId: string;
  /** Which geofence event fires this reminder */
  readonly triggerEvent: GeofenceEvent | TransitionType;
  /** Current lifecycle status */
  readonly status: ReminderStatus;
  /** ISO-8601 creation timestamp */
  readonly createdAt: string;
  /** Optional detailed note or message body */
  readonly body?: string;
  /** Delivery alert mode: standard notification vs loud persistent alarm */
  readonly alertType?: 'notification' | 'alarm';
  /** ISO-8601 timestamp of last trigger */
  readonly lastTriggeredAt?: string;
}
