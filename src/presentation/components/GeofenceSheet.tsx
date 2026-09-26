/**
 * presentation/components/GeofenceSheet.tsx
 *
 * Minimalist White Bottom Sheet for creating reminders & geofences.
 * Matches the Waynest design:
 * - Crisp white card with subtle shadows and rounded corners
 * - Category preset tiles: Home (⌂), Office (🏢), School (🎓)
 * - Clean radius chips & trigger selectors
 * - Bold dark charcoal button: #1C1B1F
 */
import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import type { Geofence } from '../../domain/entities/Geofence';
import type { Reminder } from '../../domain/entities/Reminder';

const SNAP_POINTS = ['58%', '85%'];
const DEFAULT_RADIUS = 200;

interface NewPlace {
  latitude: number;
  longitude: number;
}

interface Props {
  place: NewPlace | null;
  initialName?: string;
  radius?: number;
  onRadiusChange?: (radius: number) => void;
  onSave: (geofence: Geofence, reminder: Reminder) => void;
  onDismiss: () => void;
}

const CATEGORY_PRESETS = [
  { label: 'Home', icon: '⌂', defaultMessage: 'Remember to unpack and relax' },
  { label: 'Office', icon: '🏢', defaultMessage: 'Check today’s standup agenda' },
  { label: 'School', icon: '🎓', defaultMessage: 'Pick up supplies and notebooks' },
];

