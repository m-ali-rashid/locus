/**
 * src/components/DiagnosticsModal.tsx
 *
 * Preserves the original HomeScreen debug & permission diagnostics:
 * - Geolocation permission status
 * - Web Notifications permission status
 * - Active Geofences counter
 * - Real-time transition event log
 * - Raw JSON diagnostics inspection
 */
import React from 'react';
import { X, CheckCircle2, AlertCircle, RefreshCw, Terminal, BellRing, MapPin } from 'lucide-react';
import type { Geofence } from '../domain/entities/Geofence';
import type { Reminder } from '../domain/entities/Reminder';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userLocation: { latitude: number; longitude: number } | null;
  geofences: Geofence[];
  reminders: Reminder[];
  transitionLogs: { timestamp: string; event: string; place: string }[];
  onRequestNotificationPermission: () => void;
  notificationPermission: NotificationPermission;
}

export const DiagnosticsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  userLocation,
  geofences,
  reminders,
  transitionLogs,
  onRequestNotificationPermission,
  notificationPermission,
}) => {
  if (!isOpen) return null;

  const hasLocation = !!userLocation;

  return (
    <div className="fixed inset-0 z-[1200] bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#11111B] text-[#CDD6F4] rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl border border-[#313244] p-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#313244]">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-5 h-5 text-purple-400" />
            <div>
              <h2 className="text-base font-extrabold text-white tracking-tight">
                System Diagnostics & Permissions
              </h2>
              <p className="text-xs text-[#6C7086]">
                Core monitoring and environmental status
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#6C7086] hover:text-white rounded-xl hover:bg-[#181825] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Permissions Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          <div className="bg-[#181825] border border-[#313244] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6C7086] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                Location
              </span>
              {hasLocation ? (
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md">
                  <CheckCircle2 className="w-3 h-3" /> Granted
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-md">
                  <AlertCircle className="w-3 h-3" /> Waiting
                </span>
              )}
            </div>
            <p className="text-xs text-[#BAC2DE]">
              {userLocation
                ? `${userLocation.latitude.toFixed(5)}, ${userLocation.longitude.toFixed(5)}`
                : 'Using simulated fallback or waiting for GPS'}
            </p>
          </div>

          <div className="bg-[#181825] border border-[#313244] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6C7086] flex items-center gap-1.5">
                <BellRing className="w-3.5 h-3.5 text-purple-400" />
                Notifications
              </span>
              {notificationPermission === 'granted' ? (
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md">
                  <CheckCircle2 className="w-3 h-3" /> Active
                </span>
              ) : (
                <button
                  onClick={onRequestNotificationPermission}
                  className="flex items-center gap-1 text-[11px] font-bold text-purple-400 hover:text-white bg-purple-950/60 hover:bg-purple-900/80 px-2.5 py-1 rounded-md transition-colors"
                >
                  Enable
                </button>
              )}
            </div>
            <p className="text-xs text-[#BAC2DE]">
              {notificationPermission === 'granted'
                ? 'Desktop / browser push alerts enabled'
                : 'Click Enable to receive background OS alerts'}
            </p>
          </div>
        </div>

        {/* Transition Event Logs */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6C7086]">
              Recent Transition Events ({transitionLogs.length})
            </span>
          </div>

          <div className="bg-[#181825] border border-[#313244] rounded-2xl p-3 max-h-40 overflow-y-auto font-mono text-xs">
            {transitionLogs.length === 0 ? (
              <p className="text-[#6C7086] italic text-center py-3">
                No geofence transitions recorded yet. Move closer to a geofence.
              </p>
            ) : (
              <div className="space-y-1.5">
                {transitionLogs.map((log, index) => (
                  <div key={index} className="flex items-center justify-between text-[#A6E3A1]">
                    <span>
                      [{log.timestamp}] <strong className="text-white">{log.event}</strong> — {log.place}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Raw State Debug Inspector */}
        <div className="mt-5">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6C7086] block mb-2">
            Raw State Snapshot
          </span>
          <div className="bg-[#181825] border border-[#313244] rounded-2xl p-3.5 font-mono text-[11px] text-[#A6E3A1] max-h-48 overflow-y-auto">
            <pre>
              {JSON.stringify(
                {
                  device: {
                    userLocation,
                    notifications: notificationPermission,
                    activeGeofencesCount: geofences.filter((g) => g.isActive).length,
                    remindersCount: reminders.length,
                  },
                  activeGeofences: geofences.map((g) => ({
                    id: g.id,
                    name: g.name,
                    radius: g.radius,
                    triggerOn: g.triggerOn,
                  })),
                },
                null,
                2,
              )}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
