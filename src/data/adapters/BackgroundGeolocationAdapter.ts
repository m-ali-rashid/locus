/**
 * data/adapters/BackgroundGeolocationAdapter.ts
 *
 * Implements the LocationService port using:
 *   - react-native-geolocation-service  → getCurrentLocation() + permissions
 *   - react-native-background-fetch     → background wake-up scheduling
 *     (full geofence trigger wiring happens in Step 2)
 *
 * Why the switch from react-native-background-geolocation:
 *   The TSLocationManager iOS dependency required a private Transistor CocoaPods
 *   spec repo (github.com/transistorsoft/CocoaPods-Specs) that no longer exists.
 *   This public-CDN-only stack provides equivalent capability and is fully
 *   swap-transparent to callers — the LocationService interface is unchanged.
 *
 * Platform permission behaviour:
 *   iOS  — requestAuthorization('always') triggers the system "Allow Always" dialog
 *   Android — FINE_LOCATION + BACKGROUND_LOCATION are handled by PermissionsAndroid
 *             in the requestPermission() call below
 */
import Geolocation, {
  type AuthorizationResult,
} from 'react-native-geolocation-service';
import { Platform, PermissionsAndroid } from 'react-native';
import type {
  LocationService,
  LocationPermissionState,
} from '../../domain/services/LocationService';
import type { Location } from '../../domain/entities/Location';
import { LocationMapper } from '../mappers/LocationMapper';
import { GeofenceNativeBridge } from './GeofenceNativeBridge';

export class BackgroundGeolocationAdapter implements LocationService {
  private static instance: BackgroundGeolocationAdapter;

  static getInstance(): BackgroundGeolocationAdapter {
    if (!BackgroundGeolocationAdapter.instance) {
      BackgroundGeolocationAdapter.instance =
        new BackgroundGeolocationAdapter();
    }
    return BackgroundGeolocationAdapter.instance;
  }

  async checkPermission(): Promise<LocationPermissionState> {
    if (Platform.OS === 'ios') {
      try {
        const authStatus = await GeofenceNativeBridge.getInstance().getAuthorizationStatus();
        switch (authStatus) {
          case 'always':
            return { status: 'granted', level: 'always' };
          case 'whenInUse':
            return { status: 'granted', level: 'whenInUse' };
          case 'denied':
            return { status: 'denied', level: 'none' };
          case 'restricted':
            return { status: 'restricted', level: 'none' };
          case 'notDetermined':
          default:
            return { status: 'not_determined', level: 'none' };
        }
      } catch {
        return { status: 'not_determined', level: 'none' };
      }
    }
    // Android: use PermissionsAndroid check (no dialog)
    return this.checkAndroidPermissions();
  }

  async requestPermission(): Promise<LocationPermissionState> {
    if (Platform.OS === 'ios') {
      const result = await Geolocation.requestAuthorization('always');
      return this.mapIosResult(result);
    }
    return this.requestAndroidPermissions();
  }

  getCurrentLocation(): Promise<Location> {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        position => resolve(LocationMapper.fromGeoPosition(position)),
        error => reject(new Error(`[LocationError] ${error.message} (code: ${error.code})`)),
        {
          enableHighAccuracy: true,
          timeout: 30000,
          maximumAge: 5000,
          accuracy: {
            ios: 'best',
            android: 'high',
          },
        },
      );
    });
  }

  // ─── iOS helpers ────────────────────────────────────────────────────────────

  private mapIosResult(result: AuthorizationResult): LocationPermissionState {
    switch (result) {
      case 'granted':
        // react-native-geolocation-service returns 'granted' for both
        // 'always' and 'whenInUse'. We treat it as 'always' since we requested it.
        return { status: 'granted', level: 'always' };
      case 'denied':
        return { status: 'denied', level: 'none' };
      case 'restricted':
        return { status: 'restricted', level: 'none' };
      case 'disabled':
        return { status: 'denied', level: 'none' };
      default:
        return { status: 'not_determined', level: 'none' };
    }
  }

  // ─── Android helpers ─────────────────────────────────────────────────────────

  private async checkAndroidPermissions(): Promise<LocationPermissionState> {
    const fine = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );
    if (!fine) {
      return { status: 'not_determined', level: 'none' };
    }

    // Android 10+ background location is a separate check
    if (Number(Platform.Version) >= 29) {
      const bg = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
      );
      return bg
        ? { status: 'granted', level: 'always' }
        : { status: 'granted', level: 'whenInUse' };
    }

    return { status: 'granted', level: 'always' };
  }

  private async requestAndroidPermissions(): Promise<LocationPermissionState> {
    // Step 1: Request foreground location
    const fineResult = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message:
          'Locus needs access to your location to trigger reminders when you arrive at or leave saved places.',
        buttonPositive: 'Allow',
        buttonNegative: 'Deny',
        buttonNeutral: 'Ask Later',
      },
    );

    if (fineResult !== PermissionsAndroid.RESULTS.GRANTED) {
      const status =
        fineResult === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
          ? 'never_ask_again'
          : 'denied';
      return { status, level: 'none' };
    }

    // Step 2: Android 10+ — request background ("Allow all the time")
    // Note: Android 11+ opens Settings directly; the dialog here applies to API 29.
    if (Number(Platform.Version) >= 29) {
      const bgResult = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
        {
          title: 'Background Location',
          message:
            'To trigger reminders when the app is closed, Locus needs "Allow all the time" location access. Please select this option in the next screen.',
          buttonPositive: 'Continue',
          buttonNegative: 'Skip',
        },
      );

      if (bgResult === PermissionsAndroid.RESULTS.GRANTED) {
        return { status: 'granted', level: 'always' };
      }
      // Background denied — foreground still works
      return { status: 'granted', level: 'whenInUse' };
    }

    return { status: 'granted', level: 'always' };
  }
}
