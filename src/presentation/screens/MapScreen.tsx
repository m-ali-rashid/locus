/**
 * presentation/screens/MapScreen.tsx
 *
 * Full-screen map matching the Waynest design:
 * - High-key minimalist light styling
 * - Floating white search bar with menu button & GPS crosshair
 * - Right floating control stack (layers, zoom, navigation compass)
 * - Custom concentric ring target pins with dark pill labels
 * - Lavender geofence circle preview and dashed route polyline
 * - White bottom sheet with Home/Office/School category presets
 */
import React, { useState, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  Keyboard,
  TouchableOpacity,
  Platform,
} from 'react-native';
import MapView, {
  LongPressEvent,
  MapPressEvent,
  Marker,
  Circle,
  Polyline,
  UrlTile,
  PROVIDER_DEFAULT,
  UserLocationChangeEvent,
} from 'react-native-maps';
import { GeofenceCircle } from '../components/GeofenceCircle';
import { GeofenceSheet } from '../components/GeofenceSheet';
import { PlaceSearchBar } from '../components/PlaceSearchBar';
import { useGeofences } from '../hooks/useGeofences';
import { usePlaceSearch } from '../hooks/usePlaceSearch';
import { usePermissions } from '../hooks/usePermissions';
import { useReminderStore } from '../state/useReminderStore';
import type { Geofence } from '../../domain/entities/Geofence';
import type { Reminder } from '../../domain/entities/Reminder';
import type { PlaceSuggestion } from '../../domain/entities/PlaceSuggestion';

interface PinCoord {
  latitude: number;
  longitude: number;
}

