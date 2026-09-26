/**
 * src/components/GeofenceSheet.tsx
 *
 * Floating modal / sheet for creating geofenced reminders.
 * Matches the Waynest minimalist aesthetic with:
 * - Category preset tiles (Home ⌂, Office 🏢, School 🎓)
 * - Place Name & Note inputs
 * - Radius boundary chips (100m, 200m, 500m, 1000m)
 * - Trigger selectors: Arrive, Leave, Both
 */
import React, { useState, useEffect } from 'react';
import { X, Bell, Compass, Check } from 'lucide-react';
import type { Geofence, GeofenceEvent } from '../domain/entities/Geofence';
import type { Reminder } from '../domain/entities/Reminder';

interface Props {
  place: { latitude: number; longitude: number } | null;
  initialName?: string;
  radius: number;
  onRadiusChange: (radius: number) => void;
  onSave: (geofence: Geofence, reminder: Reminder) => void;
  onDismiss: () => void;
}

const CATEGORY_PRESETS = [
  { label: 'Home', icon: '⌂', defaultMessage: 'Remember to unpack and relax' },
  { label: 'Office', icon: '🏢', defaultMessage: 'Check today’s standup agenda' },
  { label: 'School', icon: '🎓', defaultMessage: 'Pick up supplies and notebooks' },
];

const RADIUS_OPTIONS = [100, 200, 500, 1000];

export const GeofenceSheet: React.FC<Props> = ({
  place,
  initialName = '',
  radius,
  onRadiusChange,
  onSave,
  onDismiss,
}) => {
  const [name, setName] = useState(initialName);
  const [message, setMessage] = useState('');
  const [trigger, setTrigger] = useState<'ENTER' | 'EXIT' | 'BOTH'>('ENTER');

  useEffect(() => {
    if (initialName) {
      setName(initialName);
    }
  }, [initialName]);

  if (!place) return null;

  const handleSelectPreset = (cat: typeof CATEGORY_PRESETS[0]) => {
    setName(cat.label);
    if (!message) {
      setMessage(cat.defaultMessage);
    }
  };

  const handleSave = () => {
    if (!name.trim()) return;

    const now = new Date().toISOString();
    const geofenceId = `geo_${Date.now()}`;

    const triggerOn: GeofenceEvent[] =
      trigger === 'BOTH' ? ['ENTER', 'EXIT'] : [trigger];

    const geofence: Geofence = {
      id: geofenceId,
      name: name.trim(),
      latitude: place.latitude,
      longitude: place.longitude,
      radius,
      triggerOn,
      isActive: true,
      createdAt: now,
    };

    const reminder: Reminder = {
      id: `rem_${Date.now()}`,
      geofenceId,
      title: name.trim(),
      body: message.trim() || `Contextual reminder for ${name.trim()}`,
      triggerEvent: trigger === 'BOTH' ? 'ENTER' : trigger,
      status: 'active',
      createdAt: now,
    };

    onSave(geofence, reminder);
  };

  return (
    <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:left-6 z-[1050] flex flex-col justify-end sm:justify-start pointer-events-none">
      <div className="w-full sm:w-[440px] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-gray-100 p-6 pointer-events-auto max-h-[85vh] overflow-y-auto animate-in fade-in slide-in-from-bottom-6 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-extrabold text-[#1C1B1F] tracking-tight flex items-center gap-2">
              <Bell className="w-5 h-5 text-purple-600" />
              New Reminder
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Set a geofence trigger at selected location
            </p>
          </div>
          <button
            onClick={onDismiss}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Presets */}
        <div className="mt-4">
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
            Quick Categories
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {CATEGORY_PRESETS.map((cat) => {
              const isSelected = name.toLowerCase() === cat.label.toLowerCase();
              return (
                <button
                  key={cat.label}
                  type="button"
                  onClick={() => handleSelectPreset(cat)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
                    isSelected
                      ? 'bg-[#1C1B1F] text-white border-[#1C1B1F] shadow-sm'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-800 border-gray-200/70'
                  }`}
                >
                  <span className="text-xl mb-1">{cat.icon}</span>
                  <span className="text-xs font-bold tracking-tight">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Fields */}
        <div className="mt-4 space-y-3.5">
          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
              Place Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Brooklyn Coffee, Grocery Market…"
              maxLength={40}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-[#1C1B1F] placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
              Reminder Note
            </label>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What should Locus alert you about?"
              maxLength={120}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-[#1C1B1F] placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all"
            />
          </div>

          {/* Radius Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Radius Boundary
              </label>
              <span className="text-xs font-extrabold text-[#1C1B1F]">
                {radius}m
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {RADIUS_OPTIONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => onRadiusChange(r)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    radius === r
                      ? 'bg-[#1C1B1F] text-white border-[#1C1B1F]'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                  }`}
                >
                  {r}m
                </button>
              ))}
            </div>
          </div>

          {/* Trigger Condition */}
          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
              Trigger When I…
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'ENTER', label: '↘ Arrive' },
                  { id: 'EXIT', label: '↗ Leave' },
                  { id: 'BOTH', label: '⇄ Both' },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTrigger(t.id)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    trigger === t.id
                      ? 'bg-[#1C1B1F] text-white border-[#1C1B1F]'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 text-[11px] text-gray-400 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 shrink-0 text-gray-400" />
            <span>
              Coordinates: {place.latitude.toFixed(4)}, {place.longitude.toFixed(4)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex items-center gap-3">
          <button
            type="button"
            onClick={onDismiss}
            className="flex-1 py-3 px-4 rounded-xl text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-[#1C1B1F] hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            Save Reminder
          </button>
        </div>
      </div>
    </div>
  );
};
