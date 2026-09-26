/**
 * presentation/state/useReminderStore.ts
 *
 * Zustand store for reminders, persisted via AsyncStorage.
 * Clean, portable, fully compliant with React Native 0.87 New Architecture.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Reminder } from '../../domain/entities/Reminder';

interface ReminderState {
  reminders: Reminder[];
  addReminder: (reminder: Reminder) => void;
  removeReminder: (id: string) => void;
  updateReminder: (reminder: Reminder) => void;
  removeByGeofenceId: (geofenceId: string) => void;
}

export const useReminderStore = create<ReminderState>()(
  persist(
    (set) => ({
      reminders: [],

      addReminder: (reminder) =>
        set((s) => ({ reminders: [...s.reminders, reminder] })),

      removeReminder: (id) =>
        set((s) => ({ reminders: s.reminders.filter((r) => r.id !== id) })),

      updateReminder: (reminder) =>
        set((s) => ({
          reminders: s.reminders.map((r) => (r.id === reminder.id ? reminder : r)),
        })),

      removeByGeofenceId: (geofenceId) =>
        set((s) => ({
          reminders: s.reminders.filter((r) => r.geofenceId !== geofenceId),
        })),
    }),
    {
      name: 'locus-reminder-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
