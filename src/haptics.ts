// Haptic Feedback for Mobile Devices

/**
 * Checks if the Vibration API is supported
 */
function isVibrationSupported(): boolean {
  return 'vibrate' in navigator;
}

/**
 * Vibrate with a pattern (duration in ms or array of durations)
 */
function vibrate(pattern: number | number[]): void {
  if (isVibrationSupported()) {
    navigator.vibrate(pattern);
  }
}

/**
 * Haptic feedback when snake eats food
 * Short, satisfying vibration
 */
export function hapticEatFood(): void {
  vibrate(50);
}

/**
 * Haptic feedback when game is over
 * Longer vibration pattern to indicate failure
 */
export function hapticGameOver(): void {
  vibrate([100, 50, 100]);
}

/**
 * Light haptic feedback when direction changes
 * Very subtle to not be intrusive
 */
export function hapticDirectionChange(): void {
  vibrate(15);
}

/**
 * Stop all vibrations
 */
export function stopVibration(): void {
  if (isVibrationSupported()) {
    navigator.vibrate(0);
  }
}
