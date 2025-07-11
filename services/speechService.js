import Tts from 'react-native-tts';

export const stopTTS = async () => {
  try {
    if (typeof Tts.stop === 'function') {
      const stop = Tts.stop.bind(Tts);
      await stop();
    }
    console.log('TTS emergency stopped');
  } catch (error) {
    console.warn('TTS error:', error);
  }
};

export const readQuote = async (text, ttsVoice) => {
  console.log('=== readQuote called ===');
  console.log('Text:', text);
  Tts.setDefaultVoice('com.apple.ttsbundle.Samantha-compact');

  const availableVoices = await Tts.voices();
  console.log(availableVoices);

  if (!text || typeof text !== 'string' || text.trim() === '') {
    console.warn('Invalid text provided to TTS');
    return;
  }

  try {
    // Clean the text
    const cleanText = text.replace(/[^\w\s.,!?-]/g, '').trim();

    await stopTTS();
    await new Promise(resolve => setTimeout(resolve, 200));

    if (ttsVoice) {
      await Tts.setDefaultVoice(ttsVoice); // ✅ use selected voice
    }

    try {
      Tts.setDefaultRate(0.5, true); // 0.5 rate, true for iOS compatibility
      Tts.setDefaultPitch(1.0); // 1.0 pitch is safe
    } catch (settingsError) {
      console.warn('Could not set TTS settings:', settingsError);
    }

    Tts.speak(cleanText);
  } catch (error) {
    console.error('TTS error:', error);
  }
};

export const setupTTSListeners = (onFinish) => {
  try {
    Tts.addEventListener('tts-start', () => console.log('TTS Started'));
    Tts.addEventListener('tts-finish', () => {
      console.log('TTS Finished');
      onFinish?.();
    });
    Tts.addEventListener('tts-cancel', () => {
      console.log('TTS Cancelled');
      onFinish?.();
    });
  } catch (error) {
    console.warn('Could not set up TTS listeners:', error);
  }
};

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

export default {
  readQuote,
  stopTTS,
  setupTTSListeners,
  cleanupTTSListeners
};
