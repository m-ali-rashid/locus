/**
 * presentation/hooks/useGeofences.ts
 *
 * CRUD hook — the presentation layer's single entry point for geofence operations.
 * Delegates to SaveGeofenceUseCase / DeleteGeofenceUseCase via ServiceLocator.
 */
import { useState, useEffect, useCallback } from 'react';
import type { Geofence } from '../../domain/entities/Geofence';
import { services } from '../../core/di/ServiceLocator';
import { AppError } from '../../core/errors/AppError';
import { useReminderStore } from '../state/useReminderStore';

interface UseGeofencesResult {
  geofences: Geofence[];
  isLoading: boolean;
  error: AppError | null;
  saveGeofence: (geofence: Geofence) => Promise<void>;
  deleteGeofence: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useGeofences(): UseGeofencesResult {
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const removeByGeofenceId = useReminderStore(s => s.removeByGeofenceId);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const all = await services.geofenceRepository.findAll();
      setGeofences(all);
      setError(null);
    } catch (err) {
      setError(err instanceof AppError ? err : new AppError('LOAD_ERROR', 'Failed to load geofences.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const saveGeofence = useCallback(async (geofence: Geofence) => {
    setIsLoading(true);
    try {
      await services.saveGeofenceUseCase.execute(geofence);
      setGeofences(prev => [...prev, geofence]);
      setError(null);
    } catch (err) {
      setError(err instanceof AppError ? err : new AppError('SAVE_ERROR', 'Failed to save geofence.'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteGeofence = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      await services.deleteGeofenceUseCase.execute(id);
      setGeofences(prev => prev.filter(g => g.id !== id));
      removeByGeofenceId(id);
      setError(null);
    } catch (err) {
      setError(err instanceof AppError ? err : new AppError('DELETE_ERROR', 'Failed to delete geofence.'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [removeByGeofenceId]);

  return { geofences, isLoading, error, saveGeofence, deleteGeofence, refresh };
}
