/**
 * presentation/hooks/useGeofences.ts
 *
 * CRUD hook — the presentation layer's single entry point for geofence operations.
 * Connected to global useGeofenceStore and Clean Architecture UseCases for instant
 * synchronization across all screens and tabs.
 */
import { useState, useEffect, useCallback } from 'react';
import type { Geofence } from '../../domain/entities/Geofence';
import { services } from '../../core/di/ServiceLocator';
import { AppError } from '../../core/errors/AppError';
import { useReminderStore } from '../state/useReminderStore';
import { useGeofenceStore } from '../state/useGeofenceStore';

interface UseGeofencesResult {
  geofences: Geofence[];
  isLoading: boolean;
  error: AppError | null;
  saveGeofence: (geofence: Geofence) => Promise<void>;
  deleteGeofence: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useGeofences(): UseGeofencesResult {
  const geofences = useGeofenceStore((s) => s.geofences);
  const setGeofences = useGeofenceStore((s) => s.setGeofences);
  const addGeofenceStore = useGeofenceStore((s) => s.addGeofence);
  const removeGeofenceStore = useGeofenceStore((s) => s.removeGeofence);
  const removeByGeofenceId = useReminderStore((s) => s.removeByGeofenceId);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const all = await services.geofenceRepository.findAll();
      setGeofences(all);
      setError(null);
    } catch (err) {
      setError(
        err instanceof AppError
          ? err
          : new AppError('LOAD_ERROR', 'Failed to load geofences.'),
      );
    } finally {
      setIsLoading(false);
    }
  }, [setGeofences]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveGeofence = useCallback(
    async (geofence: Geofence) => {
      setIsLoading(true);
      try {
        await services.saveGeofenceUseCase.execute(geofence);
        addGeofenceStore(geofence);
        setError(null);
      } catch (err) {
        setError(
          err instanceof AppError
            ? err
            : new AppError('SAVE_ERROR', 'Failed to save geofence.'),
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [addGeofenceStore],
  );

  const deleteGeofence = useCallback(
    async (id: string) => {
      setIsLoading(true);
      try {
        // Optimistically remove from global store so map pointer and reminder card vanish instantly
        removeGeofenceStore(id);
        removeByGeofenceId(id);

        await services.deleteGeofenceUseCase.execute(id);
        setError(null);
      } catch (err) {
        await refresh();
        setError(
          err instanceof AppError
            ? err
            : new AppError('DELETE_ERROR', 'Failed to delete geofence.'),
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [removeGeofenceStore, removeByGeofenceId, refresh],
  );

  return { geofences, isLoading, error, saveGeofence, deleteGeofence, refresh };
}
