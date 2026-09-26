/**
 * presentation/screens/RemindersScreen.tsx
 *
 * Lists all reminders grouped by geofence place name.
 * Minimalist white design with dark charcoal accents.
 */
import React, { useCallback } from 'react';
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
import type { Reminder } from '../../domain/entities/Reminder';

const EVENT_LABEL: Record<string, string> = {
  ENTER: '↘ Arrive',
  EXIT: '↗ Leave',
  DWELL: '⏱ Dwell',
};

export const RemindersScreen: React.FC = () => {
  const reminders = useReminderStore((s) => s.reminders);
  const updateReminder = useReminderStore((s) => s.updateReminder);
  const removeReminder = useReminderStore((s) => s.removeReminder);
  const { geofences, deleteGeofence } = useGeofences();

  const geofenceMap = Object.fromEntries(geofences.map((g) => [g.id, g.name]));

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
        `Delete "${reminder.title}"? This also removes the geofence.`,
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
    ({ item }: { item: Reminder }) => (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View
              style={[
                styles.statusDot,
                item.status === 'active'
                  ? styles.statusDotActive
                  : styles.statusDotPaused,
              ]}
            />
            <Text style={styles.placeName} numberOfLines={1}>
              {geofenceMap[item.geofenceId] ?? 'Custom Place'}
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

        {item.lastTriggeredAt && (
          <Text style={styles.lastFired}>
            Last triggered {new Date(item.lastTriggeredAt).toLocaleTimeString()}
          </Text>
        )}

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              item.status === 'active' ? styles.pauseBtn : styles.resumeBtn,
            ]}
            onPress={() => handleToggle(item)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.actionBtnText,
                item.status === 'active'
                  ? styles.pauseBtnText
                  : styles.resumeBtnText,
              ]}
            >
              {item.status === 'active' ? 'Pause' : 'Resume'}
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
    ),
    [geofenceMap, handleToggle, handleDelete],
  );

  return (
    <View style={styles.container}>
      {reminders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Text style={styles.emptyIcon}>📍</Text>
          </View>
          <Text style={styles.emptyTitle}>No active reminders</Text>
          <Text style={styles.emptySubtitle}>
            Go to the Map tab and tap anywhere or search a place to create your
            first contextual reminder.
          </Text>
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
    padding: 20,
    gap: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F2',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
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
    fontWeight: '700',
  },
  title: {
    color: '#1C1B1F',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  body: {
    color: '#71717A',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  lastFired: {
    color: '#A1A1AA',
    fontSize: 11,
    marginBottom: 12,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  pauseBtn: {
    backgroundColor: '#F4F4F6',
  },
  pauseBtnText: {
    color: '#1C1B1F',
    fontSize: 13,
    fontWeight: '700',
  },
  resumeBtn: {
    backgroundColor: '#1C1B1F',
  },
  resumeBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  deleteBtn: {
    backgroundColor: '#FEE2E2',
  },
  deleteBtnText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 36,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
  },
  emptyIcon: {
    fontSize: 28,
  },
  emptyTitle: {
    color: '#1C1B1F',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#71717A',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
  },
});
