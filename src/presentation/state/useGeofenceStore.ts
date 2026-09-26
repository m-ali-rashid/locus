/**
 * presentation/state/useGeofenceStore.ts
 *
 * Global Zustand store for Geofences, persisted via AsyncStorage.
 * Provides a single source of truth across MapWorkspaceScreen,
 * RemindersScreen, and background handlers.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Geofence } from '../../domain/entities/Geofence';

interface GeofenceState {
  geofences: Geofence[];
  setGeofences: (geofences: Geofence[]) => void;
  addGeofence: (geofence: Geofence) => void;
  removeGeofence: (id: string) => void;
  clearGeofences: () => void;
}

export const useGeofenceStore = create<GeofenceState>()(
  persist(
    (set) => ({
      geofences: [],

      setGeofences: (geofences) => set({ geofences }),

      addGeofence: (geofence) =>
        set((s) => ({
          geofences: [
            ...s.geofences.filter((g) => g.id !== geofence.id),
            geofence,
          ],
        })),

      removeGeofence: (id) =>
        set((s) => ({
          geofences: s.geofences.filter((g) => g.id !== id),
        })),

      clearGeofences: () => set({ geofences: [] }),
    }),
    {
      name: 'locus-geofence-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
