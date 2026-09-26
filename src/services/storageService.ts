/**
 * src/services/storageService.ts
 *
 * Local storage manager for Geofences and Reminders.
 * Seeds initial contextual reminder examples if storage is empty.
 */
import type { Geofence } from '../domain/entities/Geofence';
import type { Reminder } from '../domain/entities/Reminder';

const GEOFENCES_KEY = 'locus_geofences_v1';
const REMINDERS_KEY = 'locus_reminders_v1';

// Seed sample locations around San Francisco Financial / Market Street corridor
const INITIAL_GEOFENCES: Geofence[] = [
  {
    id: 'geo_seed_home',
    name: 'Home Sanctuary',
    latitude: 37.7749,
    longitude: -122.4194,
    radius: 200,
    triggerOn: ['ENTER', 'EXIT'],
    isActive: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'geo_seed_office',
    name: 'Design Studio',
    latitude: 37.7891,
    longitude: -122.4014,
    radius: 250,
    triggerOn: ['ENTER'],
    isActive: true,
    createdAt: new Date(Date.now() - 43200000).toISOString(),
  },
  {
    id: 'geo_seed_cafe',
    name: 'Artisan Coffee Roasters',
    latitude: 37.7694,
    longitude: -122.4285,
    radius: 150,
    triggerOn: ['ENTER'],
    isActive: true,
    createdAt: new Date(Date.now() - 21600000).toISOString(),
  },
];

const INITIAL_REMINDERS: Reminder[] = [
  {
    id: 'rem_seed_home',
    geofenceId: 'geo_seed_home',
    title: 'Home Sanctuary',
    body: 'Turn on evening lights and check mail',
    triggerEvent: 'ENTER',
    status: 'active',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'rem_seed_office',
    geofenceId: 'geo_seed_office',
    title: 'Design Studio',
    body: 'Review sprint deliverables and standup notes',
    triggerEvent: 'ENTER',
    status: 'active',
    createdAt: new Date(Date.now() - 43200000).toISOString(),
  },
  {
    id: 'rem_seed_cafe',
    geofenceId: 'geo_seed_cafe',
    title: 'Artisan Coffee Roasters',
    body: 'Grab a bag of whole-bean espresso for the week',
    triggerEvent: 'ENTER',
    status: 'active',
    createdAt: new Date(Date.now() - 21600000).toISOString(),
  },
];

export function loadGeofences(): Geofence[] {
  try {
    const raw = localStorage.getItem(GEOFENCES_KEY);
    if (!raw) {
      saveGeofences(INITIAL_GEOFENCES);
      return INITIAL_GEOFENCES;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load geofences:', err);
    return INITIAL_GEOFENCES;
  }
}

export function saveGeofences(geofences: Geofence[]): void {
  try {
    localStorage.setItem(GEOFENCES_KEY, JSON.stringify(geofences));
  } catch (err) {
    console.error('Failed to save geofences:', err);
  }
}

export function loadReminders(): Reminder[] {
  try {
    const raw = localStorage.getItem(REMINDERS_KEY);
    if (!raw) {
      saveReminders(INITIAL_REMINDERS);
      return INITIAL_REMINDERS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load reminders:', err);
    return INITIAL_REMINDERS;
  }
}

export function saveReminders(reminders: Reminder[]): void {
  try {
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
  } catch (err) {
    console.error('Failed to save reminders:', err);
  }
}
