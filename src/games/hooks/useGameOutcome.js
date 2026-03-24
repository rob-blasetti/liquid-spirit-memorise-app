import { useCallback, useRef } from 'react';

export default function useGameOutcome({ onWin, onLose }) {
  const hasWonRef = useRef(false);
  const hasLostRef = useRef(false);
  const mistakesRef = useRef(0);

  const resetOutcome = useCallback(() => {
    hasWonRef.current = false;
    hasLostRef.current = false;
    mistakesRef.current = 0;
  }, []);

  const recordMistake = useCallback(() => {
    mistakesRef.current += 1;
    return mistakesRef.current;
  }, []);

  const resolveWin = useCallback((extra = {}) => {
    if (hasWonRef.current) return false;
    hasWonRef.current = true;
    onWin?.({ perfect: mistakesRef.current === 0, ...extra });
    return true;
  }, [onWin]);

  const resolveLose = useCallback((extra = {}) => {
    if (hasLostRef.current) return false;
    hasLostRef.current = true;
    onLose?.(extra);
    return true;
  }, [onLose]);

  return {
    hasWonRef,
    hasLostRef,
    mistakesRef,
    resetOutcome,
    recordMistake,
    resolveWin,
    resolveLose,
  };
}
