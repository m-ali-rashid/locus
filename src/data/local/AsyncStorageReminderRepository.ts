/**
 * data/local/AsyncStorageReminderRepository.ts
 *
 * Implements the ReminderRepository port using AsyncStorage.
 * Fully compatible with React Native 0.87 New Architecture.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Reminder } from '../../domain/entities/Reminder';
import type { ReminderRepository } from '../../domain/repositories/ReminderRepository';
import { AppError } from '../../core/errors/AppError';

const STORAGE_KEY = '@locus/reminders';

export class AsyncStorageReminderRepository implements ReminderRepository {
  private static instance: AsyncStorageReminderRepository;

  static getInstance(): AsyncStorageReminderRepository {
    if (!AsyncStorageReminderRepository.instance) {
      AsyncStorageReminderRepository.instance =
        new AsyncStorageReminderRepository();
    }
    return AsyncStorageReminderRepository.instance;
  }

  async save(reminder: Reminder): Promise<void> {
    const all = await this.findAll();
    if (all.some(r => r.id === reminder.id)) {
      throw new AppError(
        'REMINDER_EXISTS',
        `Reminder with id ${reminder.id} already exists.`,
      );
    }
    await this.persist([...all, reminder]);
  }

  async findAll(): Promise<Reminder[]> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Reminder[]) : [];
    } catch {
      return [];
    }
  }

  async findById(id: string): Promise<Reminder | undefined> {
    const all = await this.findAll();
    return all.find(r => r.id === id);
  }

  async findByGeofenceId(geofenceId: string): Promise<Reminder[]> {
    const all = await this.findAll();
    return all.filter(r => r.geofenceId === geofenceId);
  }

  async update(reminder: Reminder): Promise<void> {
    const all = await this.findAll();
    const idx = all.findIndex(r => r.id === reminder.id);
    if (idx === -1) {
      throw new AppError(
        'REMINDER_NOT_FOUND',
        `Reminder with id ${reminder.id} not found.`,
      );
    }
    const updated = [...all];
    updated[idx] = reminder;
    await this.persist(updated);
  }

  async delete(id: string): Promise<void> {
    const all = await this.findAll();
    await this.persist(all.filter(r => r.id !== id));
  }

  private async persist(reminders: Reminder[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
  }
}
