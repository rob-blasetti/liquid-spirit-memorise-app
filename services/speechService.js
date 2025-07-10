/**
 * Service to read text aloud using a text-to-speech (TTS) implementation.
 * Currently a placeholder that logs the text. Integrate a TTS library
 * such as react-native-tts or expo-speech for real functionality.
 */
// Lazy require Tts to avoid NativeEventEmitter warnings at module load
// import Tts from 'react-native-tts';

/**
 * Read the provided text out loud.
 * @param {string} text - The text to speak.
 */
/**
 * Speak the given text out loud using react-native-tts.
 * @param {string} text - The text to speak.
 */
/**
 * Speak the given text out loud using react-native-tts.
 * Lazily requires the library to avoid initialization errors.
 * @param {string} text - The text to speak.
 */
export const readQuote = async (text) => {
  let Tts;
  try {
    Tts = require('react-native-tts');
  } catch {
    console.warn('TTS module not available');
    return;
  }
  if (!Tts || typeof Tts.speak !== 'function') {
    console.warn('TTS speak function is unavailable');
    return;
  }
  try {
    await Tts.stop();
    await Tts.speak(text);
  } catch (e) {
    console.error('TTS error reading quote:', e);
  }
};

// Default export for convenience
export default { readQuote };