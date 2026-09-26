/**
 * src/components/NotificationToast.tsx
 *
 * In-app notification card that pops down when a contextual reminder fires.
 */
import React from 'react';
import { Bell, X, MapPin } from 'lucide-react';
import type { Reminder } from '../domain/entities/Reminder';
import type { Geofence } from '../domain/entities/Geofence';

interface Props {
  reminder: Reminder | null;
  geofence?: Geofence;
  onDismiss: () => void;
}

export const NotificationToast: React.FC<Props> = ({
  reminder,
  geofence,
  onDismiss,
}) => {
  if (!reminder) return null;

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[2000] w-[92%] sm:w-[440px] animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="bg-[#1C1B1F] text-white rounded-2xl p-4 shadow-2xl border border-gray-700 flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center shrink-0 mt-0.5">
          <Bell className="w-5 h-5 text-white animate-bounce" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-purple-300 mb-0.5">
            <MapPin className="w-3 h-3" />
            <span className="uppercase tracking-wider">
              {geofence?.name || 'Geofence Trigger'}
            </span>
          </div>

          <h4 className="text-sm font-extrabold text-white truncate">
            {reminder.title}
          </h4>

          {reminder.body && (
            <p className="text-xs text-gray-300 mt-0.5 leading-relaxed line-clamp-2">
              {reminder.body}
            </p>
          )}
        </div>

        <button
          onClick={onDismiss}
          className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
