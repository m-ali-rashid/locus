/**
 * presentation/screens/RemindersScreen.tsx
 *
 * Lists all reminders with real-time distance to geofence,
 * active/paused status toggles, trigger badges, and the Locus radar logo.
 */
import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useReminderStore } from '../state/useReminderStore';
import { useGeofences } from '../hooks/useGeofences';
import { useUserLocation } from '../hooks/useUserLocation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LocusLogo } from '../components/LocusLogo';
import type { Reminder } from '../../domain/entities/Reminder';
import type { Geofence } from '../../domain/entities/Geofence';

const EVENT_LABEL: Record<string, string> = {
  ENTER: '↘ Arrive',
  EXIT: '↗ Leave',
  DWELL: '⏱ Dwell',
};

function calculateDistanceMetres(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${meters}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

interface Props {
  navigation?: any;
}

export const RemindersScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const reminders = useReminderStore((s) => s.reminders);
  const updateReminder = useReminderStore((s) => s.updateReminder);
  const removeReminder = useReminderStore((s) => s.removeReminder);
  const { geofences, deleteGeofence } = useGeofences();
  const { location: userLocation } = useUserLocation();

  const geofenceMap = useMemo(() => {
    return Object.fromEntries(geofences.map((g: Geofence) => [g.id, g]));
  }, [geofences]);

  const handleToggle = useCallback(
    (reminder: Reminder) => {
      updateReminder({
        ...reminder,
        status: reminder.status === 'active' ? 'paused' : 'active',
      });
    },
    [updateReminder],
  );

  const handleDelete = useCallback(
    (reminder: Reminder) => {
      Alert.alert(
        'Delete Reminder',
        `Delete "${reminder.title}"? This will also remove the monitored geofence.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              removeReminder(reminder.id);
              await deleteGeofence(reminder.geofenceId);
            },
          },
        ],
      );
    },
    [removeReminder, deleteGeofence],
  );

  const renderItem = useCallback(
    ({ item }: { item: Reminder }) => {
      const geofence = geofenceMap[item.geofenceId];
      const isActive = item.status === 'active';

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
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.headerLeft}>
              <View
                style={[
                  styles.statusDot,
                  isActive ? styles.statusDotActive : styles.statusDotPaused,
                ]}
              />
              <Text style={styles.placeName} numberOfLines={1}>
                {geofence?.name ?? 'Custom Place'}
              </Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {EVENT_LABEL[item.triggerEvent] ?? item.triggerEvent}
              </Text>
            </View>
          </View>

          <Text style={styles.title}>{item.title}</Text>
          {item.body ? <Text style={styles.body}>{item.body}</Text> : null}

          {/* Distance Indicator */}
          {distanceText ? (
            <View style={styles.metaRow}>
              <Text
                style={[
                  styles.distanceText,
                  isInside ? styles.distanceInside : styles.distanceOutside,
                ]}
              >
                🧭 {distanceText}
              </Text>
              {geofence && (
                <Text style={styles.radiusText}>(radius: {geofence.radius}m)</Text>
              )}
            </View>
          ) : null}

          {item.lastTriggeredAt && (
            <Text style={styles.lastFired}>
              Triggered {new Date(item.lastTriggeredAt).toLocaleTimeString()}
            </Text>
          )}

          <View style={styles.cardActions}>
            <TouchableOpacity
              style={[
                styles.actionBtn,
                isActive ? styles.pauseBtn : styles.resumeBtn,
              ]}
              onPress={() => handleToggle(item)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.actionBtnText,
                  isActive ? styles.pauseBtnText : styles.resumeBtnText,
                ]}
              >
                {isActive ? 'Pause' : 'Resume'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.deleteBtn]}
              onPress={() => handleDelete(item)}
              activeOpacity={0.7}
            >
              <Text style={styles.deleteBtnText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    },
    [geofenceMap, userLocation, handleToggle, handleDelete],
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      {reminders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <LocusLogo size={42} />
          </View>
          <Text style={styles.emptyTitle}>No active reminders</Text>
          <Text style={styles.emptySubtitle}>
            Go to the Map tab and tap anywhere or search a place to create your
            first location-aware reminder.
          </Text>
          {navigation && (
            <TouchableOpacity
              style={styles.openMapBtn}
              onPress={() => navigation.navigate('Map')}
              activeOpacity={0.8}
            >
              <Text style={styles.openMapBtnText}>Open Map View</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={reminders}
          keyExtractor={(r) => r.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F2',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusDotActive: {
    backgroundColor: '#10B981',
  },
  statusDotPaused: {
    backgroundColor: '#F59E0B',
  },
  placeName: {
    color: '#71717A',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  badge: {
    backgroundColor: '#F4F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: '#1C1B1F',
    fontSize: 11,
    fontWeight: '800',
  },
  title: {
    color: '#1C1B1F',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  body: {
    color: '#71717A',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    marginBottom: 4,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '700',
  },
  distanceInside: {
    color: '#059669',
  },
  distanceOutside: {
    color: '#71717A',
  },
  radiusText: {
    fontSize: 11,
    color: '#A1A1AA',
  },
  lastFired: {
    color: '#A1A1AA',
    fontSize: 11,
    marginTop: 4,
    marginBottom: 8,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F4F4F6',
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  pauseBtn: {
    backgroundColor: '#F4F4F6',
  },
  pauseBtnText: {
    color: '#1C1B1F',
  },
  resumeBtn: {
    backgroundColor: '#1C1B1F',
  },
  resumeBtnText: {
    color: '#FFFFFF',
  },
  deleteBtn: {
    maxWidth: 80,
    backgroundColor: '#FEE2E2',
  },
  deleteBtnText: {
    color: '#DC2626',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 36,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EBECEF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  emptyTitle: {
    color: '#1C1B1F',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  emptySubtitle: {
    color: '#71717A',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  openMapBtn: {
    backgroundColor: '#1C1B1F',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  openMapBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
