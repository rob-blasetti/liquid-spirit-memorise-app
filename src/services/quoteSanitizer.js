// services/quoteSanitizer.js
// Helpers for preparing quote text for gameplay without altering original display.

/**
 * Remove ellipsis characters so games do not treat them as separate words.
 * Collapses whitespace introduced by removals.
 *
 * @param {string} input
 * @returns {string}
 */
export const sanitizeQuoteText = (input) => {
  if (typeof input !== 'string' || input.length === 0) {
    return '';
  }
  // Replace unicode ellipsis and runs of periods with a single space placeholder.
  let result = input.replace(/\u2026/g, ' ').replace(/\.{3,}/g, ' ');
  // Collapse any excessive whitespace created by replacements.
  result = result.replace(/\s+/g, ' ').trim();
  return result;
};

/**
 * Determine if a token contains letters or digits (including accented letters).
 *
 * @param {string} input
 * @returns {boolean}
 */
export const hasPlayableCharacters = (input) => {
  if (typeof input !== 'string' || input.length === 0) {
    return false;
  }
  if (/[A-Za-z0-9]/.test(input)) {
    return true;
  }
  for (const char of input) {
    const code = char.codePointAt(0);
    if (code >= 48 && code <= 57) {
      return true;
    }
    const lower = char.toLocaleLowerCase();
    const upper = char.toLocaleUpperCase();
    if (lower !== upper) {
      return true;
    }
  }
  return false;
};

/**
 * Provide both the original and sanitized forms of the incoming quote prop.
 *
 * @param {string|{text?: string}} quoteProp
 * @returns {{ raw: string, sanitized: string }}
 */
export const getQuoteTextVariants = (quoteProp) => {
  const raw =
    typeof quoteProp === 'string'
      ? quoteProp
      : (quoteProp && typeof quoteProp.text === 'string' && quoteProp.text) || '';
  return { raw, sanitized: sanitizeQuoteText(raw) };
};

/**
 * Split quote text into words, retaining original tokens and providing playable variants.
 *
 * @param {string} rawText
 * @returns {Array<{ index: number, original: string, clean: string, playable: boolean }>}
 */
export const deriveWordEntries = (rawText) => {
  if (typeof rawText !== 'string' || rawText.trim() === '') {
    return [];
  }
  const tokens = rawText.trim().split(/\s+/);
  return tokens.map((token, index) => {
    const clean = sanitizeQuoteText(token);
    const canonicalCore = hasPlayableCharacters(clean)
      ? clean
          .toLocaleLowerCase()
          .replace(/[^\p{L}\p{N}]+/gu, '')
      : clean;
    return {
      index,
      original: token,
      clean,
      playable: hasPlayableCharacters(clean),
      canonical: canonicalCore,
    };
  });
};

/**
 * Convenience to compute raw/sanitized text alongside word breakdown.
 *
 * @param {string|{text?: string}} quoteProp
 * @param {{ raw?: string, sanitized?: string }} [overrides]
 * @returns {{ raw: string, sanitized: string, entries: ReturnType<typeof deriveWordEntries> }}
 */
export const prepareQuoteForGame = (quoteProp, overrides = {}) => {
  const { raw: overrideRaw, sanitized: overrideSanitized } = overrides;
  const baseRaw =
    overrideRaw ??
    (typeof quoteProp === 'string'
      ? quoteProp
      : (quoteProp && typeof quoteProp.text === 'string' && quoteProp.text) || '');
  const raw = baseRaw || '';
  const sanitized = overrideSanitized ?? sanitizeQuoteText(raw);
  const entries = deriveWordEntries(raw);
  const playableEntries = entries.filter((entry) => entry.playable);
  const playableWords = playableEntries.map((entry) => entry.clean);
  const uniquePlayableWords = (() => {
    const seen = new Set();
    const result = [];
    playableEntries.forEach((entry) => {
      const key = entry.canonical || entry.clean;
      if (!key) return;
      if (seen.has(key)) return;
      seen.add(key);
      result.push({ word: entry.clean, entry });
    });
    return result;
  })();
  const wordFrequency = (() => {
    const freq = new Map();
    playableEntries.forEach((entry) => {
      const key = entry.canonical || entry.clean;
      if (!key) return;
      const prev = freq.get(key) || { count: 0, sample: entry.clean, entries: [] };
      prev.count += 1;
      prev.entries.push(entry);
      if (!prev.sample) {
        prev.sample = entry.clean;
      }
      freq.set(key, prev);
    });
    return freq;
  })();
  return {
    raw,
    sanitized,
    entries,
    playableEntries,
    playableWords,
    uniquePlayableWords,
    wordFrequency,
  };
};

/**
 * Pick up to `limit` unique playable words, excluding any canonical keys supplied.
 *
 * @param {Array<{ word: string, entry: object }>} uniquePlayableWords
 * @param {number} limit
 * @param {Set<string>} [excludeCanonical]
 * @returns {Array<{ word: string, entry: object }>}
 */
export const pickUniqueWords = (uniquePlayableWords, limit, excludeCanonical = new Set()) => {
  if (!Array.isArray(uniquePlayableWords) || uniquePlayableWords.length === 0 || limit <= 0) {
    return [];
  }
  const available = uniquePlayableWords.filter(({ entry }) => {
    const key = entry.canonical || entry.clean;
    return key && !excludeCanonical.has(key);
  });
  const pool = [...available];
  const picks = [];
  while (pool.length > 0 && picks.length < limit) {
    const idx = Math.floor(Math.random() * pool.length);
    const [candidate] = pool.splice(idx, 1);
    const { word, entry } = candidate;
    const key = entry.canonical || entry.clean;
    if (!key || excludeCanonical.has(key)) continue;
    picks.push(candidate);
    excludeCanonical.add(key);
  }
  return picks;
};

export default sanitizeQuoteText;

/**
 * Derive a trimmed, display-friendly word for game surfaces.
 *
 * @param {{ original?: string, clean?: string }} entry
 * @param {string} [fallback='…']
 * @returns {string}
 */
export const getEntryDisplayWord = (entry, fallback = '…') => {
  if (!entry) return fallback;
  const source = (entry.original || entry.clean || '').trim();
  if (source.length === 0) {
    const cleaned = (entry.clean || entry.original || '').trim();
    return cleaned.length > 0 ? cleaned : fallback;
  }
  const stripped = source.replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, '');
  if (stripped.length > 0) return stripped;
  const cleaned = (entry.clean || entry.original || '').trim();
  return cleaned.length > 0 ? cleaned : fallback;
};
