/**
 * Service to read text aloud using a text-to-speech (TTS) implementation.
 * Uses react-native-tts for real functionality.
 */

// Lazy import to prevent initialization issues
let Tts = null;

const initializeTTS = () => {
  if (!Tts) {
    try {
      Tts = require('react-native-tts');
      console.log('TTS module loaded successfully');
    } catch (error) {
      console.error('Failed to load TTS module:', error);
      return false;
    }
  }
  return true;
};

/**
 * Speak the given text out loud using react-native-tts.
 * @param {string} text - The text to speak.
 */
// Flag to prevent multiple simultaneous TTS calls
let isSpeaking = false;

// Emergency stop function - call this immediately!
export const stopTTS = async () => {
  try {
    if (initializeTTS() && Tts) {
      await Tts.stop();
      isSpeaking = false;
      console.log('TTS emergency stopped');
    }
  } catch (error) {
    console.error('Error stopping TTS:', error);
  }
};

export const readQuote = async (text) => {
  // Add debug info to see where this is being called from
  console.log('=== readQuote called ===');
  console.log('Text:', text);
  console.log('Call stack:', new Error().stack);
  
  // Prevent multiple calls
  if (isSpeaking) {
    console.warn('TTS already speaking, ignoring new request');
    return;
  }
  
  // Validate input
  if (!text || typeof text !== 'string' || text.trim() === '') {
    console.warn('Invalid text provided to TTS');
    return;
  }
  
  // Initialize TTS module
  if (!initializeTTS()) {
    console.warn('TTS module not available');
    return;
  }
  
  try {    
    if (!Tts || typeof Tts.speak !== 'function') {
      console.warn('TTS speak function is unavailable');
      return;
    }

    // Clean the text (remove special characters that might cause issues)
    const cleanText = text.replace(/[^\w\s.,!?-]/g, '').trim();
    
    // Stop any current speech first
    await Tts.stop();
    
    // Wait a moment after stopping
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Set basic settings
    try {
      Tts.setDefaultRate(0.5);
      Tts.setDefaultPitch(1.0);
    } catch (settingsError) {
      console.warn('Could not set TTS settings:', settingsError);
    }
    
    // Speak the text
    await Tts.speak(cleanText);
    
  } catch (error) {
    console.error('TTS error:', error);
  }
};

export const setupTTSListeners = (onFinish) => {
  try {
    Tts.addEventListener('tts-start', () => {
      console.log('TTS Started');
    });

    Tts.addEventListener('tts-finish', () => {
      console.log('TTS Finished');
      onFinish?.();
    });

    Tts.addEventListener('tts-cancel', () => {
      console.log('TTS Cancelled');
      onFinish?.();
    });

    Tts.addEventListener('tts-error', (event) => {
      console.error('TTS Error:', event);
      onFinish?.();
    });
  } catch (error) {
    console.warn('Could not set up TTS listeners:', error);
  }
};

// Clean up listeners
export const cleanupTTSListeners = () => {
  try {
    Tts.removeEventListener('tts-start');
    Tts.removeEventListener('tts-finish');
    Tts.removeEventListener('tts-cancel');
    Tts.removeEventListener('tts-error');
  } catch (error) {
    console.warn('Could not cleanup TTS listeners:', error);
  }
};

// Default export for convenience
export default { 
  readQuote, 
  setupTTSListeners, 
  cleanupTTSListeners 
};