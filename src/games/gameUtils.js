export const shuffleItems = (items) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export const resolveQuoteText = (quote) =>
  typeof quote === 'string' ? quote : quote?.text || '';

export const clampLevelWordLimit = (level, limits = {1: 8, 2: 12, 3: 16}) => {
  if (level === 1) return limits[1];
  if (level === 2) return limits[2];
  return limits[3];
};
