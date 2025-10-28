import { useCallback, useEffect, useRef, useState } from 'react';

const DEFAULT_DURATION_MS = 2600;

/**
 * Shared hook for transient gameplay feedback banners.
 * Returns the latest feedback payload alongside helpers to show and clear it.
 */
const useGameFeedback = ({ duration = DEFAULT_DURATION_MS } = {}) => {
  const [feedback, setFeedback] = useState(null);
  const timerRef = useRef(null);

  const clearFeedback = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setFeedback(null);
  }, []);

  const showFeedback = useCallback(
    (text, options = {}) => {
      const { tone = 'warning', duration: overrideDuration } = options;
      if (!text) {
        clearFeedback();
        return;
      }
      const payload = {
        id: Date.now() + Math.random(),
        text: String(text),
        tone,
      };
      setFeedback(payload);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      const timeout = typeof overrideDuration === 'number' ? overrideDuration : duration;
      if (timeout > 0) {
        timerRef.current = setTimeout(() => {
          timerRef.current = null;
          setFeedback(null);
        }, timeout);
      } else {
        timerRef.current = null;
      }
    },
    [clearFeedback, duration],
  );

  useEffect(() => clearFeedback, [clearFeedback]);

  return {
    feedback,
    showFeedback,
    clearFeedback,
  };
};

export default useGameFeedback;
