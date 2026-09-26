/**
 * domain/services/NotificationService.ts
 *
 * Service port (interface) for scheduling and displaying notifications and alarms.
 * Implementations live in data/adapters/ (backed by @notifee/react-native).
 */
export type NotificationPermissionStatus = 'granted' | 'denied' | 'not_determined';

export type AlertType = 'notification' | 'alarm';

export interface NotificationPayload {
  /** Notification / Alarm title */
  title: string;
  /** Notification body text */
  body: string;
  /** Delivery alert mode: standard notification vs persistent loud alarm */
  alertType?: AlertType;
  /** Arbitrary key-value data to attach (used for deep-linking) */
  data?: Record<string, string>;
}

export interface NotificationService {
  /**
   * Check whether the user has granted notification permission.
   */
  checkPermission(): Promise<NotificationPermissionStatus>;

  /**
   * Request notification permission.
   * iOS: shows system dialog (including sound, badge, alert, and critical alerts).
   * Android 13+: requests POST_NOTIFICATIONS.
   */
  requestPermission(): Promise<NotificationPermissionStatus>;

  /**
   * Display an immediate local notification or trigger an audible alarm.
   */
  displayNotification(payload: NotificationPayload): Promise<string>;

  /**
   * Cancel a previously scheduled or ringing notification by its ID.
   */
  cancelNotification(id: string): Promise<void>;
}
