import { useCallback, useMemo, useRef, useState } from 'react';
import ParentalGateModal from '../ui/components/ParentalGateModal';

const randomInt = (min, max) => {
  const minVal = Math.ceil(min);
  const maxVal = Math.floor(max);
  return Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
};

const generateChallenge = () => {
  const operations = [
    { label: 'plus', symbol: '+', fn: (a, b) => a + b },
    { label: 'minus', symbol: '−', fn: (a, b) => a - b },
    { label: 'times', symbol: '×', fn: (a, b) => a * b },
  ];
  const [add, subtract, multiply] = operations;
  const op = operations[randomInt(0, operations.length - 1)];
  let left = randomInt(4, 12);
  let right = randomInt(2, 9);

  if (op === subtract) {
    if (right > left) {
      const tmp = left;
      left = right;
      right = tmp;
    }
  }
  if (op === multiply) {
    left = randomInt(2, 9);
    right = randomInt(2, 6);
  }

  const answer = op.fn(left, right);
  return {
    prompt: `${left} ${op.symbol} ${right} = ?`,
    answer,
  };
};

const useParentalGate = () => {
  const pendingRef = useRef(null);
  const [challenge, setChallenge] = useState(null);
  const [visible, setVisible] = useState(false);

  const closeGate = useCallback(() => {
    setVisible(false);
    setChallenge(null);
  }, []);

  const requestPermission = useCallback(() => {
    if (pendingRef.current) {
      pendingRef.current.reject?.(new Error('Parental gate already pending.'));
      pendingRef.current = null;
    }
    const nextChallenge = generateChallenge();
    setChallenge(nextChallenge);
    setVisible(true);
    return new Promise((resolve, reject) => {
      pendingRef.current = { resolve, reject };
    });
  }, []);

  const handleSuccess = useCallback(() => {
    const pending = pendingRef.current;
    pendingRef.current = null;
    closeGate();
    pending?.resolve(true);
  }, [closeGate]);

  const handleCancel = useCallback(() => {
    const pending = pendingRef.current;
    pendingRef.current = null;
    closeGate();
    pending?.resolve(false);
  }, [closeGate]);

  const modal = useMemo(() => {
    if (!challenge) return null;
    return (
      <ParentalGateModal
        visible={visible}
        challenge={challenge}
        onSubmit={handleSuccess}
        onCancel={handleCancel}
      />
    );
  }, [challenge, handleCancel, handleSuccess, visible]);

  return {
    requestPermission,
    ParentalGate: modal,
  };
};

export default useParentalGate;
