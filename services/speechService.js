import elevenLabs from './elevenLabsTTS';
import nativeTTS from './nativeTTS';
import {
  USE_ELEVENLABS,
  ELEVENLABS_API_KEY,
  ELEVENLABS_VOICE_ID,
} from '../config';

// Keep track of listeners/subscriptions so we can remove them safely
let finishHandler = null;

// Backwards-compat stub (no-op) retained to avoid import errors
export const stopTTS = async () => {
  await hardStop();
};

const looksLikeUuid = value =>
  typeof value === 'string' && /^[a-z0-9-]{10,}$/i.test(value);

const canUseElevenLabs = voiceHint =>
  USE_ELEVENLABS &&
  Boolean(ELEVENLABS_API_KEY) &&
  (looksLikeUuid(voiceHint) || Boolean(ELEVENLABS_VOICE_ID));

export const readQuote = async (text, ttsVoice, cancelRef) => {
  if (!text || typeof text !== 'string' || text.trim() === '') {
    console.warn('Invalid text provided to TTS');
    return;
  }

  const shouldUseElevenLabs = canUseElevenLabs(ttsVoice);
  if (!shouldUseElevenLabs) {
    await nativeTTS.speak(text, looksLikeUuid(ttsVoice) ? undefined : ttsVoice, cancelRef);
    return;
  }

  try {
    // Stop any ongoing speech before starting
    await elevenLabs.stop();
    if (cancelRef?.current) return;
    // Use ElevenLabs cloud TTS with local caching
    // If provided ttsVoice doesn't look like an ElevenLabs ID, fall back to env default
    const elVoiceId = looksLikeUuid(ttsVoice) ? ttsVoice : undefined;
    await elevenLabs.playText({ text, voiceId: elVoiceId, onEnd: finishHandler });
  } catch (error) {
    console.error('TTS error:', error);
    await nativeTTS.speak(text, undefined, cancelRef);
  }
};

export const setupTTSListeners = (onFinish) => {
  nativeTTS.setupListeners(onFinish);
  // No native TTS events; ElevenLabs playback calls back via onEnd
  finishHandler = onFinish;
};

export const cleanupTTSListeners = () => {
  nativeTTS.cleanupListeners();
  finishHandler = null;
};

// Also export a hard stop that stops both engines
export const hardStop = async () => {
  try {
    await elevenLabs.stop();
  } catch {}
  await nativeTTS.stop();
};

export default {
  readQuote,
  stopTTS,
  setupTTSListeners,
  cleanupTTSListeners,
  hardStop,
};
