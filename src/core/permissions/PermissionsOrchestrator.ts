/**
 * core/permissions/PermissionsOrchestrator.ts
 *
 * Single entry point for all permission negotiations in the app.
 * Presentation layer talks only to this orchestrator — never to
 * native permission APIs directly.
 *
 * Design rationale:
 *   - Sequences the two required permissions (location → notification)
 *     so the OS dialogs appear in a predictable, user-friendly order.
 *   - Returns a unified PermissionBundle so the UI only needs one
 *     state object to decide what to render.
 */
import type { LocationService, LocationPermissionState } from '../../domain/services/LocationService';
import type { NotificationService, NotificationPermissionStatus } from '../../domain/services/NotificationService';
import { PermissionError } from '../errors/AppError';

export interface PermissionBundle {
  location: LocationPermissionState;
  notification: NotificationPermissionStatus;
  /** True when both location (always) and notification are granted */
  allGranted: boolean;
}

export class PermissionsOrchestrator {
  constructor(
    private readonly locationService: LocationService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Read current permission states without triggering any OS dialogs.
   */
  async checkAll(): Promise<PermissionBundle> {
    const [location, notification] = await Promise.all([
      this.locationService.checkPermission(),
      this.notificationService.checkPermission(),
    ]);

    return {
      location,
      notification,
      allGranted:
        location.level === 'always' && notification === 'granted',
    };
  }

  /**
   * Request both location and notification permissions in sequence.
   * Throws PermissionError if location is permanently denied (user
   * must visit OS Settings manually).
   */
  async requestAll(): Promise<PermissionBundle> {
    // 1. Request location first (more invasive, higher value to explain)
    const location = await this.locationService.requestPermission();

    if (
      location.status === 'denied' ||
      location.status === 'never_ask_again' ||
      location.status === 'restricted'
    ) {
      throw new PermissionError(
        'Location permission was denied. Please enable "Always" location access in your device Settings to use Locus.',
      );
    }

    // 2. Request notification permission
    const notification = await this.notificationService.requestPermission();

    return {
      location,
      notification,
      allGranted:
        location.level === 'always' && notification === 'granted',
    };
  }
}
