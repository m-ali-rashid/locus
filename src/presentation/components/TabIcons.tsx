/**
 * src/presentation/components/TabIcons.tsx
 *
 * Black outline style vector tab icons rendered with React Native primitives.
 * - MapOutlineIcon: Architectural 3-panel folded map with crisp isometric creases.
 * - RemindersOutlineIcon: Minimalist outline bell with curved dome, flared rim, and striker clapper.
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';

interface IconProps {
  focused: boolean;
  color?: string;
  size?: number;
}

/**
 * Folded Map Icon in Black Outline Style
 */
export const MapOutlineIcon: React.FC<IconProps> = ({
  focused,
  color = '#1C1B1F',
  size = 24,
}) => {
  const strokeWidth = focused ? 2.0 : 1.6;
  const strokeColor = color;
  const scale = size / 24;

  return (
    <View style={[styles.canvas, { width: size, height: size }]}>
      <View
        style={[
          styles.container24,
          {
            transform: [{ scale }],
            opacity: focused ? 1.0 : 0.65,
          },
        ]}
      >
        <View style={styles.mapWrapper}>
          {/* Panel 1 (Left): slopes downward */}
          <View
            style={[
              styles.mapPanel,
              styles.panelLeft,
              {
                borderLeftWidth: strokeWidth,
                borderTopWidth: strokeWidth,
                borderBottomWidth: strokeWidth,
                borderRightWidth: strokeWidth * 0.8,
                borderColor: strokeColor,
              },
            ]}
          />

          {/* Panel 2 (Center): slopes upward */}
          <View
            style={[
              styles.mapPanel,
              styles.panelCenter,
              {
                borderTopWidth: strokeWidth,
                borderBottomWidth: strokeWidth,
                borderRightWidth: strokeWidth * 0.8,
                borderColor: strokeColor,
              },
            ]}
          />

          {/* Panel 3 (Right): slopes downward */}
          <View
            style={[
              styles.mapPanel,
              styles.panelRight,
              {
                borderTopWidth: strokeWidth,
                borderBottomWidth: strokeWidth,
                borderRightWidth: strokeWidth,
                borderColor: strokeColor,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

/**
 * Bell Icon in Black Outline Style
 */
export const RemindersOutlineIcon: React.FC<IconProps> = ({
  focused,
  color = '#1C1B1F',
  size = 24,
}) => {
  const strokeWidth = focused ? 2.0 : 1.6;
  const strokeColor = color;
  const scale = size / 24;

  return (
    <View style={[styles.canvas, { width: size, height: size }]}>
      <View
        style={[
          styles.container24,
          {
            transform: [{ scale }],
            opacity: focused ? 1.0 : 0.65,
          },
        ]}
      >
        <View style={styles.bellWrapper}>
          {/* Top hanger loop */}
          <View
            style={[
              styles.bellHanger,
              {
                borderWidth: strokeWidth,
                borderColor: strokeColor,
              },
            ]}
          />

          {/* Bell dome */}
          <View
            style={[
              styles.bellDome,
              {
                borderTopWidth: strokeWidth,
                borderLeftWidth: strokeWidth,
                borderRightWidth: strokeWidth,
                borderColor: strokeColor,
              },
            ]}
          />

          {/* Flared bottom rim */}
          <View
            style={[
              styles.bellRim,
              {
                height: strokeWidth,
                backgroundColor: strokeColor,
                borderRadius: strokeWidth / 2,
              },
            ]}
          />

          {/* Bell striker clapper */}
          <View
            style={[
              styles.bellClapper,
              {
                backgroundColor: strokeColor,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  canvas: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  container24: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Map styles
  mapWrapper: {
    width: 21,
    height: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPanel: {
    width: 7,
    height: 14,
  },
  panelLeft: {
    transform: [{ skewY: '-14deg' }],
  },
  panelCenter: {
    transform: [{ skewY: '14deg' }],
  },
  panelRight: {
    transform: [{ skewY: '-14deg' }],
  },
  // Bell styles
  bellWrapper: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellHanger: {
    width: 5,
    height: 4,
    borderTopLeftRadius: 2.5,
    borderTopRightRadius: 2.5,
    borderBottomWidth: 0,
    marginBottom: -1,
  },
  bellDome: {
    width: 14,
    height: 11,
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  bellRim: {
    width: 19,
    marginTop: 0.5,
  },
  bellClapper: {
    width: 4.5,
    height: 3,
    borderBottomLeftRadius: 2.25,
    borderBottomRightRadius: 2.25,
    marginTop: 1,
  },
});