export const GeofenceSheet: React.FC<Props> = ({
  place,
  initialName,
  radius: externalRadius,
  onRadiusChange,
  onSave,
  onDismiss,
}) => {
  const sheetRef = useRef<BottomSheet>(null);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [internalRadius, setInternalRadius] = useState(DEFAULT_RADIUS);
  const radius = externalRadius ?? internalRadius;
  const [trigger, setTrigger] = useState<'ENTER' | 'EXIT' | 'BOTH'>('ENTER');

  const handleRadiusChange = useCallback(
    (newRadius: number) => {
      setInternalRadius(newRadius);
      onRadiusChange?.(newRadius);
    },
    [onRadiusChange],
  );

  // Pre-fill name whenever place or initialName changes
  React.useEffect(() => {
    if (initialName) {
      setName(initialName);
    }
  }, [initialName, place]);

  const handleSelectCategory = (category: typeof CATEGORY_PRESETS[0]) => {
    setName(category.label);
    if (!message) {
      setMessage(category.defaultMessage);
    }
  };

  const handleSave = useCallback(() => {
    if (!place || !name.trim()) return;

    const now = new Date().toISOString();
    const geofenceId = `geo_${Date.now()}`;

    const triggerOn: Geofence['triggerOn'] =
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

    // Reset form
    setName('');
    setMessage('');
    handleRadiusChange(DEFAULT_RADIUS);
    setTrigger('ENTER');
    sheetRef.current?.close();
  }, [place, name, message, radius, trigger, onSave, handleRadiusChange]);

  if (!place) return null;

  return (
    <BottomSheet
      ref={sheetRef}
      snapPoints={SNAP_POINTS}
      enablePanDownToClose
      onClose={onDismiss}
      backgroundStyle={styles.sheetBg}
      handleIndicatorStyle={styles.handle}
    >
      <BottomSheetView style={styles.content}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.heading}>New Reminder</Text>
            <Text style={styles.subheading}>
              Set a geofence trigger at selected location
            </Text>
          </View>
        </View>

        {/* Quick Category Presets (From Screen 2 Mockup) */}
        <View style={styles.presetsRow}>
          {CATEGORY_PRESETS.map((cat) => {
            const isSelected = name.toLowerCase() === cat.label.toLowerCase();
            return (
              <TouchableOpacity
                key={cat.label}
                style={[styles.presetCard, isSelected && styles.presetCardActive]}
                onPress={() => handleSelectCategory(cat)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.presetIconWrap,
                    isSelected && styles.presetIconWrapActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.presetIcon,
                      isSelected && styles.presetIconActive,
                    ]}
                  >
                    {cat.icon}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.presetLabel,
                    isSelected && styles.presetLabelActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Place name input */}
        <Text style={styles.label}>Place Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Brooklyn Simmons, Grocery Store…"
          placeholderTextColor="#8E8E93"
          value={name}
          onChangeText={setName}
          maxLength={40}
        />

        {/* Reminder message input */}
        <Text style={styles.label}>Reminder Note</Text>
        <TextInput
          style={styles.input}
          placeholder="What should Locus alert you about?"
          placeholderTextColor="#8E8E93"
          value={message}
          onChangeText={setMessage}
          maxLength={120}
        />

        {/* Radius selector */}
        <View style={styles.radiusHeader}>
          <Text style={styles.label}>Radius Boundary</Text>
          <Text style={styles.radiusBadge}>{radius}m</Text>
        </View>
        <View style={styles.chipRow}>
          {[100, 200, 500, 1000].map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.chip, radius === r && styles.chipActive]}
              onPress={() => handleRadiusChange(r)}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.chipText, radius === r && styles.chipTextActive]}
              >
                {r}m
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Trigger condition */}
        <Text style={styles.label}>Trigger When I…</Text>
        <View style={styles.chipRow}>
          {(['ENTER', 'EXIT', 'BOTH'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.triggerChip, trigger === t && styles.triggerChipActive]}
              onPress={() => setTrigger(t)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.triggerText,
                  trigger === t && styles.triggerTextActive,
                ]}
              >
                {t === 'ENTER'
                  ? '↘ Arrive'
                  : t === 'EXIT'
                  ? '↗ Leave'
                  : '⇄ Both'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={onDismiss}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveBtn, !name.trim() && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={!name.trim()}
            activeOpacity={0.85}
          >
            <Text style={styles.saveText}>Save Reminder</Text>
          </TouchableOpacity>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  sheetBg: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 20,
  },
  handle: {
    backgroundColor: '#E4E4E7',
    width: 44,
    height: 5,
    borderRadius: 3,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  heading: {
    color: '#1C1B1F',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subheading: {
    color: '#8E8E93',
    fontSize: 12,
    marginTop: 2,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  presetCard: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 18,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#F0F0F2',
  },
  presetCardActive: {
    backgroundColor: '#1C1B1F',
    borderColor: '#1C1B1F',
  },
  presetIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  presetIconWrapActive: {
    backgroundColor: '#2E2D32',
  },
  presetIcon: {
    fontSize: 16,
    color: '#1C1B1F',
  },
  presetIconActive: {
    color: '#FFFFFF',
  },
  presetLabel: {
    color: '#1C1B1F',
    fontSize: 12,
    fontWeight: '700',
  },
  presetLabelActive: {
    color: '#FFFFFF',
  },
  label: {
    color: '#71717A',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 12,
    marginBottom: 6,
  },
  radiusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 6,
  },
  radiusBadge: {
    color: '#1C1B1F',
    fontSize: 12,
    fontWeight: '800',
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: 14,
    color: '#1C1B1F',
    fontSize: 15,
    fontWeight: '500',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#EFEFEF',
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: '#1C1B1F',
    borderColor: '#1C1B1F',
  },
  chipText: {
    color: '#71717A',
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  triggerChip: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#EFEFEF',
    alignItems: 'center',
  },
  triggerChipActive: {
    backgroundColor: '#1C1B1F',
    borderColor: '#1C1B1F',
  },
  triggerText: {
    color: '#71717A',
    fontSize: 13,
    fontWeight: '600',
  },
  triggerTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 22,
  },
  cancelBtn: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F4F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: {
    color: '#71717A',
    fontSize: 15,
    fontWeight: '700',
  },
  saveBtn: {
    flex: 2,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1C1B1F',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1C1B1F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnDisabled: {
    opacity: 0.35,
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
