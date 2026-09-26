/**
 * presentation/components/TactileRadiusScrubber.tsx
 *
 * 60fps Tactile Radius Scrubber using react-native-gesture-handler (Gesture.Pan)
 * and react-native-reanimated.
 *
 * Maps horizontal pan translation to a geofence radius between 50m and 1000m.
 * Detects 50-meter threshold crossings directly inside the UI worklet thread
 * and invokes IHapticGateway.triggerTick() via runOnJS.
 */
import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  LayoutChangeEvent,
} from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
  withSpring,
} from 'react-native-reanimated';
import { services } from '../../core/di/ServiceLocator';
import type { IHapticGateway } from '../../domain/repositories/IHapticGateway';

const THUMB_SIZE = 28;
const MIN_RADIUS = 50;
const MAX_RADIUS = 1000;
const RADIUS_DELTA = MAX_RADIUS - MIN_RADIUS;
const TICK_STEP = 50; // Threshold crossing step in meters

interface Props {
  radius: number;
  onChangeRadius: (newRadius: number) => void;
  hapticGateway?: IHapticGateway;
}

export const TactileRadiusScrubber: React.FC<Props> = ({
  radius,
  onChangeRadius,
  hapticGateway = services.hapticGateway,
}) => {
  // Available scrub path width (total width - thumb width)
  const trackWidth = useSharedValue<number>(0);
  const thumbX = useSharedValue<number>(0);
  const startX = useSharedValue<number>(0);
  const isDragging = useSharedValue<boolean>(false);
  const lastBucket = useSharedValue<number>(Math.floor(radius / TICK_STEP));

  // Bridge haptic tick to JS thread
  const onHapticTick = useCallback(() => {
    hapticGateway.triggerTick();
  }, [hapticGateway]);

  // Sync external radius changes when not actively dragging
  useEffect(() => {
    if (!isDragging.value && trackWidth.value > 0) {
      const clamped = Math.max(MIN_RADIUS, Math.min(MAX_RADIUS, radius));
      const ratio = (clamped - MIN_RADIUS) / RADIUS_DELTA;
      thumbX.value = withSpring(ratio * trackWidth.value, {
        damping: 20,
        stiffness: 200,
      });
      lastBucket.value = Math.floor(clamped / TICK_STEP);
    }
  }, [radius, isDragging, trackWidth, thumbX, lastBucket]);

  const onLayoutTrack = useCallback(
    (e: LayoutChangeEvent) => {
      const containerWidth = e.nativeEvent.layout.width;
      const usable = Math.max(0, containerWidth - THUMB_SIZE);
      trackWidth.value = usable;

      const clamped = Math.max(MIN_RADIUS, Math.min(MAX_RADIUS, radius));
      const ratio = (clamped - MIN_RADIUS) / RADIUS_DELTA;
      thumbX.value = ratio * usable;
      lastBucket.value = Math.floor(clamped / TICK_STEP);
    },
    [radius, trackWidth, thumbX, lastBucket],
  );

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      'worklet';
      isDragging.value = true;
      startX.value = thumbX.value;
    })
    .onUpdate((e) => {
      'worklet';
      if (trackWidth.value <= 0) return;

      const nextX = Math.min(Math.max(0, startX.value + e.translationX), trackWidth.value);
      thumbX.value = nextX;

      const ratio = nextX / trackWidth.value;
      const rawRadius = MIN_RADIUS + ratio * RADIUS_DELTA;
      // Round to 5m increments for smooth map rendering
      const computedRadius = Math.round(rawRadius / 5) * 5;

      // Detect 50m threshold crossing
      const currentBucket = Math.floor(computedRadius / TICK_STEP);
      if (currentBucket !== lastBucket.value) {
        lastBucket.value = currentBucket;
        runOnJS(onHapticTick)();
      }

      runOnJS(onChangeRadius)(computedRadius);
    })
    .onFinalize(() => {
      'worklet';
      isDragging.value = false;
    });

  const thumbAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: thumbX.value },
        {
          scale: withSpring(isDragging.value ? 1.18 : 1.0, {
            damping: 14,
            stiffness: 280,
          }),
        },
      ],
    };
  });

  const activeTrackAnimatedStyle = useAnimatedStyle(() => {
    return {
      width: thumbX.value + THUMB_SIZE / 2,
    };
  });

  return (
    <View style={styles.container}>
      {/* Top Header: Technical Readout & Scale Indicators */}
      <View style={styles.readoutRow}>
        <View style={styles.readoutBadge}>
          <Text style={styles.readoutPrefix}>ZONE RADIUS</Text>
          <Text style={styles.readoutValue}>{radius}m</Text>
        </View>
        <View style={styles.steppingPill}>
          <Text style={styles.steppingText}>50m tactile detents</Text>
        </View>
      </View>

      {/* Scrubber Gesture Track Area */}
      <GestureDetector gesture={panGesture}>
        <View style={styles.gestureContainer} onLayout={onLayoutTrack}>
          {/* Base Inactive Track */}
          <View style={styles.trackBackground} />

          {/* Active Highlight Track */}
          <Animated.View style={[styles.activeTrack, activeTrackAnimatedStyle]} />

          {/* Graduation Ticks (50m, 250m, 500m, 750m, 1000m) */}
          <View style={styles.ticksContainer} pointerEvents="none">
            <View style={[styles.tickMark, { left: '0%' }]} />
            <View style={[styles.tickMark, { left: '21%' }]} />
            <View style={[styles.tickMark, styles.tickMarkMajor, { left: '47.3%' }]} />
            <View style={[styles.tickMark, { left: '73.6%' }]} />
            <View style={[styles.tickMark, { left: '100%' }]} />
          </View>

          {/* Tactile Thumb Handle */}
          <Animated.View style={[styles.thumb, thumbAnimatedStyle]}>
            <View style={styles.thumbInnerGlow} />
            <View style={styles.thumbCenterDot} />
          </Animated.View>
        </View>
      </GestureDetector>

      {/* Graduation Labels */}
      <View style={styles.labelsRow}>
        <Text style={styles.scaleLabel}>50m</Text>
        <Text style={styles.scaleLabel}>250m</Text>
        <Text style={[styles.scaleLabel, styles.scaleLabelMid]}>500m</Text>
        <Text style={styles.scaleLabel}>750m</Text>
        <Text style={styles.scaleLabel}>1000m</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 4,
  },
  readoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  readoutBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  readoutPrefix: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  readoutValue: {
    color: '#0F172A',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
  },
  steppingPill: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  steppingText: {
    color: '#4338CA',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  gestureContainer: {
    height: 40,
    justifyContent: 'center',
    position: 'relative',
  },
  trackBackground: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
    width: '100%',
  },
  activeTrack: {
    position: 'absolute',
    left: 0,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2563EB',
  },
  ticksContainer: {
    position: 'absolute',
    left: THUMB_SIZE / 2,
    right: THUMB_SIZE / 2,
    height: 12,
    justifyContent: 'center',
  },
  tickMark: {
    position: 'absolute',
    width: 2,
    height: 6,
    borderRadius: 1,
    backgroundColor: '#94A3B8',
    marginLeft: -1,
  },
  tickMarkMajor: {
    height: 10,
    backgroundColor: '#475569',
  },
  thumb: {
    position: 'absolute',
    top: (40 - THUMB_SIZE) / 2,
    left: 0,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  thumbInnerGlow: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#DBEAFE',
  },
  thumbCenterDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1D4ED8',
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginTop: 6,
  },
  scaleLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
    fontVariant: ['tabular-nums'],
  },
  scaleLabelMid: {
    color: '#64748B',
    fontWeight: '800',
  },
});
