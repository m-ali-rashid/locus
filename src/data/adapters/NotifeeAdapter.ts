/**
 * data/adapters/NotifeeAdapter.ts
 *
 * Implements the NotificationService port using @notifee/react-native.
 * Supports standard local push notifications as well as persistent,
 * loud geofence boundary alarms with custom sound channels and critical alerts.
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

const REMINDER_CHANNEL_ID = 'locus_reminders';
const REMINDER_CHANNEL_NAME = 'Reminders';

const ALARM_CHANNEL_ID = 'locus_alarms';
const ALARM_CHANNEL_NAME = 'Geofence Alarms';

export class NotifeeAdapter implements NotificationService {
  private static instance: NotifeeAdapter;
  private channelsCreated = false;

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
      criticalAlert: true,
    });
    return this.mapAuthStatus(settings.authorizationStatus);
  }

  async displayNotification(payload: NotificationPayload): Promise<string> {
    await this.ensureChannels();

    const isAlarm = payload.alertType === 'alarm';

    const id = await notifee.displayNotification({
      title: isAlarm ? `⏰ ALARM: ${payload.title}` : payload.title,
      body: payload.body,
      data: payload.data,
      ios: {
        sound: 'default',
        critical: isAlarm,
        criticalVolume: isAlarm ? 1.0 : undefined,
        interruptionLevel: isAlarm ? 'timeSensitive' : 'active',
      },
      android: {
        channelId: isAlarm ? ALARM_CHANNEL_ID : REMINDER_CHANNEL_ID,
        importance: AndroidImportance.HIGH,
        sound: isAlarm ? 'alarm' : 'default',
        loopSound: isAlarm,
        vibrationPattern: isAlarm ? [300, 600, 300, 600, 300, 600] : undefined,
        pressAction: { id: 'default' },
        actions: isAlarm
          ? [{ title: 'Dismiss Alarm', pressAction: { id: 'dismiss' } }]
          : undefined,
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

  private async ensureChannels(): Promise<void> {
    if (this.channelsCreated || Platform.OS !== 'android') {
      return;
    }

    // 1. Standard Notifications Channel
    await notifee.createChannel({
      id: REMINDER_CHANNEL_ID,
      name: REMINDER_CHANNEL_NAME,
      importance: AndroidImportance.HIGH,
      sound: 'default',
      vibration: true,
    });

    // 2. High-Priority Alarm Channel
    await notifee.createChannel({
      id: ALARM_CHANNEL_ID,
      name: ALARM_CHANNEL_NAME,
      importance: AndroidImportance.HIGH,
      sound: 'alarm',
      bypassDnd: true,
      vibration: true,
      vibrationPattern: [300, 600, 300, 600, 300, 600],
    });

    this.channelsCreated = true;
  }
}
