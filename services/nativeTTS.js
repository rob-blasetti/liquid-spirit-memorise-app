import { Platform, NativeModules } from 'react-native';
import Tts from 'react-native-tts';

const DEFAULT_IOS_VOICE = 'com.apple.ttsbundle.Samantha-compact';
const DEFAULT_ANDROID_RATE = 0.5;
const DEFAULT_IOS_RATE = 0.45;

let subscriptions = [];
let finishCallback = null;
const nativeModule =
  NativeModules?.TextToSpeech ||
  NativeModules?.RNTts ||
  NativeModules?.RNTextToSpeech;
const isAvailable = Boolean(nativeModule);

const stopTts = async () => {
  if (Platform.OS === 'ios') {
    await Tts.stop(false);
  } else {
    await Tts.stop();
  }
};

const cleanText = value =>
  String(value || '')
    .replace(/\s+/g, ' ')
    .trim();

const warnUnavailable = () => {
  console.warn('nativeTTS: platform TTS module is not linked; skipping playback');
};

const ensureInitialized = async () => {
  if (!isAvailable) {
    warnUnavailable();
    return false;
  }
  try {
    await Tts.getInitStatus();
  } catch (error) {
    // iOS may throw until just-in-time initialization finishes; retry after init
    if (error?.code === 'not_found_language') {
      throw error;
    }
  }
  return true;
};

export const speak = async (text, voiceId, cancelRef) => {
  const trimmed = cleanText(text);
  if (!trimmed) {
    console.warn('nativeTTS: nothing to speak');
    return;
  }
  try {
    const ready = await ensureInitialized();
    if (!ready) {
      finishCallback?.();
      return;
    }
    await stopTts();
    if (cancelRef?.current) {
      return;
    }

    if (voiceId) {
      try {
        await Tts.setDefaultVoice(voiceId);
      } catch (voiceErr) {
        console.warn('nativeTTS: failed to set voice', voiceErr);
      }
    } else if (Platform.OS === 'ios') {
      try {
        await Tts.setDefaultVoice(DEFAULT_IOS_VOICE);
      } catch (iosVoiceErr) {
        console.warn('nativeTTS: failed to apply default iOS voice', iosVoiceErr);
      }
    }

    try {
      const rate = Platform.OS === 'ios' ? DEFAULT_IOS_RATE : DEFAULT_ANDROID_RATE;
      Tts.setDefaultRate(rate, true);
      Tts.setDefaultPitch(1.0);
    } catch (rateErr) {
      console.warn('nativeTTS: failed to adjust rate/pitch', rateErr);
    }

    if (!cancelRef?.current) {
      Tts.speak(trimmed);
    }
  } catch (error) {
    console.warn('nativeTTS: playback failed', error);
    finishCallback?.();
  }
};

export const stop = async () => {
  try {
    const ready = await ensureInitialized();
    if (!ready) {
      return;
    }
    await stopTts();
  } catch (error) {
    console.warn('nativeTTS: stop failed', error);
  }
};

export const setupListeners = onFinish => {
  finishCallback = onFinish;
  cleanupListeners();

  if (!isAvailable) {
    return;
  }

  try {
    subscriptions = [
      Tts.addEventListener('tts-finish', () => finishCallback?.()),
      Tts.addEventListener('tts-cancel', () => finishCallback?.()),
    ];
  } catch (error) {
    console.warn('nativeTTS: failed to register listeners', error);
  }
};

export const cleanupListeners = () => {
  subscriptions.forEach(sub => {
    try {
      sub?.remove?.();
    } catch {}
  });
  subscriptions = [];
};

export default {
  speak,
  stop,
  setupListeners,
  cleanupListeners,
};
