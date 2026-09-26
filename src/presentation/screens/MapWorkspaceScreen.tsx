/**
 * presentation/screens/MapWorkspaceScreen.tsx
 *
 * Fullscreen Interactive Map with Technical Blueprint Styling and
 * 60fps Tactile Radius Scrubber.
 *
 * - Clean, muted dark/blueprint MapView styling
 * - Long-press to drop target pin
 * - Live scaling circle overlay & custom reticle marker
 * - Committed geofence visualization
 * - Bottom drafting card with live readout and Commit Locus action
 */
import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  Platform,
  Alert,
} from 'react-native';
import MapView, {
  Marker,
  Circle,
  LongPressEvent,
  MapPressEvent,
  PROVIDER_DEFAULT,
} from 'react-native-maps';
import uuid from 'react-native-uuid';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TactileRadiusScrubber } from '../components/TactileRadiusScrubber';
import { PlaceSearchBar } from '../components/PlaceSearchBar';
import { useGeofences } from '../hooks/useGeofences';
import { usePlaceSearch } from '../hooks/usePlaceSearch';
import { useReminderStore } from '../state/useReminderStore';
import { useUserLocation } from '../hooks/useUserLocation';
import type { Reminder, TransitionType } from '../../domain/entities/Reminder';
import type { Geofence } from '../../domain/entities/Geofence';
import type { PlaceSuggestion } from '../../domain/entities/PlaceSuggestion';

interface PinCoord {
  latitude: number;
  longitude: number;
}

const INITIAL_REGION = {
  latitude: 37.7749,
  longitude: -122.4194,
  latitudeDelta: 0.04,
  longitudeDelta: 0.04,
};

