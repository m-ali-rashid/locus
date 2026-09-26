/**
 * data/adapters/GeofenceNativeBridge.ts
 *
 * Implements GeofenceMonitorService using a custom native module (LGGeofenceMonitor)
 * backed by CLLocationManager (iOS) and GeofencingClient (Android).
 *
 * Native module interface:
 *   LGGeofenceMonitor.register(config: NativeGeofenceConfig) → Promise<void>
 *   LGGeofenceMonitor.deregister(id: string)                 → Promise<void>
 *   LGGeofenceMonitor.deregisterAll()                        → Promise<void>
 *   DeviceEventEmitter event: 'LGGeofenceTransition'         → NativeTransitionEvent
 */
import { NativeModules, DeviceEventEmitter, Platform } from 'react-native';
import type {
  GeofenceMonitorService,
  GeofenceTransition,
  GeofenceTransitionCallback,
} from '../../domain/services/GeofenceMonitorService';
import type { Geofence } from '../../domain/entities/Geofence';

const { LGGeofenceMonitor } = NativeModules;

interface NativeGeofenceConfig {
  id: string;
  latitude: number;
  longitude: number;
  radius: number;
  notifyOnEntry: boolean;
  notifyOnExit: boolean;
  notifyOnDwell: boolean;
  dwellMillis?: number; // Android only
}

interface NativeTransitionEvent {
  geofenceId: string;
  event: 'ENTER' | 'EXIT' | 'DWELL';
  timestamp: string;
}

const NATIVE_EVENT = 'LGGeofenceTransition';

export class GeofenceNativeBridge implements GeofenceMonitorService {
  private static instance: GeofenceNativeBridge;

  static getInstance(): GeofenceNativeBridge {
    if (!GeofenceNativeBridge.instance) {
      GeofenceNativeBridge.instance = new GeofenceNativeBridge();
    }
    return GeofenceNativeBridge.instance;
  }

  async register(geofence: Geofence): Promise<void> {
    if (!LGGeofenceMonitor) {
      console.warn('[GeofenceNativeBridge] Native module not available — skipping register');
      return;
    }
    const config: NativeGeofenceConfig = {
      id: geofence.id,
      latitude: geofence.latitude,
      longitude: geofence.longitude,
      radius: geofence.radius,
      notifyOnEntry: geofence.triggerOn.includes('ENTER'),
      notifyOnExit: geofence.triggerOn.includes('EXIT'),
      notifyOnDwell: geofence.triggerOn.includes('DWELL'),
      ...(Platform.OS === 'android' && { dwellMillis: 30_000 }),
    };
    await LGGeofenceMonitor.register(config);
  }

  async deregister(id: string): Promise<void> {
    if (!LGGeofenceMonitor) return;
    await LGGeofenceMonitor.deregister(id);
  }

  async deregisterAll(): Promise<void> {
    if (!LGGeofenceMonitor) return;
    await LGGeofenceMonitor.deregisterAll();
  }

  async getAuthorizationStatus(): Promise<string> {
    if (Platform.OS === 'ios' && LGGeofenceMonitor?.getAuthorizationStatus) {
      return LGGeofenceMonitor.getAuthorizationStatus();
    }
    return 'notDetermined';
  }

  onTransition(callback: GeofenceTransitionCallback): () => void {
    const sub = DeviceEventEmitter.addListener(
      NATIVE_EVENT,
      (raw: NativeTransitionEvent) => {
        callback({
          geofenceId: raw.geofenceId,
          event: raw.event,
          timestamp: raw.timestamp ?? new Date().toISOString(),
        });
      },
    );
    return () => sub.remove();
  }
}
