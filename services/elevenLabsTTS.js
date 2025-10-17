import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
import { Buffer } from 'buffer';
import Sound from '../vendor/react-native-sound';
import {
  ELEVENLABS_API_KEY,
  ELEVENLABS_VOICE_ID,
  ELEVENLABS_MODEL_ID,
  ELEVENLABS_OPTIMIZE_STREAMING,
  TTS_CACHE_MAX_MB,
} from '../config';
import { DEFAULT_TTS_SPEED, MIN_TTS_SPEED, MAX_TTS_SPEED } from './ttsDefaults';

let currentSound = null;
let currentSpeed = DEFAULT_TTS_SPEED;

const AUDIO_DIR = `${RNFS.DocumentDirectoryPath}/tts_cache`;
let CACHE_MAX_BYTES = Math.max(16, Number(TTS_CACHE_MAX_MB) || 64) * 1024 * 1024;
const inflight = new Map(); // key -> Promise<string>

async function ensureDir() {
  try {
    const exists = await RNFS.exists(AUDIO_DIR);
    if (!exists) await RNFS.mkdir(AUDIO_DIR);
  } catch {}
}

function safeKey(str) {
  return str.replace(/[^a-z0-9-_]/gi, '_').slice(0, 64);
}

function normalizeText(text) {
  try {
    return String(text || '')
      .replace(/[^\w\s.,!?-]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  } catch {
    return '';
  }
}

async function getCachePath(text, voiceId, modelId) {
  const key = safeKey(`${voiceId || 'default'}_${modelId || ''}_${text}`);
  return `${AUDIO_DIR}/${key}.mp3`;
}

async function readEntries() {
  await ensureDir();
  try {
    const list = await RNFS.readDir(AUDIO_DIR);
    return list.filter(x => x.isFile() && x.name?.endsWith('.mp3'));
  } catch {
    return [];
  }
}

async function getTotalBytes(entries) {
  try {
    let total = 0;
    for (const e of entries) {
      if (typeof e.size === 'number') total += e.size;
      else {
        try { const s = await RNFS.stat(e.path); total += Number(s.size) || 0; } catch {}
      }
    }
    return total;
  } catch { return 0; }
}

async function enforceCacheLimit() {
  try {
    const entries = await readEntries();
    let total = await getTotalBytes(entries);
    if (total <= CACHE_MAX_BYTES) return;
    // Oldest first by mtime
    const sorted = entries.slice().sort((a, b) => {
      const am = a.mtime ? new Date(a.mtime).getTime() : 0;
      const bm = b.mtime ? new Date(b.mtime).getTime() : 0;
      return am - bm;
    });
    for (const e of sorted) {
      try { await RNFS.unlink(e.path); } catch {}
      total -= Number(e.size) || 0;
      if (total <= CACHE_MAX_BYTES) break;
    }
  } catch {}
}

export async function synthesizeToFile({ text, voiceId = ELEVENLABS_VOICE_ID, modelId = ELEVENLABS_MODEL_ID }) {
  if (!ELEVENLABS_API_KEY || !voiceId) {
    throw new Error('Missing ElevenLabs API key or voice id');
  }
  await ensureDir();
  const normalized = normalizeText(text);
  if (!normalized) throw new Error('Empty text');
  const path = await getCachePath(normalized, voiceId, modelId);
  const exists = await RNFS.exists(path);
  if (exists) return path;
  const key = `${voiceId}|${modelId}|${normalized}`;
  if (inflight.has(key)) return inflight.get(key);

  const p = (async () => {
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
    const body = {
      model_id: modelId,
      text: normalized,
      optimize_streaming_latency: ELEVENLABS_OPTIMIZE_STREAMING,
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.2,
        use_speaker_boost: true,
      },
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => '');
      throw new Error(`ElevenLabs failed ${res.status}: ${t}`);
    }
    const buf = await res.arrayBuffer();
    const b = Buffer.from(buf);
    await RNFS.writeFile(path, b.toString('base64'), 'base64');
    // Enforce cache limits after writing
    await enforceCacheLimit();
    return path;
  })();

  inflight.set(key, p);
  try {
    const result = await p;
    return result;
  } finally {
    inflight.delete(key);
  }
}

export async function playText({ text, voiceId, onEnd }) {
  // stop any ongoing audio
  await stop();
  const filePath = await synthesizeToFile({ text, voiceId });
  return new Promise((resolve, reject) => {
    const sound = new Sound(filePath, '', (err) => {
      if (err) {
        reject(err);
        return;
      }
      currentSound = sound;
      try { sound.setSpeed(currentSpeed); } catch {}
      // Mark as recently used
      try { RNFS.touch?.(filePath, new Date(), new Date()); } catch {}
      sound.play((success) => {
        if (success) {
          onEnd?.();
          resolve(true);
        } else {
          reject(new Error('Playback failed'));
        }
      });
    });
  });
}

export async function stop() {
  try {
    if (currentSound) {
      const sound = currentSound;
      currentSound = null;
      sound.stop(() => {
        try { sound.release(); } catch {}
      });
    }
  } catch {}
}

export function setSpeed(value) {
  const numeric = Number(value);
  const fallback = Number.isFinite(numeric) ? numeric : DEFAULT_TTS_SPEED;
  const v = Math.max(MIN_TTS_SPEED, Math.min(MAX_TTS_SPEED, fallback));
  currentSpeed = v;
  try {
    if (currentSound && typeof currentSound.setSpeed === 'function') {
      currentSound.setSpeed(v);
    }
  } catch {}
}

export async function getCacheStats() {
  const entries = await readEntries();
  const totalBytes = await getTotalBytes(entries);
  return { totalBytes, fileCount: entries.length, maxBytes: CACHE_MAX_BYTES };
}

export async function clearCache() {
  const entries = await readEntries();
  for (const e of entries) {
    try { await RNFS.unlink(e.path); } catch {}
  }
}

export function setCacheMaxBytes(bytes) {
  const v = Math.max(16 * 1024 * 1024, Number(bytes) || CACHE_MAX_BYTES);
  CACHE_MAX_BYTES = v;
}

export default { playText, stop, synthesizeToFile, setSpeed, getCacheStats, clearCache, setCacheMaxBytes };
