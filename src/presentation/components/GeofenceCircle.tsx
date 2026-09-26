/**
 * presentation/components/GeofenceCircle.tsx
 *
 * Renders MapView Circle + custom black-target pin & dark pill label
 * matching the Waynest design in the user mockup.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Circle, Marker } from 'react-native-maps';
import type { Geofence } from '../../domain/entities/Geofence';

interface Props {
  geofence: Geofence;
  onPress?: (geofence: Geofence) => void;
}

export const GeofenceCircle: React.FC<Props> = ({ geofence, onPress }) => {
  const coord = { latitude: geofence.latitude, longitude: geofence.longitude };

  return (
    <>
      {/* Soft lavender boundary circle */}
      <Circle
        center={coord}
        radius={geofence.radius}
        strokeColor="rgba(179, 162, 232, 0.85)"
        fillColor="rgba(179, 162, 232, 0.18)"
        strokeWidth={2}
      />

      {/* Target marker with dark pill callout */}
      <Marker
        coordinate={coord}
        anchor={{ x: 0.5, y: 0.7 }}
        onPress={() => onPress?.(geofence)}
      >
        <View style={styles.markerContainer}>
          {/* Black Pill Tag matching "3801 Lake ▼" */}
          <View style={styles.pill}>
            <Text style={styles.pillText} numberOfLines={1}>
              {geofence.name}
            </Text>
            <Text style={styles.arrowDown}>▼</Text>
          </View>
          <View style={styles.pillTriangle} />

          {/* Target ring icon */}
          <View style={styles.outerRing}>
            <View style={styles.innerRing}>
              <View style={styles.centerDot} />
            </View>
          </View>
        </View>
      </Marker>
    </>
  );
};

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1B1F',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    gap: 6,
  },
  pillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    maxWidth: 120,
  },
  arrowDown: {
    color: '#FFFFFF',
    fontSize: 8,
    opacity: 0.8,
  },
  pillTriangle: {
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
  outerRing: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(179, 162, 232, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerRing: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#1C1B1F',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  centerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
});
