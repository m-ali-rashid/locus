/**
 * domain/services/NotificationService.ts
 *
 * Service port (interface) for scheduling and displaying notifications.
 * Implementations live in data/adapters/ (backed by @notifee/react-native).
 */
export type NotificationPermissionStatus = 'granted' | 'denied' | 'not_determined';

export interface NotificationPayload {
  /** Notification title */
  title: string;
  /** Notification body text */
  body: string;
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
   * iOS: shows system dialog.
   * Android 13+: requests POST_NOTIFICATIONS.
   */
  requestPermission(): Promise<NotificationPermissionStatus>;

  /**
   * Display an immediate local notification.
   */
  displayNotification(payload: NotificationPayload): Promise<string>;

  /**
   * Cancel a previously scheduled or displayed notification by its ID.
   */
  cancelNotification(id: string): Promise<void>;
}
