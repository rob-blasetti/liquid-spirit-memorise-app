import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import ThemedButton from '../components/ThemedButton';
import GameTopBar from '../components/GameTopBar';
import themeVariables from '../styles/theme';
import { prepareQuoteForGame, pickUniqueWords } from '../services/quoteSanitizer';

// Accept onWin callback to award achievements after reward banner
const TapMissingWordsGame = ({ quote, rawQuote, sanitizedQuote, onBack, onWin, onLose }) => {
  const quoteData = useMemo(
    () => prepareQuoteForGame(quote, { raw: rawQuote, sanitized: sanitizedQuote }),
    [quote, rawQuote, sanitizedQuote],
  );
  const rawWords = useMemo(() => quoteData.entries.map((entry) => entry.original), [quoteData.entries]);
  const playableEntries = useMemo(
    () => quoteData.playableEntries,
    [quoteData.playableEntries],
  );
  const playableMap = useMemo(() => {
    const map = new Map();
    playableEntries.forEach((entry) => map.set(entry.index, entry));
    return map;
  }, [playableEntries]);
  const [displayWords, setDisplayWords] = useState([]);
  const [missingWords, setMissingWords] = useState([]);
  const [missingIndices, setMissingIndices] = useState([]);
  const [wordBank, setWordBank] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [message, setMessage] = useState('');
  const [guessesLeft, setGuessesLeft] = useState(3);
  const [status, setStatus] = useState('playing'); // 'playing', 'won', 'lost'
  const [mistakes, setMistakes] = useState(0);
  // Cache callbacks to avoid re-firing when parent re-renders after a win/loss
  const winCallbackRef = useRef(onWin);
  const loseCallbackRef = useRef(onLose);
  useEffect(() => {
    winCallbackRef.current = onWin;
  }, [onWin]);
  useEffect(() => {
    loseCallbackRef.current = onLose;
  }, [onLose]);
  // Notify parent on terminal states without depending on callback identity
  useEffect(() => {
    if (status === 'won') {
      winCallbackRef.current?.({ perfect: mistakes === 0 });
    } else if (status === 'lost') {
      loseCallbackRef.current?.();
    }
  }, [status, mistakes]);
  const starAnimsRef = useRef([]);

  useEffect(() => {
    const totalPlayable = playableEntries.length;
    if (totalPlayable === 0) {
      setDisplayWords(rawWords);
      setMissingWords([]);
      setMissingIndices([]);
      setWordBank([]);
      setCurrentIndex(0);
      setMessage('');
      setGuessesLeft(3);
      setStatus('playing');
      setMistakes(0);
      return;
    }
    const numBlanks = Math.min(3, Math.max(1, Math.floor(totalPlayable / 8)));
    const indices = [];
    const eligible = playableEntries.map((entry) => entry.index);
    while (indices.length < numBlanks && eligible.length > 0) {
      const pick = Math.floor(Math.random() * eligible.length);
      const idx = eligible.splice(pick, 1)[0];
      indices.push(idx);
    }
    indices.sort((a, b) => a - b);
    const missingEntries = indices
      .map((i) => playableMap.get(i))
      .filter((entry) => entry && entry.clean);
    const missing = missingEntries.map((entry) => entry.clean);
    const display = rawWords.map((w, i) => (indices.includes(i) ? '____' : w));
    // prepare word bank with four choices (missing words + distractors)
    const excludeCanonicals = new Set(missingEntries.map((entry) => entry.canonical || entry.clean));
    const uniquePool = quoteData.uniquePlayableWords;
    const distractCount = Math.max(0, 4 - missing.length);
    const distractors = pickUniqueWords(uniquePool, distractCount, excludeCanonicals).map(
      ({ word }) => word,
    );
    const bank = [...missing, ...distractors].sort(() => Math.random() - 0.5);
    // initialize star animations
    starAnimsRef.current = [new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)];

    setDisplayWords(display);
    setMissingWords(missing);
    setMissingIndices(indices);
    setWordBank(bank);
    setCurrentIndex(0);
    setMessage('');
    setGuessesLeft(3);
    setStatus('playing');
    setMistakes(0);
  }, [rawWords, playableEntries, playableMap, quoteData.uniquePlayableWords, quoteData.raw]);

  const handleWordPress = word => {
    if (status !== 'playing') return;
    if (word === missingWords[currentIndex]) {
      const newDisplay = [...displayWords];
      newDisplay[missingIndices[currentIndex]] = word;
      setDisplayWords(newDisplay);
      setWordBank(prev => {
        const copy = [...prev];
        const removeIndex = copy.indexOf(word);
        if (removeIndex !== -1) {
          copy.splice(removeIndex, 1);
        }
        return copy;
      });
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      if (nextIndex === missingWords.length) {
        setStatus('won');
        setMessage('');
      } else {
        setMessage('');
      }
    } else {
      const left = guessesLeft - 1;
      setGuessesLeft(left);
      if (left <= 0) {
        setStatus('lost');
        setMessage('Try again');
      } else {
        setMessage(`Try again (${left} left)`);
      }
      setMistakes((prev) => prev + 1);
    }
  };

  return (
    <View style={styles.container}>
      <GameTopBar onBack={onBack} variant="whiteShadow" />
      <Text style={styles.title}>Fill in the missing words</Text>
      <Text style={styles.description}>Tap the blanks in the right order.</Text>
      <Text style={styles.quote}>{displayWords.join(' ')}</Text>
      {status === 'playing' && (
        <>
          <View style={styles.wordBank}>
            {wordBank.map((word, i) => (
              <TouchableOpacity
                key={`${word}-${i}`}
                style={styles.wordButton}
                onPress={() => handleWordPress(word)}
              >
                <Text style={styles.wordText}>{word}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {message ? <Text style={styles.message}>{message}</Text> : null}
        </>
      )}
      {/* Loss overlay handled at parent; no inline loss message */}
      {/* Victory flow handled by parent GameRenderer */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 28,
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  quote: {
    fontSize: 20,
    fontStyle: 'italic',
    marginVertical: 24,
    textAlign: 'center',
  },
  wordBank: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  wordButton: {
    backgroundColor: themeVariables.whiteColor,
    borderWidth: 1,
    borderColor: themeVariables.primaryColor,
    paddingVertical: 8,
    paddingHorizontal: 12,
    margin: 4,
    borderRadius: themeVariables.borderRadiusPill,
  },
  wordText: {
    fontSize: 18,
    color: themeVariables.primaryColor,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 18,
    color: themeVariables.primaryColor,
    marginVertical: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 16,
  },
  star: {
    fontSize: 48,
    marginHorizontal: 8,
  },
  buttonContainer: {
    width: '80%',
    marginTop: 16,
  },
});

export default TapMissingWordsGame;
