/**
 * data/mappers/GeofenceMapper.ts
 *
 * Converts between domain Geofence entities and a platform-neutral
 * GeofenceConfig shape used by our Step 2 geofence service.
 *
 * Note: react-native-background-geolocation was removed (its private
 * CocoaPods spec repo no longer exists). Geofence monitoring in Step 2
 * will use the iOS CLLocationManager and Android Geofencing API directly
 * via a lightweight native bridge. This mapper defines the DTO contract.
 */
import type { Geofence } from '../../domain/entities/Geofence';

/** Platform-neutral geofence config passed to the native geofence service */
export interface GeofenceConfig {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  notifyOnEntry: boolean;
  notifyOnExit: boolean;
  notifyOnDwell: boolean;
  extras?: Record<string, string>;
}

export class GeofenceMapper {
  /** Domain → Native config DTO */
  static toConfig(geofence: Geofence): GeofenceConfig {
    return {
      id: geofence.id,
      name: geofence.name,
      latitude: geofence.latitude,
      longitude: geofence.longitude,
      radius: geofence.radius,
      notifyOnEntry: geofence.triggerOn.includes('ENTER'),
      notifyOnExit: geofence.triggerOn.includes('EXIT'),
      notifyOnDwell: geofence.triggerOn.includes('DWELL'),
      extras: { geofenceName: geofence.name },
    };
  }

  /** Native config DTO → Domain */
  static fromConfig(config: GeofenceConfig, now: string): Geofence {
    const triggerOn: Geofence['triggerOn'] = [];
    if (config.notifyOnEntry) triggerOn.push('ENTER');
    if (config.notifyOnExit) triggerOn.push('EXIT');
    if (config.notifyOnDwell) triggerOn.push('DWELL');

    return {
      id: config.id,
      name: config.name,
      latitude: config.latitude,
      longitude: config.longitude,
      radius: config.radius,
      triggerOn,
      isActive: true,
      createdAt: now,
    };
  }
}
