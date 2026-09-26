/**
 * core/constants/AppConstants.ts
 *
 * Application-wide constants. Add to this file; never scatter magic strings.
 */

export const APP_CONSTANTS = {
  // ─── Storage keys ────────────────────────────────────────────────────────
  STORAGE_KEYS: {
    GEOFENCES: '@locus/geofences',
    REMINDERS: '@locus/reminders',
    SETTINGS: '@locus/settings',
  },

  // ─── Geofencing ──────────────────────────────────────────────────────────
  GEOFENCE: {
    /** Minimum radius enforced by both iOS and Android OS (metres) */
    MIN_RADIUS_METERS: 100,
    /** Practical maximum for a "neighbourhood" scale reminder */
    MAX_RADIUS_METERS: 5000,
    /** iOS hard cap on simultaneous geofences */
    IOS_MAX_REGIONS: 20,
  },

  // ─── Notifications ───────────────────────────────────────────────────────
  NOTIFICATION: {
    CHANNEL_ID: 'locus_reminders',
    CHANNEL_NAME: 'Reminders',
  },

  // ─── Background geolocation ──────────────────────────────────────────────
  BACKGROUND_GEO: {
    /**
     * Transistor Software licence key.
     * TODO: Replace with react-native-config / environment variable injection
     * in Step 2. Development builds work without a key.
     */
    LICENSE_KEY: '' as string,
  },
} as const;
