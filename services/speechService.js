import elevenLabs from './elevenLabsTTS';

// Keep track of listeners/subscriptions so we can remove them safely
let finishHandler = null;

// Backwards-compat stub (no-op) retained to avoid import errors
export const stopTTS = async () => {};

export const readQuote = async (text, ttsVoice, cancelRef) => {
  if (!text || typeof text !== 'string' || text.trim() === '') {
    console.warn('Invalid text provided to TTS');
    return;
  }

  try {
    // Stop any ongoing speech before starting
    await elevenLabs.stop();
    if (cancelRef?.current) return;
    // Use ElevenLabs cloud TTS with local caching
    // If provided ttsVoice doesn't look like an ElevenLabs ID, fall back to env default
    const looksLikeUuid = typeof ttsVoice === 'string' && /^[a-f0-9-]{10,}$/i.test(ttsVoice);
    const elVoiceId = looksLikeUuid ? ttsVoice : undefined;
    await elevenLabs.playText({ text, voiceId: elVoiceId, onEnd: finishHandler });
  } catch (error) {
    console.error('TTS error:', error);
  }
};

export const setupTTSListeners = (onFinish) => {
  // No native TTS events; ElevenLabs playback calls back via onEnd
  finishHandler = onFinish;
};

export const cleanupTTSListeners = () => {
  finishHandler = null;
};

// Also export a hard stop that stops both engines
export const hardStop = async () => {
  try {
    await elevenLabs.stop();
  } catch {}
};

export default {
  readQuote,
  stopTTS,
  setupTTSListeners,
  cleanupTTSListeners,
  hardStop,
};
