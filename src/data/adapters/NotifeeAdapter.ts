/**
 * data/adapters/NotifeeAdapter.ts
 *
 * Implements the NotificationService port using @notifee/react-native.
 * This is the ONLY file that imports from Notifee.
 *
 * Step 1 — stub implementation:
 *   checkPermission and requestPermission are fully implemented.
 *   displayNotification is wired up but channel setup will be expanded in Step 2.
 */
import notifee, {
  AndroidImportance,
  AuthorizationStatus,
} from '@notifee/react-native';
import { Platform } from 'react-native';
import type {
  NotificationService,
  NotificationPermissionStatus,
  NotificationPayload,
} from '../../domain/services/NotificationService';

const CHANNEL_ID = 'locus_reminders';
const CHANNEL_NAME = 'Reminders';

export class NotifeeAdapter implements NotificationService {
  private static instance: NotifeeAdapter;
  private channelCreated = false;

  static getInstance(): NotifeeAdapter {
    if (!NotifeeAdapter.instance) {
      NotifeeAdapter.instance = new NotifeeAdapter();
    }
    return NotifeeAdapter.instance;
  }

  async checkPermission(): Promise<NotificationPermissionStatus> {
    const settings = await notifee.getNotificationSettings();
    return this.mapAuthStatus(settings.authorizationStatus);
  }

  async requestPermission(): Promise<NotificationPermissionStatus> {
    const settings = await notifee.requestPermission({
      sound: true,
      badge: true,
      alert: true,
      criticalAlert: false,
    });
    return this.mapAuthStatus(settings.authorizationStatus);
  }

  async displayNotification(payload: NotificationPayload): Promise<string> {
    await this.ensureChannel();

    const id = await notifee.displayNotification({
      title: payload.title,
      body: payload.body,
      data: payload.data,
      android: {
        channelId: CHANNEL_ID,
        importance: AndroidImportance.HIGH,
        smallIcon: 'ic_notification',
        pressAction: { id: 'default' },
      },
    });
    return id;
  }

  async cancelNotification(id: string): Promise<void> {
    await notifee.cancelNotification(id);
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  private mapAuthStatus(
    status: AuthorizationStatus,
  ): NotificationPermissionStatus {
    switch (status) {
      case AuthorizationStatus.AUTHORIZED:
      case AuthorizationStatus.PROVISIONAL:
        return 'granted';
      case AuthorizationStatus.DENIED:
        return 'denied';
      default:
        return 'not_determined';
    }
  }

  private async ensureChannel(): Promise<void> {
    if (this.channelCreated || Platform.OS !== 'android') {
      return;
    }
    await notifee.createChannel({
      id: CHANNEL_ID,
      name: CHANNEL_NAME,
      importance: AndroidImportance.HIGH,
      vibration: true,
    });
    this.channelCreated = true;
  }
}
