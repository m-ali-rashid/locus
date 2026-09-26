/**
 * src/App.tsx
 *
 * Core web application entry point for Locus:
 * - Tab navigation (Map, Reminders, Diagnostics)
 * - Geofence transition engine (Haversine boundary evaluation)
 * - Push & In-app notifications
 * - Persistent storage with seed data
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Map, Bell, Terminal, ShieldAlert, Sparkles } from 'lucide-react';
import type { Geofence } from './domain/entities/Geofence';
import type { Reminder } from './domain/entities/Reminder';
import type { PlaceSuggestion } from './domain/entities/PlaceSuggestion';
import {
  loadGeofences,
  saveGeofences,
  loadReminders,
  saveReminders,
} from './services/storageService';
import { calculateDistanceMetres, playAlertChime } from './services/geoUtils';
import { MapView } from './components/MapView';
import { PlaceSearchBar } from './components/PlaceSearchBar';
import { GeofenceSheet } from './components/GeofenceSheet';
import { RemindersScreen } from './components/RemindersScreen';
import { DiagnosticsModal } from './components/DiagnosticsModal';
import { SimulatorControls } from './components/SimulatorControls';
import { NotificationToast } from './components/NotificationToast';
import { LocusLogo, type LogoVariant } from './components/LocusLogo';
import { LogoShowcaseModal } from './components/LogoShowcaseModal';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'map' | 'reminders'>('map');
  const [activeLogoVariant, setActiveLogoVariant] = useState<LogoVariant>('l-radar-core');
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);

  // Core Data
  const [geofences, setGeofences] = useState<Geofence[]>(() => loadGeofences());
  const [reminders, setReminders] = useState<Reminder[]>(() => loadReminders());

  // User position & Pin selection
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>({
    latitude: 37.7749,
    longitude: -122.4194,
  });
  const [selectedPin, setSelectedPin] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedPlaceName, setSelectedPlaceName] = useState<string>('');
  const [radius, setRadius] = useState<number>(200);

  // Diagnostics & Simulation
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const [useRealGps, setUseRealGps] = useState(false);
  const [isSimulatingWalk, setIsSimulatingWalk] = useState(false);
  const [transitionLogs, setTransitionLogs] = useState<
    { timestamp: string; event: string; place: string }[]
  >([]);

  // Notifications
  const [activeToast, setActiveToast] = useState<{ reminder: Reminder; geofence?: Geofence } | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default',
  );

  // Track previous inside/outside state of each geofence
  const insideStatesRef = useRef<Record<string, boolean>>({});

  // Sync to storage
  useEffect(() => {
    saveGeofences(geofences);
  }, [geofences]);

  useEffect(() => {
    saveReminders(reminders);
  }, [reminders]);

  // Request browser notification permission
  const requestNotificationPermission = useCallback(async () => {
    if (typeof Notification !== 'undefined') {
      try {
        const perm = await Notification.requestPermission();
        setNotificationPermission(perm);
      } catch (err) {
        console.warn('Notification permission error:', err);
      }
    }
  }, []);

  // Real Geolocation Watcher
  useEffect(() => {
    if (!useRealGps || !navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setUserLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      (err) => {
        console.warn('Geolocation error:', err);
      },
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [useRealGps]);

  // Simulated Walk loop (moves user toward the first active geofence)
  useEffect(() => {
    if (!isSimulatingWalk || !userLocation) return;

    const targetGeofence = geofences.find((g) => g.isActive) || geofences[0];
    if (!targetGeofence) return;

    const interval = setInterval(() => {
      setUserLocation((curr) => {
        if (!curr) return null;
        const dLat = targetGeofence.latitude - curr.latitude;
        const dLng = targetGeofence.longitude - curr.longitude;
        const dist = Math.hypot(dLat, dLng);

        if (dist < 0.0001) {
          // Reached or passed target; nudge slightly past it
          return {
            latitude: curr.latitude + (Math.random() - 0.5) * 0.0002,
            longitude: curr.longitude + (Math.random() - 0.5) * 0.0002,
          };
        }

        // Step speed ~ 10-15m per second
        const step = 0.00012;
        return {
          latitude: curr.latitude + (dLat / dist) * step,
          longitude: curr.longitude + (dLng / dist) * step,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isSimulatingWalk, userLocation, geofences]);

  // Evaluate Geofences on Location or Geofence changes
  useEffect(() => {
    if (!userLocation) return;

    geofences.forEach((geofence) => {
      if (!geofence.isActive) return;

      const dist = calculateDistanceMetres(
        userLocation.latitude,
        userLocation.longitude,
        geofence.latitude,
        geofence.longitude,
      );

      const isInside = dist <= geofence.radius;
      const wasInside = insideStatesRef.current[geofence.id];

      // Initial observation initialization
      if (wasInside === undefined) {
        insideStatesRef.current[geofence.id] = isInside;
        return;
      }

      // Check for ENTER transition
      if (!wasInside && isInside) {
        insideStatesRef.current[geofence.id] = true;
        handleTransition(geofence, 'ENTER');
      }
      // Check for EXIT transition
      else if (wasInside && !isInside) {
        insideStatesRef.current[geofence.id] = false;
        handleTransition(geofence, 'EXIT');
      }
    });
  }, [userLocation, geofences]);

  // Fire transition reminders and notifications
  const handleTransition = (geofence: Geofence, eventType: 'ENTER' | 'EXIT') => {
    const timestamp = new Date().toLocaleTimeString();

    // Record log
    setTransitionLogs((prev) => [
      { timestamp, event: eventType, place: geofence.name },
      ...prev.slice(0, 49),
    ]);

    // Check if geofence is configured to trigger on this event
    if (!geofence.triggerOn.includes(eventType)) return;

    // Find active reminders for this geofence
    const matchedReminders = reminders.filter(
      (r) =>
        r.geofenceId === geofence.id &&
        r.status === 'active' &&
        (r.triggerEvent === eventType || geofence.triggerOn.includes(eventType)),
    );

    matchedReminders.forEach((reminder) => {
      // Update reminder lastTriggeredAt
      const nowIso = new Date().toISOString();
      setReminders((prev) =>
        prev.map((r) =>
          r.id === reminder.id ? { ...r, lastTriggeredAt: nowIso } : r,
        ),
      );

      // Play audio chime
      playAlertChime();

      // Show in-app banner toast
      setActiveToast({ reminder, geofence });

      // Trigger Web Push Notification if allowed
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        try {
          new Notification(reminder.title, {
            body: reminder.body || `You triggered a geofence at ${geofence.name}`,
            icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📍</text></svg>',
          });
        } catch (e) {
          console.warn('Native notification failed:', e);
        }
      }
    });
  };

  // Map interactions
  const handleMapClick = (coord: { latitude: number; longitude: number }) => {
    setSelectedPin(coord);
    setSelectedPlaceName('');
  };

  const handleSelectSuggestion = (place: PlaceSuggestion) => {
    setSelectedPin({ latitude: place.latitude, longitude: place.longitude });
    setSelectedPlaceName(place.name);
  };

  const handleSaveGeofence = (geofence: Geofence, reminder: Reminder) => {
    setGeofences((prev) => [geofence, ...prev]);
    setReminders((prev) => [reminder, ...prev]);
    setSelectedPin(null);
    setSelectedPlaceName('');
  };

  const handleToggleReminderStatus = (reminder: Reminder) => {
    setReminders((prev) =>
      prev.map((r) =>
        r.id === reminder.id
          ? { ...r, status: r.status === 'active' ? 'paused' : 'active' }
          : r,
      ),
    );
  };

  const handleDeleteReminder = (reminderId: string, geofenceId: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== reminderId));
    setGeofences((prev) => prev.filter((g) => g.id !== geofenceId));
  };

  const handleSelectSavedGeofence = (geo: Geofence) => {
    setSelectedPin({ latitude: geo.latitude, longitude: geo.longitude });
    setSelectedPlaceName(geo.name);
    setRadius(geo.radius);
  };

  const activeRemindersCount = reminders.filter((r) => r.status === 'active').length;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#F8F9FA] text-[#1C1B1F]">
      {/* Toast Notification Alert Banner */}
      <NotificationToast
        reminder={activeToast?.reminder ?? null}
        geofence={activeToast?.geofence}
        onDismiss={() => setActiveToast(null)}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {activeTab === 'map' ? (
          <>
            {/* Top Place Search Bar */}
            <PlaceSearchBar
              onSelectPlace={handleSelectSuggestion}
              onCenterUser={() => {
                if (userLocation) {
                  // Handled by map
                }
              }}
              userLocation={userLocation}
            />

            {/* Interactive Leaflet Canvas Map */}
            <MapView
              userLocation={userLocation}
              selectedPin={selectedPin}
              radius={radius}
              geofences={geofences}
              onMapClick={handleMapClick}
              onSelectGeofence={handleSelectSavedGeofence}
              selectedPlaceName={selectedPlaceName}
              onCenterUser={() => {
                if (!userLocation) {
                  setUserLocation({ latitude: 37.7749, longitude: -122.4194 });
                }
              }}
            />

            {/* Bottom Creation Sheet */}
            <GeofenceSheet
              place={selectedPin}
              initialName={selectedPlaceName}
              radius={radius}
              onRadiusChange={setRadius}
              onSave={handleSaveGeofence}
              onDismiss={() => {
                setSelectedPin(null);
                setSelectedPlaceName('');
              }}
            />

            {/* GPS Simulator Toolbar */}
            <SimulatorControls
              userLocation={userLocation}
              geofences={geofences}
              onSetLocation={setUserLocation}
              isSimulatingWalk={isSimulatingWalk}
              onToggleSimulateWalk={() => setIsSimulatingWalk((v) => !v)}
              useRealGps={useRealGps}
              onToggleUseRealGps={() => {
                setUseRealGps((v) => !v);
                if (!useRealGps) {
                  requestNotificationPermission();
                }
              }}
            />
          </>
        ) : (
          <RemindersScreen
            reminders={reminders}
            geofences={geofences}
            userLocation={userLocation}
            onToggleStatus={handleToggleReminderStatus}
            onDeleteReminder={handleDeleteReminder}
            onNavigateToMap={() => setActiveTab('map')}
          />
        )}
      </main>

      {/* Bottom Global Navigation Bar */}
      <nav className="h-16 bg-white/95 backdrop-blur-md border-t border-gray-200/80 px-4 sm:px-6 flex items-center justify-between z-[1010] shrink-0">
        <button
          onClick={() => setIsLogoModalOpen(true)}
          className="flex items-center gap-2.5 p-1.5 -ml-1.5 rounded-2xl hover:bg-gray-100 transition-colors text-left group"
          title="Click to view & select black pinstripe logo designs"
        >
          <div className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-200/80 flex items-center justify-center p-1 group-hover:border-black transition-colors shadow-2xs">
            <LocusLogo variant={activeLogoVariant} size={24} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-black text-sm tracking-[0.15em] text-[#1C1B1F]">
              LOCUS
            </span>
            <span className="text-[9px] font-bold text-purple-600 flex items-center gap-0.5 mt-0.5">
              <Sparkles className="w-2.5 h-2.5" />
              <span>Logo Design</span>
            </span>
          </div>
        </button>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'map'
                ? 'bg-[#1C1B1F] text-white shadow-xs'
                : 'text-gray-600 hover:text-black hover:bg-gray-100'
            }`}
          >
            <Map className="w-4 h-4" />
            <span>Map</span>
          </button>

          <button
            onClick={() => setActiveTab('reminders')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === 'reminders'
                ? 'bg-[#1C1B1F] text-white shadow-xs'
                : 'text-gray-600 hover:text-black hover:bg-gray-100'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Reminders</span>
            {activeRemindersCount > 0 && (
              <span
                className={`ml-0.5 text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  activeTab === 'reminders'
                    ? 'bg-purple-400 text-[#1C1B1F]'
                    : 'bg-[#1C1B1F] text-white'
                }`}
              >
                {activeRemindersCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDiagnosticsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-600 hover:text-black hover:bg-gray-100 transition-colors"
            title="System Diagnostics & Permissions"
          >
            <Terminal className="w-4 h-4 text-purple-600" />
            <span className="hidden sm:inline">Diagnostics</span>
          </button>
        </div>
      </nav>

      {/* Logo Showcase Modal */}
      <LogoShowcaseModal
        isOpen={isLogoModalOpen}
        onClose={() => setIsLogoModalOpen(false)}
        activeVariant={activeLogoVariant}
        onSelectVariant={setActiveLogoVariant}
      />

      {/* Diagnostics & Permissions Modal */}
      <DiagnosticsModal
        isOpen={isDiagnosticsOpen}
        onClose={() => setIsDiagnosticsOpen(false)}
        userLocation={userLocation}
        geofences={geofences}
        reminders={reminders}
        transitionLogs={transitionLogs}
        onRequestNotificationPermission={requestNotificationPermission}
        notificationPermission={notificationPermission}
      />
    </div>
  );
};
export default App;