const INITIAL_REGION = {
  latitude: 37.7749,
  longitude: -122.4194,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const LIGHT_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#F8F9FA' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#71717A' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#FFFFFF' }] },
  { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#F1F3F5' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#8E8E93' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#FFFFFF' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#EBECEF' }] },
  { featureType: 'road.arterial', elementType: 'labels.text.fill', stylers: [{ color: '#71717A' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#E4E7EB' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#D8DCE2' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#EAF0F8' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#9AA7B6' }] },
];

export const MapScreen: React.FC = () => {
  const mapRef = useRef<MapView>(null);
  const [pin, setPin] = useState<PinCoord | null>(null);
  const [radius, setRadius] = useState<number>(200);
  const [prefilledName, setPrefilledName] = useState<string>('');
  const [userCoord, setUserCoord] = useState<PinCoord | null>(null);

  const { geofences, saveGeofence, deleteGeofence, isLoading } = useGeofences();
  const addReminder = useReminderStore((s) => s.addReminder);
  const { permissions } = usePermissions();
  const hasLocationPermission = permissions?.location.status === 'granted';

  // Place autocomplete search hook
  const {
    query,
    setQuery,
    suggestions,
    isSearching,
    clear: clearSearch,
  } = usePlaceSearch({
    proximity: userCoord,
  });

  const handleMapPress = useCallback((e: MapPressEvent) => {
    Keyboard.dismiss();
    if (suggestions.length > 0) {
      clearSearch();
      return;
    }
    setPrefilledName('');
    setPin(e.nativeEvent.coordinate);
  }, [suggestions.length, clearSearch]);

  const handleLongPress = useCallback((e: LongPressEvent) => {
    Keyboard.dismiss();
    clearSearch();
    setPrefilledName('');
    setPin(e.nativeEvent.coordinate);
  }, [clearSearch]);

  const handleSelectSuggestion = useCallback(
    (suggestion: PlaceSuggestion) => {
      Keyboard.dismiss();
      clearSearch();

      const targetCoord = {
        latitude: suggestion.latitude,
        longitude: suggestion.longitude,
      };

      setPin(targetCoord);
      setPrefilledName(suggestion.name);

      mapRef.current?.animateToRegion(
        {
          ...targetCoord,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        800,
      );
    },
    [clearSearch],
  );

  const centerOnUserLocation = useCallback(() => {
    if (userCoord) {
      mapRef.current?.animateToRegion(
        {
          ...userCoord,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        },
        800,
      );
    }
  }, [userCoord]);

  const handleSave = useCallback(
    async (geofence: Geofence, reminder: Reminder) => {
      try {
        await saveGeofence(geofence);
        addReminder(reminder);
        setPin(null);
        setPrefilledName('');
      } catch {
        // error surfaced in useGeofences
      }
    },
    [saveGeofence, addReminder],
  );

  const handleDismiss = useCallback(() => {
    setPin(null);
    setPrefilledName('');
  }, []);

  const handleUserLocationChange = useCallback((e: UserLocationChangeEvent) => {
    if (!e.nativeEvent.coordinate) return;
    const coord = e.nativeEvent.coordinate;
    setUserCoord({ latitude: coord.latitude, longitude: coord.longitude });
  }, []);

  return (
    <View style={styles.container}>
      {/* Floating place search bar & menu */}
      <PlaceSearchBar
        query={query}
        onChangeQuery={setQuery}
        suggestions={suggestions}
        isSearching={isSearching}
        onSelectSuggestion={handleSelectSuggestion}
        onClear={clearSearch}
        onCenterUserLocation={centerOnUserLocation}
      />

      {/* Floating Right Controls (Layers, Navigation) */}
      <View style={styles.floatingControls}>
        <TouchableOpacity style={styles.fabBtn} activeOpacity={0.8}>
          <Text style={styles.fabIcon}>❖</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.fabBtn} activeOpacity={0.8}>
          <Text style={styles.fabIcon}>🔍</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={centerOnUserLocation}
          activeOpacity={0.85}
        >
          <Text style={styles.navIcon}>➤</Text>
        </TouchableOpacity>
      </View>

      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_DEFAULT}
        initialRegion={INITIAL_REGION}
        userInterfaceStyle="light"
        mapType="mutedStandard"
        showsUserLocation={hasLocationPermission}
        followsUserLocation={false}
        onPress={handleMapPress}
        onLongPress={handleLongPress}
        onUserLocationChange={handleUserLocationChange}
      >
        {/* Monochromatic white & light grey tile layer (ArcGIS Light Gray Canvas) */}
        <UrlTile
          urlTemplate="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
          maximumZ={19}
          flipY={false}
          zIndex={-2}
        />
        <UrlTile
          urlTemplate="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
          maximumZ={19}
          flipY={false}
          zIndex={-1}
        />
        {/* Active Pin / Pointer & Radius Preview */}
        {pin && (
          <>
            <Marker
              coordinate={pin}
              draggable
              onDragEnd={(e) => setPin(e.nativeEvent.coordinate)}
              anchor={{ x: 0.5, y: 0.7 }}
            >
              <View style={styles.activeMarkerWrap}>
                <View style={styles.markerPill}>
                  <Text style={styles.markerPillText} numberOfLines={1}>
                    {prefilledName || 'Selected Location'}
                  </Text>
                  <Text style={styles.markerPillArrow}>▼</Text>
                </View>
                <View style={styles.markerPillTriangle} />
                <View style={styles.markerOuterRing}>
                  <View style={styles.markerInnerRing}>
                    <View style={styles.markerCenterDot} />
                  </View>
                </View>
              </View>
            </Marker>

            <Circle
              center={pin}
              radius={radius}
              fillColor="rgba(179, 162, 232, 0.2)"
              strokeColor="#B3A2E8"
              strokeWidth={2}
            />

            {userCoord && (
              <Polyline
                coordinates={[userCoord, pin]}
                strokeColor="#B3A2E8"
                strokeWidth={3}
                lineDashPattern={[8, 6]}
              />
            )}
          </>
        )}

        {/* Existing saved geofences */}
        {geofences.map((g) => (
          <GeofenceCircle
            key={g.id}
            geofence={g}
            onPress={() => deleteGeofence(g.id)}
          />
        ))}
      </MapView>

      {/* Loading overlay */}
      {isLoading && (
        <View style={styles.loader}>
          <ActivityIndicator color="#1C1B1F" />
        </View>
      )}

      {/* Hint when no geofences exist */}
      {geofences.length === 0 && !pin && query.length === 0 && (
        <View style={styles.hint}>
          <Text style={styles.hintText}>
            Tap anywhere on the map or search to place a reminder
          </Text>
        </View>
      )}

      {/* New geofence bottom sheet */}
      <GeofenceSheet
        place={pin}
        initialName={prefilledName}
        radius={radius}
        onRadiusChange={setRadius}
        onSave={handleSave}
        onDismiss={handleDismiss}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  loader: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  floatingControls: {
    position: 'absolute',
    right: 16,
    top: Platform.OS === 'ios' ? 126 : 90,
    zIndex: 998,
    gap: 12,
    alignItems: 'center',
  },
  fabBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  fabIcon: {
    fontSize: 16,
    color: '#1C1B1F',
    fontWeight: '700',
  },
  navBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#1C1B1F',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1C1B1F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  navIcon: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '800',
    transform: [{ rotate: '-45deg' }],
  },
  activeMarkerWrap: {
    alignItems: 'center',
  },
  markerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1B1F',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  markerPillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    maxWidth: 130,
  },
  markerPillArrow: {
    color: '#FFFFFF',
    fontSize: 8,
    opacity: 0.8,
  },
  markerPillTriangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#1C1B1F',
    marginBottom: 4,
  },
  markerOuterRing: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(179, 162, 232, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerInnerRing: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#1C1B1F',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  markerCenterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  hint: {
    position: 'absolute',
    bottom: 96,
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F0F0F2',
  },
  hintText: {
    color: '#1C1B1F',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
