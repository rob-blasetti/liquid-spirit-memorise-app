import React, { useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import GameTopBar from '../ui/components/GameTopBar';
import themeVariables from '../ui/stylesheets/theme';
import {
  getEntryDisplayWord,
  pickUniqueWords,
} from '../services/quoteSanitizer';
import useQuoteGameData from './hooks/useQuoteGameData';
import { shuffleItems } from './gameUtils';

const WORDS_PER_ROUND = 3;
const OPTION_COUNT = 6;

const getRoundEntries = (playableEntries = [], cursor = 0) => {
  const selected = [];
  const seen = new Set();
  for (let index = cursor; index < playableEntries.length; index += 1) {
    const entry = playableEntries[index];
    const key = entry?.canonical || entry?.clean || `entry-${index}`;
    if (seen.has(key)) continue;
    seen.add(key);
    selected.push(entry);
    if (selected.length >= WORDS_PER_ROUND) {
      break;
    }
  }
  return selected;
};

const getNextCursor = (playableEntries = [], cursor = 0) => {
  const seen = new Set();
  let nextCursor = cursor;
  while (nextCursor < playableEntries.length && seen.size < WORDS_PER_ROUND) {
    const entry = playableEntries[nextCursor];
    const key = entry?.canonical || entry?.clean || `entry-${nextCursor}`;
    seen.add(key);
    nextCursor += 1;
  }
  return nextCursor;
};

const splitTokenParts = (token = '') => {
  const source = String(token || '');
  const leading = (source.match(/^[^\p{L}\p{N}]*/u) || [''])[0];
  const trailing = (source.match(/[^\p{L}\p{N}]*$/u) || [''])[0];
  const coreLength = Math.max(0, source.length - leading.length - trailing.length);
  const core = source.slice(leading.length, leading.length + coreLength);
  return {
    leading,
    core,
    trailing,
  };
};

const buildMaskedToken = (entry, answer) => {
  const source = entry?.original || entry?.clean || '';
  const { leading, core, trailing } = splitTokenParts(source);
  const visibleAnswer = String(answer || '').trim();
  if (visibleAnswer.length > 0) {
    return `${leading}${visibleAnswer}${trailing}`;
  }
  const blankLength = Math.max(3, core.length || 3);
  return `${leading}${'_'.repeat(blankLength)}${trailing}`;
};

const QuotePracticeScreen = ({ quote, rawQuote, sanitizedQuote, onBack }) => {
  const { quoteData } = useQuoteGameData({ quote, rawQuote, sanitizedQuote });
  const entries = useMemo(() => quoteData?.entries || [], [quoteData]);
  const playableEntries = useMemo(() => quoteData?.playableEntries || [], [quoteData]);
  const uniquePlayableWords = useMemo(() => quoteData?.uniquePlayableWords || [], [quoteData]);
  const [cursor, setCursor] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [options, setOptions] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  const currentRoundEntries = useMemo(
    () => getRoundEntries(playableEntries, cursor),
    [playableEntries, cursor],
  );

  const remainingUniqueWords = useMemo(() => {
    const seen = new Set();
    playableEntries.forEach((entry, index) => {
      if (index < cursor) return;
      const key = entry?.canonical || entry?.clean || `entry-${index}`;
      seen.add(key);
    });
    return seen.size;
  }, [playableEntries, cursor]);

  useEffect(() => {
    setCursor(0);
    setAnswers([]);
    setOptions([]);
    setFeedback('');
    setIsComplete(false);
  }, [quoteData?.raw]);

  useEffect(() => {
    if (!currentRoundEntries.length) {
      setAnswers([]);
      setOptions([]);
      setIsComplete(playableEntries.length > 0);
      return;
    }

    setIsComplete(false);
    setAnswers(Array(currentRoundEntries.length).fill(''));
    setFeedback('');

    const exclude = new Set(
      currentRoundEntries.map((entry) => entry?.canonical || entry?.clean).filter(Boolean),
    );
    const distractorCount = Math.max(0, OPTION_COUNT - currentRoundEntries.length);
    const distractors = pickUniqueWords(uniquePlayableWords, distractorCount, exclude)
      .map(({ entry }) => getEntryDisplayWord(entry));
    const correctOptions = currentRoundEntries.map((entry) => getEntryDisplayWord(entry));
    setOptions(shuffleItems([...correctOptions, ...distractors]));
  }, [currentRoundEntries, playableEntries.length, uniquePlayableWords]);

  const hiddenEntryIndexes = useMemo(
    () => new Set(currentRoundEntries.map((entry) => entry.index)),
    [currentRoundEntries],
  );

  const handleWordPress = (selectedWord) => {
    if (isComplete || !currentRoundEntries.length) {
      return;
    }

    const nextBlankIndex = answers.findIndex((value) => !value);
    if (nextBlankIndex < 0) {
      return;
    }

    const targetEntry = currentRoundEntries[nextBlankIndex];
    const expectedWord = getEntryDisplayWord(targetEntry);
    if ((selectedWord || '').toLowerCase() !== expectedWord.toLowerCase()) {
      setFeedback('Try again');
      return;
    }

    const nextAnswers = [...answers];
    nextAnswers[nextBlankIndex] = expectedWord;
    setAnswers(nextAnswers);
    setOptions((prev) => {
      const next = [...prev];
      const removeIndex = next.findIndex((item) => item === selectedWord);
      if (removeIndex >= 0) {
        next.splice(removeIndex, 1);
      }
      return next;
    });
    setFeedback('');

    if (nextAnswers.every(Boolean)) {
      const nextCursor = getNextCursor(playableEntries, cursor);
      if (nextCursor >= playableEntries.length) {
        setIsComplete(true);
        setFeedback('You rebuilt the whole quote.');
        return;
      }
      setCursor(nextCursor);
    }
  };

  const handleResetRound = () => {
    const exclude = new Set(
      currentRoundEntries.map((entry) => entry?.canonical || entry?.clean).filter(Boolean),
    );
    const distractorCount = Math.max(0, OPTION_COUNT - currentRoundEntries.length);
    const distractors = pickUniqueWords(uniquePlayableWords, distractorCount, exclude)
      .map(({ entry }) => getEntryDisplayWord(entry));
    const correctOptions = currentRoundEntries.map((entry) => getEntryDisplayWord(entry));
    setAnswers(Array(currentRoundEntries.length).fill(''));
    setOptions(shuffleItems([...correctOptions, ...distractors]));
    setFeedback('');
  };

  const renderQuote = () => (
    <Text style={styles.quoteText}>
      {entries.map((entry, index) => {
        const hiddenIndex = currentRoundEntries.findIndex(
          (candidate) => candidate.index === entry.index,
        );
        const isHidden = hiddenEntryIndexes.has(entry.index);
        const displayToken = isHidden
          ? buildMaskedToken(entry, hiddenIndex >= 0 ? answers[hiddenIndex] : '')
          : entry.original || entry.clean || '';
        return (
          <Text
            key={`quote-entry-${entry.index}`}
            style={[
              styles.quoteToken,
              isHidden && styles.quoteTokenMissing,
              isHidden && answers[hiddenIndex] ? styles.quoteTokenFilled : null,
            ]}
          >
            {displayToken}
            {index < entries.length - 1 ? ' ' : ''}
          </Text>
        );
      })}
    </Text>
  );

  return (
    <LinearGradient
      colors={['#120C2C', '#1A1F3F']}
      style={styles.container}
    >
      <GameTopBar title="Practice" onBack={onBack} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <Text style={styles.title}>Remember the phrase</Text>
          <Text style={styles.description}>
            Tap the missing words from the choices below to rebuild the full quote.
          </Text>
          {!isComplete ? (
            <View style={styles.statusRow}>
              <Ionicons name="layers-outline" size={16} color={themeVariables.whiteColor} />
              <Text style={styles.statusText}>
                {remainingUniqueWords} word{remainingUniqueWords === 1 ? '' : 's'} left
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.quoteCard}>
          {entries.length > 0 ? renderQuote() : <Text style={styles.emptyText}>No quote available.</Text>}
        </View>

        {!isComplete ? (
          <>
            <View style={styles.wordBankHeader}>
              <Text style={styles.wordBankTitle}>Word Bank</Text>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={handleResetRound}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Reset current word choices"
              >
                <Ionicons name="refresh-outline" size={16} color={themeVariables.whiteColor} />
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.optionsWrap}>
              {options.map((option, index) => (
                <TouchableOpacity
                  key={`${option}-${index}`}
                  style={styles.optionButton}
                  onPress={() => handleWordPress(option)}
                  activeOpacity={0.88}
                >
                  <Text style={styles.optionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : (
          <View style={styles.completionCard}>
            <Ionicons name="checkmark-circle-outline" size={28} color={themeVariables.secondaryColor} />
            <Text style={styles.completionTitle}>All done</Text>
            <Text style={styles.completionText}>You rebuilt the full phrase.</Text>
            <TouchableOpacity
              style={styles.doneButton}
              onPress={onBack}
              activeOpacity={0.88}
              accessibilityRole="button"
              accessibilityLabel="Return to lesson"
            >
              <Text style={styles.doneButtonText}>Back to Lesson</Text>
            </TouchableOpacity>
          </View>
        )}

        {feedback ? (
          <Text style={[styles.feedbackText, isComplete && styles.feedbackTextSuccess]}>
            {feedback}
          </Text>
        ) : null}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingTop: 96,
    paddingHorizontal: 16,
    paddingBottom: 28,
  },
  heroCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  title: {
    color: themeVariables.whiteColor,
    fontSize: 28,
    fontWeight: '700',
  },
  description: {
    marginTop: 10,
    color: 'rgba(255,255,255,0.82)',
    fontSize: 15,
    lineHeight: 22,
  },
  statusRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    color: themeVariables.whiteColor,
    fontSize: 14,
    fontWeight: '600',
  },
  quoteCard: {
    marginTop: 16,
    backgroundColor: 'rgba(12,18,38,0.7)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  quoteText: {
    color: themeVariables.whiteColor,
    fontSize: 22,
    lineHeight: 36,
  },
  quoteToken: {
    color: themeVariables.whiteColor,
  },
  quoteTokenMissing: {
    color: '#FFE082',
    fontWeight: '700',
  },
  quoteTokenFilled: {
    color: themeVariables.secondaryColor,
  },
  wordBankHeader: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wordBankTitle: {
    color: themeVariables.whiteColor,
    fontSize: 18,
    fontWeight: '700',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: themeVariables.borderRadiusPill,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  resetButtonText: {
    color: themeVariables.whiteColor,
    fontSize: 13,
    fontWeight: '600',
  },
  optionsWrap: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionButton: {
    backgroundColor: themeVariables.whiteColor,
    borderRadius: themeVariables.borderRadiusPill,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: themeVariables.primaryColor,
  },
  optionText: {
    color: themeVariables.primaryColor,
    fontSize: 16,
    fontWeight: '700',
  },
  feedbackText: {
    marginTop: 14,
    textAlign: 'center',
    color: '#FFD166',
    fontSize: 15,
    fontWeight: '600',
  },
  feedbackTextSuccess: {
    color: themeVariables.secondaryColor,
  },
  completionCard: {
    marginTop: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  completionTitle: {
    marginTop: 10,
    color: themeVariables.whiteColor,
    fontSize: 22,
    fontWeight: '700',
  },
  completionText: {
    marginTop: 6,
    color: 'rgba(255,255,255,0.78)',
    fontSize: 15,
    textAlign: 'center',
  },
  doneButton: {
    marginTop: 16,
    backgroundColor: themeVariables.primaryColor,
    borderRadius: themeVariables.borderRadiusPill,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  doneButtonText: {
    color: themeVariables.whiteColor,
    fontSize: 16,
    fontWeight: '700',
  },
  emptyText: {
    color: themeVariables.whiteColor,
    fontSize: 16,
    textAlign: 'center',
  },
});

export default QuotePracticeScreen;
