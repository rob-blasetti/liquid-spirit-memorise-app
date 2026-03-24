import { useMemo } from 'react';
import { prepareQuoteForGame, sanitizeQuoteText } from '../../services/quoteSanitizer';

export default function useQuoteGameData({ quote, rawQuote, sanitizedQuote }) {
  const quoteData = useMemo(
    () => prepareQuoteForGame(quote, { raw: rawQuote, sanitized: sanitizedQuote }),
    [quote, rawQuote, sanitizedQuote],
  );

  const entries = quoteData.entries;
  const words = useMemo(
    () => entries.map(entry => entry.original || entry.clean || ''),
    [entries],
  );

  const canonicalize = useMemo(
    () => (value) => sanitizeQuoteText(typeof value === 'string' ? value : '').toLocaleLowerCase(),
    [],
  );

  return {
    quoteData,
    entries,
    words,
    canonicalize,
  };
}
