/**
 * presentation/hooks/useUserLocation.ts
 *
 * Subscribes to live device location for the map dot.
 * Cleans up the watcher on unmount.
 */
import { useState, useEffect } from 'react';
import Geolocation from 'react-native-geolocation-service';
import type { Location } from '../../domain/entities/Location';
import { LocationMapper } from '../../data/mappers/LocationMapper';

interface UseUserLocationResult {
  location: Location | null;
  isLocating: boolean;
  error: string | null;
}

export function useUserLocation(): UseUserLocationResult {
  const [location, setLocation] = useState<Location | null>(null);
  const [isLocating, setIsLocating] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const watchId = Geolocation.watchPosition(
      (position) => {
        setLocation(LocationMapper.fromGeoPosition(position));
        setIsLocating(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 10,
        accuracy: { ios: 'best', android: 'high' },
        showsBackgroundLocationIndicator: true,
      },
    );

    return () => Geolocation.clearWatch(watchId);
  }, []);

  return { location, isLocating, error };
}
