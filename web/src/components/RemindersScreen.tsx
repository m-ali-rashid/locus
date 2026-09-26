/**
 * src/components/RemindersScreen.tsx
 *
 * Lists all contextual reminders:
 * - Active / Paused state toggles
 * - Live distance to geofence
 * - Trigger badges (↘ Arrive, ↗ Leave, ⇄ Both)
 * - Delete action
 * - Empty state with CTA
 */
import React from 'react';
import {
  Bell,
  MapPin,
  Pause,
  Play,
  Trash2,
  Clock,
  Compass,
  PlusCircle,
} from 'lucide-react';
import type { Reminder } from '../domain/entities/Reminder';
import type { Geofence } from '../domain/entities/Geofence';
import { calculateDistanceMetres, formatDistance } from '../services/geoUtils';
import { LocusLogo } from './LocusLogo';

interface Props {
  reminders: Reminder[];
  geofences: Geofence[];
  userLocation: { latitude: number; longitude: number } | null;
  onToggleStatus: (reminder: Reminder) => void;
  onDeleteReminder: (reminderId: string, geofenceId: string) => void;
  onNavigateToMap: () => void;
}

const EVENT_LABEL: Record<string, string> = {
  ENTER: '↘ Arrive',
  EXIT: '↗ Leave',
  DWELL: '⏱ Dwell',
};

export const RemindersScreen: React.FC<Props> = ({
  reminders,
  geofences,
  userLocation,
  onToggleStatus,
  onDeleteReminder,
  onNavigateToMap,
}) => {
  const geofenceMap = React.useMemo(() => {
    return Object.fromEntries(geofences.map((g) => [g.id, g]));
  }, [geofences]);

  return (
    <div className="flex-1 h-full overflow-y-auto bg-[#F8F9FA] p-4 sm:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-black text-[#1C1B1F] tracking-tight flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white border border-gray-200 shadow-2xs flex items-center justify-center p-1">
                <LocusLogo variant="l-radar-core" size={24} />
              </div>
              <span className="tracking-[0.12em]">LOCUS</span>
              <span className="text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md">
                Reminders
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Contextual notifications triggered by your geographical boundary
            </p>
          </div>

          <button
            onClick={onNavigateToMap}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 bg-[#1C1B1F] text-white rounded-xl text-xs font-bold shadow-md hover:bg-black transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Drop Pin on Map</span>
          </button>
        </div>

        {/* Empty State */}
        {reminders.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 rounded-3xl bg-white shadow-md border border-gray-100 flex items-center justify-center mb-4 p-2.5">
              <LocusLogo variant="l-radar-core" size={44} />
            </div>
            <h2 className="text-lg font-bold text-[#1C1B1F]">No active reminders</h2>
            <p className="text-sm text-gray-500 max-w-sm mt-1 mb-6 leading-relaxed">
              Open the Map tab and tap anywhere or search a place to create your
              first location-aware reminder.
            </p>
            <button
              onClick={onNavigateToMap}
              className="px-5 py-2.5 rounded-xl bg-[#1C1B1F] text-white text-xs font-bold shadow-md hover:bg-black transition-all"
            >
              Open Map View
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reminders.map((reminder) => {
              const geofence = geofenceMap[reminder.geofenceId];
              const isActive = reminder.status === 'active';

              let distanceText = '';
              let isInside = false;

              if (userLocation && geofence) {
                const dist = calculateDistanceMetres(
                  userLocation.latitude,
                  userLocation.longitude,
                  geofence.latitude,
                  geofence.longitude,
                );
                isInside = dist <= geofence.radius;
                distanceText = isInside
                  ? `Inside geofence (${formatDistance(dist)})`
                  : `${formatDistance(dist)} away`;
              }

              return (
                <div
                  key={reminder.id}
                  className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md border border-gray-100 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Place name + Trigger badge */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            isActive ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                        />
                        <span className="text-xs font-bold text-gray-500 truncate flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="truncate">
                            {geofence?.name || 'Custom Place'}
                          </span>
                        </span>
                      </div>

                      <span className="bg-gray-100 text-gray-800 text-[11px] font-extrabold px-2.5 py-1 rounded-lg shrink-0">
                        {EVENT_LABEL[reminder.triggerEvent] ?? reminder.triggerEvent}
                      </span>
                    </div>

                    {/* Title & Body */}
                    <h3 className="text-base font-extrabold text-[#1C1B1F] tracking-tight">
                      {reminder.title}
                    </h3>
                    {reminder.body && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                        {reminder.body}
                      </p>
                    )}

                    {/* Metadata: Distance & Last Triggered */}
                    <div className="mt-3.5 space-y-1">
                      {distanceText && (
                        <div
                          className={`text-[11px] font-semibold flex items-center gap-1.5 ${
                            isInside ? 'text-emerald-600 font-bold' : 'text-gray-500'
                          }`}
                        >
                          <Compass className="w-3.5 h-3.5" />
                          <span>{distanceText}</span>
                          {geofence && (
                            <span className="text-gray-400">
                              (radius: {geofence.radius}m)
                            </span>
                          )}
                        </div>
                      )}

                      {reminder.lastTriggeredAt && (
                        <div className="text-[11px] text-gray-400 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>
                            Triggered {new Date(reminder.lastTriggeredAt).toLocaleTimeString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions: Pause/Resume + Delete */}
                  <div className="flex items-center gap-2 mt-5 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => onToggleStatus(reminder)}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                        isActive
                          ? 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                          : 'bg-[#1C1B1F] hover:bg-black text-white'
                      }`}
                    >
                      {isActive ? (
                        <>
                          <Pause className="w-3.5 h-3.5" />
                          <span>Pause</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" />
                          <span>Resume</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => onDeleteReminder(reminder.id, reminder.geofenceId)}
                      className="p-2 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                      title="Delete reminder and geofence"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
