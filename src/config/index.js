import Config from 'react-native-config';

const coerceString = (value, fallback = '') => {
  if (typeof value === 'string') {
    return value.trim();
  }
  if (value == null) {
    return fallback;
  }
  return String(value).trim();
};

const coerceBoolean = value => {
  if (typeof value === 'boolean') return value;
  const normalized = coerceString(value).toLowerCase();
  if (!normalized) return false;
  if (['1', 'true', 'yes', 'y', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'n', 'off'].includes(normalized)) return false;
  return Boolean(normalized);
};

const coerceInteger = (value, fallback) => {
  const numeric = Number.parseInt(coerceString(value), 10);
  return Number.isFinite(numeric) ? numeric : fallback;
};

// Set the API URL
export const API_URL = coerceString(Config.PROD_API);

// ElevenLabs TTS configuration (optional)
export const USE_ELEVENLABS = coerceBoolean(Config.USE_ELEVENLABS);
export const ELEVENLABS_API_KEY = coerceString(Config.ELEVENLABS_API_KEY);
export const ELEVENLABS_VOICE_ID = coerceString(Config.ELEVENLABS_VOICE_ID);
export const ELEVENLABS_MODEL_ID = coerceString(
  Config.ELEVENLABS_MODEL_ID,
  'eleven_multilingual_v2',
) || 'eleven_multilingual_v2';
export const ELEVENLABS_OPTIMIZE_STREAMING = coerceInteger(
  Config.ELEVENLABS_OPTIMIZE_STREAMING,
  0,
) | 0;
// TTS cache max size in MB (disk eviction will keep under this)
export const TTS_CACHE_MAX_MB = Math.max(
  16,
  coerceInteger(Config.TTS_CACHE_MAX_MB, 64) || 64,
);
