import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_PREFIX = 'coloring-progress:';

const buildStorageKey = (profileId) => {
  if (!profileId) return null;
  return `${STORAGE_PREFIX}${profileId}`;
};

export const loadColoringProgress = async (profileId) => {
  const key = buildStorageKey(profileId);
  if (!key) return {};
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed;
  } catch (error) {
    console.warn('loadColoringProgress failed', error);
    return {};
  }
};

export const saveColoringProgress = async (profileId, imageId, drawing) => {
  const key = buildStorageKey(profileId);
  if (!key || !imageId) return {};
  const sanitizedDrawing = drawing && typeof drawing === 'object'
    ? {
        strokes: Array.isArray(drawing.strokes) ? drawing.strokes : [],
        canvasSize: drawing.canvasSize || null,
        updatedAt: drawing.updatedAt || Date.now(),
      }
    : { strokes: [], canvasSize: null, updatedAt: Date.now() };
  try {
    const existing = await loadColoringProgress(profileId);
    const next = { ...existing, [imageId]: sanitizedDrawing };
    await AsyncStorage.setItem(key, JSON.stringify(next));
    return next;
  } catch (error) {
    console.warn('saveColoringProgress failed', error);
    return {};
  }
};
