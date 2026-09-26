/**
 * domain/services/LocationService.ts
 *
 * Service port (interface) for interacting with the device location subsystem.
 * Implementations live in data/adapters/.
 */
import type { Location } from '../entities/Location';

export type PermissionStatus = 'granted' | 'denied' | 'restricted' | 'never_ask_again' | 'not_determined';

export type LocationPermissionLevel = 'whenInUse' | 'always' | 'none';

export interface LocationPermissionState {
  status: PermissionStatus;
  level: LocationPermissionLevel;
}

export interface LocationService {
  /**
   * Check the current location permission state without triggering
   * a system dialog.
   */
  checkPermission(): Promise<LocationPermissionState>;

  /**
   * Request location permission from the user.
   * On iOS: asks for "Always" authorization.
   * On Android: requests ACCESS_FINE_LOCATION + ACCESS_BACKGROUND_LOCATION.
   * Returns the resulting permission state after the dialog closes.
   */
  requestPermission(): Promise<LocationPermissionState>;

  /**
   * Fetch the device's current best location estimate.
   * Requires at minimum 'whenInUse' permission.
   */
  getCurrentLocation(): Promise<Location>;
}
