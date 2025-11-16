// Haptic Feedback for Mobile Devices
// Note: iOS/Safari doesn't support Vibration API, so we use audio feedback as fallback

let audioContext: AudioContext | null = null;

/**
 * Initialize audio context (needed for iOS)
 * Call this on user interaction (e.g., first touch or button click)
 */
export function initAudio(): void {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      // Resume context if suspended (iOS requirement)
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
    } catch (e) {
      // Audio not supported
    }
  }
}

/**
 * Checks if the Vibration API is supported
 */
function isVibrationSupported(): boolean {
  return 'vibrate' in navigator && typeof navigator.vibrate === 'function';
}

/**
 * Creates a short beep sound using Web Audio API
 * @param frequency - Frequency in Hz
 * @param duration - Duration in milliseconds
 * @param volume - Volume (0 to 1)
 */
function playBeep(frequency: number, duration: number, volume: number = 0.3): void {
  try {
    // Initialize audio context if not already done
    if (!audioContext) {
      initAudio();
    }

    if (!audioContext) return;

    // Resume if suspended (iOS requirement)
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1000);
  } catch (e) {
    // Audio not supported, fail silently
  }
}

/**
 * Vibrate with a pattern (duration in ms or array of durations)
 * Falls back to audio on iOS
 */
function vibrate(pattern: number | number[], audioFallback?: () => void): void {
  if (isVibrationSupported()) {
    navigator.vibrate(pattern);
  } else if (audioFallback) {
    // iOS fallback: use audio feedback
    audioFallback();
  }
}

/**
 * Haptic feedback when snake eats food
 * Short, satisfying vibration or beep on iOS
 */
export function hapticEatFood(): void {
  vibrate(50, () => playBeep(800, 50, 0.2));
}

/**
 * Haptic feedback when game is over
 * Longer vibration pattern or descending beeps on iOS
 */
export function hapticGameOver(): void {
  vibrate([100, 50, 100], () => {
    playBeep(400, 100, 0.3);
    setTimeout(() => playBeep(300, 100, 0.3), 150);
    setTimeout(() => playBeep(200, 150, 0.3), 300);
  });
}

/**
 * Light haptic feedback when direction changes
 * Very subtle - no audio on iOS to avoid clutter
 */
export function hapticDirectionChange(): void {
  vibrate(15); // No audio fallback to keep it subtle
}

/**
 * Stop all vibrations
 */
export function stopVibration(): void {
  if (isVibrationSupported()) {
    navigator.vibrate(0);
  }
}
