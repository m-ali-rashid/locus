/**
 * data/mappers/LocationMapper.ts
 *
 * Converts raw position objects from the geolocation library into
 * our domain Location entity, keeping native types out of domain/presentation.
 *
 * Supports react-native-geolocation-service's GeoPosition shape.
 */
import type { GeoPosition } from 'react-native-geolocation-service';
import type { Location } from '../../domain/entities/Location';

export class LocationMapper {
  /**
   * From react-native-geolocation-service GeoPosition
   * (timestamp is a Unix epoch number in ms)
   */
  static fromGeoPosition(raw: GeoPosition): Location {
    return {
      latitude: raw.coords.latitude,
      longitude: raw.coords.longitude,
      accuracy: raw.coords.accuracy,
      // GeoPosition.timestamp is epoch ms — convert to ISO-8601 string
      timestamp: new Date(raw.timestamp).toISOString(),
      altitude:
        raw.coords.altitude !== null ? raw.coords.altitude : undefined,
      speed:
        raw.coords.speed !== null ? raw.coords.speed : undefined,
    };
  }
}
