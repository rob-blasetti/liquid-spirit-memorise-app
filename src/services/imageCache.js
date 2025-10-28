import FastImage from 'react-native-fast-image';

// Simple, deduped, size-limited preloader for FastImage
// Use to warm cache before rendering heavy lists or avatars.
const MAX_TO_PRELOAD = 60; // guardrail to avoid memory spikes

export function preloadImages(uris = [], { priority = 'normal' } = {}) {
  if (!Array.isArray(uris) || uris.length === 0) return;
  // Dedupe, drop falsy, and cap
  const unique = Array.from(new Set(uris.filter(Boolean))).slice(0, MAX_TO_PRELOAD);
  if (unique.length === 0) return;

  const prio =
    priority === 'high'
      ? FastImage.priority.high
      : priority === 'low'
      ? FastImage.priority.low
      : FastImage.priority.normal;

  try {
    FastImage.preload(
      unique.map((uri) => ({ uri, priority: prio }))
    );
  } catch (e) {
    // Non-fatal: preloading is best-effort
    // eslint-disable-next-line no-console
    console.warn('Image preload failed', e);
  }
}

export function collectChildAndClassImageUris(children = []) {
  const uris = [];
  children.forEach((entry) => {
    const child = entry?.child || entry;
    if (!child) return;
    // Child avatar
    uris.push(child.profilePicture || child.avatar);
    // Class header images
    const classList = child.classes || child.class || [];
    classList.forEach((cls) => {
      if (cls?.imageUrl) uris.push(cls.imageUrl);
      // Teacher + student avatars
      (cls.facilitators || []).forEach((p) => uris.push(p?.profilePicture || p?.avatar));
      (cls.participants || []).forEach((p) => uris.push(p?.profilePicture || p?.avatar));
    });
  });
  return uris;
}

export default { preloadImages, collectChildAndClassImageUris };
