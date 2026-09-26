/**
 * core/di/ServiceLocator.ts
 *
 * Manual dependency injection container.
 * Constructs and wires all singleton service instances once.
 * Presentation layer imports from here rather than calling getInstance() scattered everywhere.
 *
 * Usage:
 *   import { services } from '../../core/di/ServiceLocator';
 *   const bundle = await services.permissionsOrchestrator.checkAll();
 */
import { BackgroundGeolocationAdapter } from '../../data/adapters/BackgroundGeolocationAdapter';
import { NotifeeAdapter } from '../../data/adapters/NotifeeAdapter';
import { GeofenceNativeBridge } from '../../data/adapters/GeofenceNativeBridge';
import { AsyncStorageGeofenceRepository } from '../../data/local/AsyncStorageGeofenceRepository';
import { AsyncStorageReminderRepository } from '../../data/local/AsyncStorageReminderRepository';
import { PermissionsOrchestrator } from '../permissions/PermissionsOrchestrator';
import { SaveGeofenceUseCase } from '../../domain/use-cases/SaveGeofenceUseCase';
import { DeleteGeofenceUseCase } from '../../domain/use-cases/DeleteGeofenceUseCase';
import { TriggerReminderUseCase } from '../../domain/use-cases/TriggerReminderUseCase';
import { PhotonPlaceSearchAdapter } from '../../data/adapters/PhotonPlaceSearchAdapter';

// ─── Adapters (singletons) ────────────────────────────────────────────────────
const locationService     = BackgroundGeolocationAdapter.getInstance();
const notificationService = NotifeeAdapter.getInstance();
const geofenceMonitor     = GeofenceNativeBridge.getInstance();
const placeSearchService  = PhotonPlaceSearchAdapter.getInstance();

// ─── Repositories (singletons) ───────────────────────────────────────────────
const geofenceRepository = AsyncStorageGeofenceRepository.getInstance();
const reminderRepository = AsyncStorageReminderRepository.getInstance();

// ─── Use-cases ────────────────────────────────────────────────────────────────
const saveGeofenceUseCase = new SaveGeofenceUseCase(geofenceRepository, geofenceMonitor);
const deleteGeofenceUseCase = new DeleteGeofenceUseCase(geofenceRepository, reminderRepository, geofenceMonitor);
const triggerReminderUseCase = new TriggerReminderUseCase(reminderRepository, notificationService);

// ─── Orchestrators ────────────────────────────────────────────────────────────
const permissionsOrchestrator = new PermissionsOrchestrator(locationService, notificationService);

export const services = {
  // Adapters
  locationService,
  notificationService,
  geofenceMonitor,
  placeSearchService,
  // Repositories
  geofenceRepository,
  reminderRepository,
  // Use-cases
  saveGeofenceUseCase,
  deleteGeofenceUseCase,
  triggerReminderUseCase,
  // Orchestrators
  permissionsOrchestrator,
} as const;
