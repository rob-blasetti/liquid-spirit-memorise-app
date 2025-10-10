import Config from 'react-native-config';

// Set the API URL
export const API_URL = Config.DEV_API;

// ElevenLabs TTS configuration (optional)
export const USE_ELEVENLABS = (Config.USE_ELEVENLABS || '').toLowerCase() === 'true';
export const ELEVENLABS_API_KEY = Config.ELEVENLABS_API_KEY || '';
export const ELEVENLABS_VOICE_ID = Config.ELEVENLABS_VOICE_ID || '';
export const ELEVENLABS_MODEL_ID = Config.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2';
export const ELEVENLABS_OPTIMIZE_STREAMING = (Config.ELEVENLABS_OPTIMIZE_STREAMING || '0') | 0;
// TTS cache max size in MB (disk eviction will keep under this)
export const TTS_CACHE_MAX_MB = Math.max(16, parseInt(Config.TTS_CACHE_MAX_MB || '64', 10) || 64);
