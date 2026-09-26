/**
 * domain/repositories/IHapticGateway.ts
 *
 * Domain port for triggering tactile/haptic feedback.
 * Decouples presentation logic and gesture worklets from device-specific haptic APIs.
 */
export interface IHapticGateway {
  /**
   * Fires a precise tactile tick (e.g. selection or light impact)
   * used during discrete increments and threshold crossings.
   */
  triggerTick(): void;
}
