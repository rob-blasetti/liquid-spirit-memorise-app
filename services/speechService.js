/**
 * Simple wrapper around `react-native-tts` used throughout the app.
 * The module is imported once and reused to avoid repeatedly attaching
 * event listeners which can lead to memory leaks or recursive speech
 * loops on some devices.
 */
import Tts from 'react-native-tts';

let initialized = false;

/**
 * Ensure the TTS engine is ready.  `react-native-tts` lazily initialises
 * and will reject if called before the underlying native modules are
 * prepared.  We cache the initialisation so subsequent calls are cheap.
 */
const init = async () => {
  if (initialized) return;
  try {
    await Tts.getInitStatus();
    initialized = true;
  } catch (err) {
    console.warn('TTS initialization failed', err);
  }
};

/**
 * Speak the given text out loud.
 * The engine is initialised on first use and reused afterwards.
 */
export const readQuote = async (text) => {
  if (!text) return;
  await init();
  try {
    await Tts.stop();
    // `speak` does not return a promise; no need to await
    Tts.speak(String(text));
  } catch (e) {
    console.error('TTS error reading quote:', e);
  }
};

/**
 * Stop any speech currently in progress.
 */
export const stop = async () => {
  try {
    await init();
    await Tts.stop();
  } catch (_) {
    // ignore errors when stopping
  }
};

// Default export for convenience
export default { readQuote, stop };