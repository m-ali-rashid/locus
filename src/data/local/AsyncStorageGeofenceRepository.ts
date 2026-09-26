/**
 * data/local/AsyncStorageGeofenceRepository.ts
 *
 * Implements the GeofenceRepository port using AsyncStorage.
 * All geofences are stored as a single JSON blob under STORAGE_KEY.
 *
 * Step 1 — stub implementation using AsyncStorage (to be replaced with
 * MMKV or SQLite in Step 2 for performance).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Geofence } from '../../domain/entities/Geofence';
import type { GeofenceRepository } from '../../domain/repositories/GeofenceRepository';
import { AppError } from '../../core/errors/AppError';

const STORAGE_KEY = '@locus/geofences';

export class AsyncStorageGeofenceRepository implements GeofenceRepository {
  private static instance: AsyncStorageGeofenceRepository;

  static getInstance(): AsyncStorageGeofenceRepository {
    if (!AsyncStorageGeofenceRepository.instance) {
      AsyncStorageGeofenceRepository.instance =
        new AsyncStorageGeofenceRepository();
    }
    return AsyncStorageGeofenceRepository.instance;
  }

  async save(geofence: Geofence): Promise<void> {
    const all = await this.findAll();
    if (all.some(g => g.id === geofence.id)) {
      throw new AppError(
        'GEOFENCE_EXISTS',
        `Geofence with id ${geofence.id} already exists.`,
      );
    }
    await this.persist([...all, geofence]);
  }

  async findAll(): Promise<Geofence[]> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Geofence[]) : [];
    } catch {
      return [];
    }
  }

  async findById(id: string): Promise<Geofence | undefined> {
    const all = await this.findAll();
    return all.find(g => g.id === id);
  }

  async update(geofence: Geofence): Promise<void> {
    const all = await this.findAll();
    const idx = all.findIndex(g => g.id === geofence.id);
    if (idx === -1) {
      throw new AppError(
        'GEOFENCE_NOT_FOUND',
        `Geofence with id ${geofence.id} not found.`,
      );
    }
    const updated = [...all];
    updated[idx] = geofence;
    await this.persist(updated);
  }

  async delete(id: string): Promise<void> {
    const all = await this.findAll();
    await this.persist(all.filter(g => g.id !== id));
  }

  private async persist(geofences: Geofence[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(geofences));
  }
}
