import { Platform } from 'react-native';
import Tts from 'react-native-tts';

// Keep track of listeners/subscriptions so we can remove them safely
let subscriptions = [];
let finishHandler = null;

export const stopTTS = async () => {
  try {
    await Tts.getInitStatus();
    // Explicitly pass a boolean on iOS to avoid undefined
    if (Platform.OS === 'ios') {
      await Tts.stop(false);
    } else {
      await Tts.stop();
    }
    console.log('TTS emergency stopped');
  } catch (error) {
    console.warn('TTS error:', error);
  }
};

export const readQuote = async (text, ttsVoice, cancelRef) => {
  console.log('=== readQuote called ===');
  console.log('Text:', text);
  const availableVoices = await Tts.voices();
  console.log(availableVoices);

  if (!text || typeof text !== 'string' || text.trim() === '') {
    console.warn('Invalid text provided to TTS');
    return;
  }

  try {
    // Clean the text
    const cleanText = text.replace(/[^\w\s.,!?-]/g, '').trim();

    // Stop any ongoing speech before starting
    await stopTTS();
    if (cancelRef?.current) return;

    // Set voice if provided
    if (ttsVoice) {
      await Tts.setDefaultVoice(ttsVoice);
    }
    if (cancelRef?.current) return;

    try {
      Tts.setDefaultRate(0.5, true);
      Tts.setDefaultPitch(1.0);
    } catch (settingsError) {
      console.warn('Could not set TTS settings:', settingsError);
    }

    if (!cancelRef?.current) {
      Tts.speak(cleanText);
    }
  } catch (error) {
    console.error('TTS error:', error);
  }
};

export const setupTTSListeners = (onFinish) => {
  try {
    finishHandler = onFinish;
    // Use event subscriptions from react-native-tts
    subscriptions.push(
      Tts.addEventListener('tts-start', () => console.log('TTS Started')),
    );
    subscriptions.push(
      Tts.addEventListener('tts-finish', () => {
        console.log('TTS Finished');
        finishHandler?.();
      }),
    );
    subscriptions.push(
      Tts.addEventListener('tts-cancel', () => {
        console.log('TTS Cancelled');
        finishHandler?.();
      }),
    );
    // Note: 'tts-error' is not a supported event on iOS module; skip subscribing.
  } catch (error) {
    console.warn('Could not set up TTS listeners:', error);
  }
};

export const cleanupTTSListeners = () => {
  try {
    // Remove any added subscriptions (Android)
    subscriptions.forEach((sub) => {
      if (sub && typeof sub.remove === 'function') {
        try {
          sub.remove();
        } catch (e) {
          // ignore
        }
      }
    });
    subscriptions = [];
    finishHandler = null;
  } catch (error) {
    console.warn('Could not cleanup TTS listeners:', error);
  }
};

export default {
  readQuote,
  stopTTS,
  setupTTSListeners,
  cleanupTTSListeners
};