// High-end CAD / Blueprint dark styling for MapView
const BLUEPRINT_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0B132B' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#64748B' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0B132B' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#1E293B' }] },
  { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#334155' }] },
  { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#1C2541' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#475569' }] },
  { featureType: 'road', elementType: 'geometry.fill', stylers: [{ color: '#1C2541' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#0B132B' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#334155' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#1D4ED8' }, { lightness: -20 }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1E3A8A' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#1C2541' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#030712' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#38BDF8' }] },
];

export const MapWorkspaceScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);

  // Drafting State
  const [pin, setPin] = useState<PinCoord | null>(null);
  const [radius, setRadius] = useState<number>(200);
  const [title, setTitle] = useState<string>('');
  const [transitionType, setTransitionType] = useState<TransitionType>('ENTER');
  const [isCommitting, setIsCommitting] = useState<boolean>(false);

  // Domain & State Hooks
  const { geofences, saveGeofence, deleteGeofence } = useGeofences();
  const addReminder = useReminderStore((s) => s.addReminder);
  const { location: userLocation } = useUserLocation();

  const handleCommittedMarkerPress = useCallback(
    (geofence: Geofence) => {
      Alert.alert(
        geofence.name,
        `Radius: ${geofence.radius}m\nCoordinates: ${geofence.latitude.toFixed(4)}°N, ${geofence.longitude.toFixed(4)}°W`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete Locus',
            style: 'destructive',
            onPress: async () => {
              await deleteGeofence(geofence.id);
            },
          },
        ],
      );
    },
    [deleteGeofence],
  );

  // Place autocomplete search hook
  const {
    query,
    setQuery,
    suggestions,
    isSearching,
    clear: clearSearch,
  } = usePlaceSearch({
    proximity: userLocation ? { latitude: userLocation.latitude, longitude: userLocation.longitude } : null,
  });

  const handleSelectSuggestion = useCallback(
    (suggestion: PlaceSuggestion) => {
      Keyboard.dismiss();
      clearSearch();

      const targetCoord = {
        latitude: suggestion.latitude,
        longitude: suggestion.longitude,
      };

      setPin(targetCoord);
      setTitle(suggestion.name);

      mapRef.current?.animateToRegion(
        {
          ...targetCoord,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        },
        600,
      );
    },
    [clearSearch],
  );

  // Long-press to drop drafting pin
  const handleLongPress = useCallback(
    (e: LongPressEvent) => {
      Keyboard.dismiss();
      if (suggestions.length > 0) {
        clearSearch();
      }
      const coord = e.nativeEvent.coordinate;
      setPin(coord);
      mapRef.current?.animateToRegion(
        {
          ...coord,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        400,
      );
    },
    [suggestions.length, clearSearch],
  );

  // Tap to dismiss search suggestions or active pin if tapped outside
  const handleMapPress = useCallback(
    (_e: MapPressEvent) => {
      Keyboard.dismiss();
      if (suggestions.length > 0) {
        clearSearch();
      }
    },
    [suggestions.length, clearSearch],
  );

  // Center on user location
  const handleCenterUser = useCallback(() => {
    if (userLocation) {
      mapRef.current?.animateToRegion(
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        },
        600,
      );
    }
  }, [userLocation]);

  // Commit Locus Handler
  const handleCommitLocus = useCallback(async () => {
    if (!pin) {
      Alert.alert('No Location Selected', 'Long-press on the map to drop a target locus pin.');
      return;
    }

    const trimmedTitle = title.trim() || 'Custom Locus';
    setIsCommitting(true);

    try {
      const geofenceId = uuid.v4() as string;
      const reminderId = uuid.v4() as string;
      const now = new Date().toISOString();

      const geofence: Geofence = {
        id: geofenceId,
        name: trimmedTitle,
        latitude: pin.latitude,
        longitude: pin.longitude,
        radius,
        triggerOn: [transitionType],
        isActive: true,
        createdAt: now,
      };

      const reminder: Reminder = {
        id: reminderId,
        title: trimmedTitle,
        latitude: pin.latitude,
        longitude: pin.longitude,
        radius,
        transitionType,
        geofenceId,
        triggerEvent: transitionType,
        status: 'active',
        createdAt: now,
      };

      await saveGeofence(geofence);
      addReminder(reminder);

      // Reset drafting card
      setPin(null);
      setTitle('');
      setRadius(200);

      Alert.alert(
        'Locus Committed',
        `"${trimmedTitle}" (${radius}m) registered for active monitoring.`,
      );
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to commit locus.');
    } finally {
      setIsCommitting(false);
    }
  }, [pin, title, radius, transitionType, saveGeofence, addReminder]);

  return (
    <View style={styles.container}>
      {/* Fullscreen MapView */}
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_DEFAULT}
        initialRegion={INITIAL_REGION}
        customMapStyle={BLUEPRINT_MAP_STYLE}
        userInterfaceStyle="dark"
        showsUserLocation
        showsCompass={false}
        onLongPress={handleLongPress}
        onPress={handleMapPress}
      >
        {/* Committed Geofence Overlays */}
        {geofences.map((g) => (
          <React.Fragment key={g.id}>
            <Circle
              center={{ latitude: g.latitude, longitude: g.longitude }}
              radius={g.radius}
              fillColor="rgba(16, 185, 129, 0.12)"
              strokeColor="#10B981"
              strokeWidth={1.5}
            />
            <Marker
              coordinate={{ latitude: g.latitude, longitude: g.longitude }}
              anchor={{ x: 0.5, y: 0.5 }}
              onPress={() => handleCommittedMarkerPress(g)}
            >
              <View style={styles.committedMarkerWrap}>
                <View style={styles.committedMarkerDot} />
                <View style={styles.committedMarkerPill}>
                  <Text style={styles.committedMarkerText} numberOfLines={1}>
                    {g.name}
                  </Text>
                </View>
              </View>
            </Marker>
          </React.Fragment>
        ))}

        {/* Active Drafting Pin & Live Radius Circle */}
        {pin && (
          <>
            <Circle
              center={pin}
              radius={radius}
              fillColor="rgba(37, 99, 235, 0.18)"
              strokeColor="#3B82F6"
              strokeWidth={2}
            />
            <Marker coordinate={pin} anchor={{ x: 0.5, y: 0.5 }} draggable>
              <View style={styles.reticleMarkerWrap}>
                <View style={styles.reticleCrosshairH} />
                <View style={styles.reticleCrosshairV} />
                <View style={styles.reticleOuterRing}>
                  <View style={styles.reticleInnerRing}>
                    <View style={styles.reticleCenterDot} />
                  </View>
                </View>
              </View>
            </Marker>
          </>
        )}
      </MapView>

      {/* Floating Place Search Bar with Live Suggestions */}
      <PlaceSearchBar
        query={query}
        onChangeQuery={setQuery}
        suggestions={suggestions}
        isSearching={isSearching}
        onSelectSuggestion={handleSelectSuggestion}
        onClear={clearSearch}
        onCenterUserLocation={handleCenterUser}
        style={{ top: insets.top + 8 }}
      />

      {/* Floating Long-Press Hint (Shown when no pin is placed) */}
      {!pin && (
        <View style={[styles.hintCard, { bottom: insets.bottom + 24 }]}>
          <Text style={styles.hintIcon}>📍</Text>
          <View style={styles.hintTextWrap}>
            <Text style={styles.hintTitle}>Draft a New Locus</Text>
            <Text style={styles.hintSubtitle}>
              Long-press anywhere on the map to drop a target locus and adjust its radius.
            </Text>
          </View>
        </View>
      )}

      {/* Bottom Drafting Card (Visible when pin is selected) */}
      {pin && (
        <View style={[styles.draftingCard, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.draftingCardHandle} />

          {/* Card Header & Coordinates */}
          <View style={styles.draftingHeader}>
            <View>
              <Text style={styles.draftingTitle}>TARGET LOCUS</Text>
              <Text style={styles.coordinatesText}>
                {pin.latitude.toFixed(4)}°N, {pin.longitude.toFixed(4)}°W
              </Text>
            </View>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setPin(null)}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelBtnText}>Discard</Text>
            </TouchableOpacity>
          </View>

          {/* Title Input */}
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.titleInput}
              placeholder="Zone Title (e.g. Office, Gym, Home Safezone)"
              placeholderTextColor="#94A3B8"
              value={title}
              onChangeText={setTitle}
              returnKeyType="done"
            />
          </View>

          {/* Transition Trigger Type Selector */}
          <View style={styles.transitionRow}>
            <TouchableOpacity
              style={[
                styles.transitionPill,
                transitionType === 'ENTER' && styles.transitionPillActive,
              ]}
              onPress={() => setTransitionType('ENTER')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.transitionPillText,
                  transitionType === 'ENTER' && styles.transitionPillTextActive,
                ]}
              >
                ↘ Arrive (ENTER)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.transitionPill,
                transitionType === 'EXIT' && styles.transitionPillActive,
              ]}
              onPress={() => setTransitionType('EXIT')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.transitionPillText,
                  transitionType === 'EXIT' && styles.transitionPillTextActive,
                ]}
              >
                ↗ Leave (EXIT)
              </Text>
            </TouchableOpacity>
          </View>

          {/* 60fps Tactile Radius Scrubber */}
          <View style={styles.scrubberSection}>
            <TactileRadiusScrubber radius={radius} onChangeRadius={setRadius} />
          </View>

          {/* Commit Button */}
          <TouchableOpacity
            style={[styles.commitBtn, isCommitting && styles.commitBtnDisabled]}
            onPress={handleCommitLocus}
            disabled={isCommitting}
            activeOpacity={0.85}
          >
            <Text style={styles.commitBtnText}>
              {isCommitting ? 'Commiting Locus...' : `Commit Locus (${radius}m)`}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B132B',
  },
  // Hint card
  hintCard: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.94)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  hintIcon: {
    fontSize: 24,
  },
  hintTextWrap: {
    flex: 1,
  },
  hintTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  hintSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  // Reticle marker
  reticleMarkerWrap: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reticleCrosshairH: {
    position: 'absolute',
    width: 44,
    height: 1.5,
    backgroundColor: '#38BDF8',
  },
  reticleCrosshairV: {
    position: 'absolute',
    height: 44,
    width: 1.5,
    backgroundColor: '#38BDF8',
  },
  reticleOuterRing: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#38BDF8',
    backgroundColor: 'rgba(56, 189, 248, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reticleInnerRing: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reticleCenterDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#38BDF8',
  },
  // Committed marker
  committedMarkerWrap: {
    alignItems: 'center',
  },
  committedMarkerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  committedMarkerPill: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#10B981',
    marginTop: 4,
  },
  committedMarkerText: {
    color: '#F8FAFC',
    fontSize: 10,
    fontWeight: '700',
  },
  // Bottom drafting card
  draftingCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  draftingCardHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 14,
  },
  draftingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  draftingTitle: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  coordinatesText: {
    color: '#64748B',
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginTop: 2,
  },
  cancelBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  cancelBtnText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
  },
  inputWrap: {
    marginBottom: 12,
  },
  titleInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  transitionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  transitionPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  transitionPillActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  transitionPillText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
  },
  transitionPillTextActive: {
    color: '#FFFFFF',
  },
  scrubberSection: {
    marginBottom: 16,
  },
  commitBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  commitBtnDisabled: {
    opacity: 0.6,
  },
  commitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
