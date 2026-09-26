/**
 * core/background/HeadlessTaskHandler.ts
 *
 * Registered with react-native-background-fetch as the JS headless task.
 * Runs without a React component tree — no hooks, no context.
 *
 * Called by the OS when:
 *   - A geofence transition fires while app is terminated (Android)
 *   - Background fetch interval fires (both platforms)
 *
 * Registration: see index.js (project root) — BackgroundFetch.registerHeadlessTask(HeadlessTaskHandler)
 */
import BackgroundFetch from 'react-native-background-fetch';
import { services } from '../di/ServiceLocator';
import type { HeadlessEvent } from 'react-native-background-fetch';

export async function HeadlessTaskHandler(event: HeadlessEvent): Promise<void> {
  const taskId = event.taskId;
  const isTimeout = event.timeout;

  if (isTimeout) {
    console.warn('[HeadlessTask] Timed out — finishing early:', taskId);
    BackgroundFetch.finish(taskId);
    return;
  }

  try {
    // Re-register all persisted geofences with the OS on every background wake
    // (handles the case where the OS cleared them after app termination)
    const geofences = await services.geofenceRepository.findAll();
    await Promise.all(
      geofences
        .filter(g => g.isActive)
        .map(g => services.geofenceMonitor.register(g)),
    );

    console.log(`[HeadlessTask] Re-registered ${geofences.length} geofences`);
  } catch (err) {
    console.error('[HeadlessTask] Error:', err);
  } finally {
    BackgroundFetch.finish(taskId);
  }
}
