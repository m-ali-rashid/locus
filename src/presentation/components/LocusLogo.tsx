/**
 * src/presentation/components/LocusLogo.tsx
 *
 * Black Pinstripe Minimalist Logo for LOCUS rendered with pure React Native primitives.
 * Integrates the letter "L" inside concentric geofence radar rings:
 * - Outer dashed perimeter geofence ring
 * - Middle boundary ring
 * - Cardinal radar crosshair ticks
 * - Stylized dual-pinstripe letter 'L' with radar center eyelet
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  size?: number;
  withWordmark?: boolean;
  color?: string;
}

export const LocusLogo: React.FC<Props> = ({
  size = 32,
  withWordmark = false,
  color = '#1C1B1F',
}) => {
  const scale = size / 100;

  return (
    <View style={styles.container}>
      {/* 100x100 canvas scaled via transform */}
      <View
        style={[
          styles.canvas,
          {
            width: size,
            height: size,
          },
        ]}
      >
        <View
          style={[
            styles.scaledContainer,
            {
              transform: [{ scale }],
            },
          ]}
        >
          {/* Outer dashed perimeter geofence ring (radius 44) */}
          <View
            style={[
              styles.circle,
              {
                width: 88,
                height: 88,
                borderRadius: 44,
                borderWidth: 1.2,
                borderColor: color,
                borderStyle: 'dashed',
              },
            ]}
          />

          {/* Intermediate geofence ring (radius 35) */}
          <View
            style={[
              styles.circle,
              {
                width: 70,
                height: 70,
                borderRadius: 35,
                borderWidth: 1.4,
                borderColor: color,
              },
            ]}
          />

          {/* Inner core geofence ring (radius 24) */}
          <View
            style={[
              styles.circle,
              {
                width: 48,
                height: 48,
                borderRadius: 24,
                borderWidth: 1.0,
                borderColor: color,
                borderStyle: 'dashed',
                opacity: 0.7,
              },
            ]}
          />

          {/* Cardinal Radar Crosshairs */}
          {/* North */}
          <View
            style={[
              styles.crosshair,
              {
                top: 2,
                left: 49.3,
                width: 1.4,
                height: 16,
                backgroundColor: color,
              },
            ]}
          />
          {/* South */}
          <View
            style={[
              styles.crosshair,
              {
                bottom: 2,
                left: 49.3,
                width: 1.4,
                height: 16,
                backgroundColor: color,
              },
            ]}
          />
          {/* West */}
          <View
            style={[
              styles.crosshair,
              {
                left: 2,
                top: 49.3,
                height: 1.4,
                width: 16,
                backgroundColor: color,
              },
            ]}
          />
          {/* East */}
          <View
            style={[
              styles.crosshair,
              {
                right: 2,
                top: 49.3,
                height: 1.4,
                width: 16,
                backgroundColor: color,
              },
            ]}
          />

          {/* --- THE LETTER "L" STRUCTURE --- */}
          {/* Outer track pinstripe of 'L' */}
          {/* Vertical stem */}
          <View
            style={[
              styles.line,
              {
                left: 37,
                top: 26,
                width: 2.8,
                height: 45,
                borderRadius: 1.4,
                backgroundColor: color,
              },
            ]}
          />
          {/* Horizontal foot */}
          <View
            style={[
              styles.line,
              {
                left: 37,
                top: 68.2,
                width: 36,
                height: 2.8,
                borderRadius: 1.4,
                backgroundColor: color,
              },
            ]}
          />

          {/* Inner parallel pinstripe of 'L' */}
          {/* Inner Vertical stem */}
          <View
            style={[
              styles.line,
              {
                left: 43.5,
                top: 32,
                width: 1.6,
                height: 32,
                borderRadius: 0.8,
                backgroundColor: color,
              },
            ]}
          />
          {/* Inner Horizontal foot */}
          <View
            style={[
              styles.line,
              {
                left: 43.5,
                top: 62.4,
                width: 25,
                height: 1.6,
                borderRadius: 0.8,
                backgroundColor: color,
              },
            ]}
          />

          {/* Eyelet Target Dot in the vertex corner */}
          <View
            style={[
              styles.eyeletOuter,
              {
                left: 41.5,
                top: 61.5,
                backgroundColor: color,
              },
            ]}
          >
            <View style={styles.eyeletInner} />
          </View>

          {/* Center Radar Origin Point */}
          <View
            style={[
              styles.centerDot,
              {
                backgroundColor: color,
              },
            ]}
          />
        </View>
      </View>

      {withWordmark && (
        <View style={styles.wordmarkContainer}>
          <Text style={[styles.wordmarkTitle, { color }]}>LOCUS</Text>
          <Text style={styles.wordmarkSubtitle}>GEOFENCE RADAR</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  canvas: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scaledContainer: {
    width: 100,
    height: 100,
    position: 'absolute',
    left: 0,
    top: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    position: 'absolute',
  },
  crosshair: {
    position: 'absolute',
    borderRadius: 1,
  },
  line: {
    position: 'absolute',
  },
  eyeletOuter: {
    position: 'absolute',
    width: 5.6,
    height: 5.6,
    borderRadius: 2.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeletInner: {
    width: 2.4,
    height: 2.4,
    borderRadius: 1.2,
    backgroundColor: '#FFFFFF',
  },
  centerDot: {
    position: 'absolute',
    width: 3.6,
    height: 3.6,
    borderRadius: 1.8,
  },
  wordmarkContainer: {
    marginLeft: 4,
  },
  wordmarkTitle: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 2.5,
  },
  wordmarkSubtitle: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: '#8E8E93',
    marginTop: 1,
  },
});
