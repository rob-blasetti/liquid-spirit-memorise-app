import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import ThemedButton from '../components/ThemedButton';
import GameTopBar from '../components/GameTopBar';
import RewardBanner from '../components/RewardBanner';
import themeVariables from '../styles/theme';

// Accept onWin callback to award achievements after reward banner
const TapMissingWordsGame = ({ quote, onBack, onWin }) => {
  const text = typeof quote === 'string' ? quote : quote?.text || '';
  const [displayWords, setDisplayWords] = useState([]);
  const [missingWords, setMissingWords] = useState([]);
  const [missingIndices, setMissingIndices] = useState([]);
  const [wordBank, setWordBank] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [message, setMessage] = useState('');
  const [guessesLeft, setGuessesLeft] = useState(3);
  const [status, setStatus] = useState('playing'); // 'playing', 'won', 'lost'
  const [showBanner, setShowBanner] = useState(false);
  // show reward banner on win
  useEffect(() => {
    if (status === 'won') {
      setShowBanner(true);
    }
  }, [status]);
  const starAnimsRef = useRef([]);

  useEffect(() => {
    const words = text.split(' ');
    const numBlanks = Math.min(3, Math.max(1, Math.floor(words.length / 8)));
    const indices = [];
    while (indices.length < numBlanks) {
      const idx = Math.floor(Math.random() * words.length);
      if (!indices.includes(idx)) {
        indices.push(idx);
      }
    }
    indices.sort((a, b) => a - b);
    const missing = indices.map(i => words[i]);
    const display = words.map((w, i) => (indices.includes(i) ? '____' : w));
    // prepare word bank with four choices (missing words + distractors)
    const allWords = words.filter((_, i) => !indices.includes(i));
    const distractCount = Math.max(0, 4 - missing.length);
    const distractors = [];
    const pool = [...allWords];
    while (distractors.length < distractCount && pool.length > 0) {
      const r = Math.floor(Math.random() * pool.length);
      distractors.push(pool.splice(r, 1)[0]);
    }
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
  }, [quote]);

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
    }
  };

  return (
    <View style={styles.container}>
      <GameTopBar onBack={onBack} />
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
      {status === 'lost' && <Text style={styles.message}>Try again</Text>}
      {showBanner && (
        <RewardBanner
          onAnimationEnd={() => {
            setShowBanner(false);
            if (onWin) onWin();
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: themeVariables.neutralLight,
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
