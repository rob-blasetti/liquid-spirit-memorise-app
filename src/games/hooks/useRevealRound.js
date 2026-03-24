import { useEffect, useRef } from 'react';

export default function useRevealRound({ resetKey, delayMs = 2000, onReset, onReveal }) {
  const timeoutRef = useRef(null);

  useEffect(() => {
    onReset?.();
    timeoutRef.current = setTimeout(() => {
      onReveal?.();
    }, delayMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [resetKey, delayMs, onReset, onReveal]);
}
