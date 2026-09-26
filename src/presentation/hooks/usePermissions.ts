/**
 * presentation/hooks/usePermissions.ts
 *
 * React hook that exposes permission state and actions to the UI.
 * This is the ONLY presentation-layer entry point for permission logic.
 *
 * Consumers never import PermissionsOrchestrator or any adapter directly.
 */
import { useState, useEffect, useCallback } from 'react';
import { Linking } from 'react-native';
import { type PermissionBundle } from '../../core/permissions/PermissionsOrchestrator';
import { services } from '../../core/di/ServiceLocator';
import { AppError } from '../../core/errors/AppError';

type Status = 'idle' | 'checking' | 'requesting' | 'error';

interface UsePermissionsResult {
  status: Status;
  permissions: PermissionBundle | null;
  error: AppError | null;
  /** Re-check current state without showing dialogs */
  checkPermissions: () => Promise<void>;
  /** Show permission dialogs in sequence */
  requestPermissions: () => Promise<void>;
  /** Opens the app settings in OS settings */
  openSettings: () => Promise<void>;
}


export function usePermissions(): UsePermissionsResult {
  const [status, setStatus] = useState<Status>('idle');
  const [permissions, setPermissions] = useState<PermissionBundle | null>(null);
  const [error, setError] = useState<AppError | null>(null);

  const checkPermissions = useCallback(async () => {
    setStatus('checking');
    setError(null);
    try {
      const bundle = await services.permissionsOrchestrator.checkAll();
      setPermissions(bundle);
      setStatus('idle');
    } catch (err) {
      setError(
        err instanceof AppError
          ? err
          : new AppError('UNKNOWN', 'Failed to check permissions.'),
      );
      setStatus('error');
    }
  }, []);

  const requestPermissions = useCallback(async () => {
    setStatus('requesting');
    setError(null);
    try {
      const bundle = await services.permissionsOrchestrator.requestAll();
      setPermissions(bundle);
      setStatus('idle');
    } catch (err) {
      setError(
        err instanceof AppError
          ? err
          : new AppError('UNKNOWN', 'Failed to request permissions.'),
      );
      setStatus('error');
    }
  }, []);

  const openSettings = useCallback(async () => {
    try {
      await Linking.openSettings();
    } catch (err) {
      console.warn('Unable to open settings:', err);
    }
  }, []);

  // Auto-check on mount
  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  return { status, permissions, error, checkPermissions, requestPermissions, openSettings };
}
