/**
 * data/adapters/ReactNativeHapticAdapter.ts
 *
 * Implements IHapticGateway via react-native-haptic-feedback.
 * Configured with selection/impactLight and vibration fallback for broad device support.
 */
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import type { IHapticGateway } from '../../domain/repositories/IHapticGateway';

const HAPTIC_OPTIONS = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

export class ReactNativeHapticAdapter implements IHapticGateway {
  private static instance: ReactNativeHapticAdapter;

  static getInstance(): ReactNativeHapticAdapter {
    if (!ReactNativeHapticAdapter.instance) {
      ReactNativeHapticAdapter.instance = new ReactNativeHapticAdapter();
    }
    return ReactNativeHapticAdapter.instance;
  }

  triggerTick(): void {
    try {
      ReactNativeHapticFeedback.trigger('impactLight', HAPTIC_OPTIONS);
    } catch (e) {
      // Gracefully handle devices/simulators where haptics are unavailable
      console.debug('[ReactNativeHapticAdapter] Haptic feedback ignored:', e);
    }
  }
}
