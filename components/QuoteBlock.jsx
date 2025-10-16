import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import speechService from '../services/speechService';
import themeVariables from '../styles/theme';

const DEFAULT_READING_FONT = 18;
const clampReadingFont = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return DEFAULT_READING_FONT;
  const clamped = Math.min(28, Math.max(14, numeric));
  return Number.isFinite(clamped) ? clamped : DEFAULT_READING_FONT;
};

const stripPunctuation = (str) =>
  str.replace(/[.,!?;:'"“”‘’]/g, '').toLowerCase();

const QuoteBlock = ({
  quote,
  profile,
  references = [],
}) => {
  const readingFontSize = clampReadingFont(profile?.readingFontSize);
  const [activeRef, setActiveRef] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [scrollMetrics, setScrollMetrics] = useState({
    containerHeight: 0,
    contentHeight: 0,
  });
  const cancelRef = useRef(false);

  let displayText = '';
  let refList = [];

  if (quote && typeof quote === 'object' && 'text' in quote) {
    displayText = quote.text;
    refList = Array.isArray(quote.references) ? quote.references : [];
  } else {
    displayText = typeof quote === 'string' ? quote : '';
    refList = references;
  }

  const refMap = refList.reduce((acc, r) => {
    if (r && r.word) {
      acc[r.word.toLowerCase()] = Array.isArray(r.examples) ? r.examples : [];
    }
    return acc;
  }, {});

  const tokens = [];
  const refKeys = Object.keys(refMap).sort((a, b) => b.length - a.length);
  const escapeRegExp = (s) =>
    s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const pattern = refKeys.length > 0 ? refKeys.map(escapeRegExp).join('|') : null;
  const refRegex = pattern ? new RegExp(`(${pattern})`, 'gi') : null;
  const segments = refRegex ? displayText.split(refRegex) : [displayText];

  let tokenIndex = 0;
  segments.forEach((segment) => {
    const lowerSeg = segment.toLowerCase();
    if (refRegex && refMap[lowerSeg]) {
      tokens.push({
        text: segment,
        underline: true,
        key: `tok-${tokenIndex++}`,
        examples: refMap[lowerSeg],
      });
    } else {
      const parts = segment.split(/(\s+)/);
      parts.forEach((part) => {
        if (part === '') return;
        if (/^\s+$/.test(part)) {
          tokens.push({ text: part, key: `tok-${tokenIndex++}` });
        } else {
          const clean = stripPunctuation(part);
          if (refMap[clean]) {
            tokens.push({
              text: part,
              underline: true,
              key: `tok-${tokenIndex++}`,
              examples: refMap[clean],
            });
          } else {
            tokens.push({ text: part, key: `tok-${tokenIndex++}` });
          }
        }
      });
    }
  });

  const handleAudioPress = async () => {
    if (!displayText.trim()) return;
    try {
      if (isSpeaking) {
        cancelRef.current = true;
        await speechService.hardStop();
        setIsSpeaking(false);
      } else {
        cancelRef.current = false;
        setIsSpeaking(true);
        speechService.readQuote(displayText, profile.ttsVoice, cancelRef);
      }
    } catch (err) {
      console.warn('TTS failed:', err);
      setIsSpeaking(false);
    }
  };

  useEffect(() => {
    const onTTSFinish = () => setIsSpeaking(false);
    speechService.setupTTSListeners(onTTSFinish);

    return () => {
      cancelRef.current = true;
      speechService.hardStop();
      speechService.cleanupTTSListeners();
    };
  }, []);

  const handleScrollLayout = useCallback(({ nativeEvent }) => {
    const { height } = nativeEvent.layout;
    setScrollMetrics(prev =>
      prev.containerHeight === height
        ? prev
        : { ...prev, containerHeight: height }
    );
  }, []);

  const handleContentSizeChange = useCallback((_, height) => {
    setScrollMetrics(prev =>
      prev.contentHeight === height
        ? prev
        : { ...prev, contentHeight: height }
    );
  }, []);

  const isScrollable = scrollMetrics.contentHeight > scrollMetrics.containerHeight + 1;

  return (
    <>
      <View style={styles.container}>
        <View style={styles.textColumn}>
          <ScrollView
            style={styles.textScroll}
            contentContainerStyle={styles.textScrollContent}
            onLayout={handleScrollLayout}
            onContentSizeChange={handleContentSizeChange}
            scrollEnabled={isScrollable}
            showsVerticalScrollIndicator={isScrollable}
            nestedScrollEnabled
          >
            <View style={styles.quoteContent}>
              <Text style={[styles.quoteText, { fontSize: readingFontSize }]}>
                {tokens.map((part) =>
                  part.underline ? (
                    <Text
                      key={part.key}
                      style={styles.underline}
                      onPress={() => setActiveRef(part.examples)}
                    >
                      {part.text}
                    </Text>
                  ) : (
                    <Text key={part.key}>{part.text}</Text>
                  )
                )}
              </Text>
            </View>
          </ScrollView>
        </View>

        <View style={styles.audioColumn}>
          {displayText.trim() !== '' ? (
            <TouchableOpacity
              style={[
                styles.audioButton,
                isSpeaking && styles.audioButtonActive,
              ]}
              onPress={handleAudioPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel={isSpeaking ? 'Stop reading quote' : 'Read quote aloud'}
              accessibilityHint={
                isSpeaking
                  ? 'Double tap to stop the speech'
                  : 'Double tap to hear this quote'
              }
            >
              <Ionicons
                name={isSpeaking ? 'stop-circle-outline' : 'play-circle-outline'}
                size={28}
                color={isSpeaking ? themeVariables.whiteColor : themeVariables.blackColor}
              />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <Modal
        visible={!!activeRef}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveRef(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              {activeRef &&
                activeRef.map((ex, i) => (
                  <Text key={i} style={styles.exampleText}>
                    • {ex}
                  </Text>
                ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setActiveRef(null)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const AUDIO_BUTTON_SIZE = 40;
const AUDIO_COLUMN_WIDTH = 80;

const styles = StyleSheet.create({
  container: {
    width: '130%',    
    height: '90%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    position: 'relative',
    paddingTop: 8,
    alignSelf: 'stretch',
  },
  textColumn: {
    flex: 1,
    minHeight: 0,
  },
  textScroll: {
    maxHeight: '100%',
  },
  textScrollContent: {
    paddingRight: 2,
  },
  quoteContent: {
    borderLeftWidth: 4,
    borderLeftColor: themeVariables.primaryColor,
    paddingLeft: 12,
    alignSelf: 'flex-start',
  },
  quoteText: {
    fontSize: 24,
    textAlign: 'left',
    fontStyle: 'italic',
    color: themeVariables.whiteColor,
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  underline: {
    textDecorationLine: 'underline',
    color: themeVariables.whiteColor,
    textDecorationColor: themeVariables.whiteColor,
  },
  audioColumn: {
    width: AUDIO_COLUMN_WIDTH,
    alignItems: 'center',
    paddingTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    width: '80%',
    maxHeight: '80%',
  },
  exampleText: {
    fontSize: 16,
    marginBottom: 8,
  },
  closeButton: {
    marginTop: 16,
    alignSelf: 'center',
    backgroundColor: themeVariables.primaryColor,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: themeVariables.borderRadiusPill,
  },
  closeButtonText: {
    color: themeVariables.whiteColor,
  },
  audioButton: {
    width: AUDIO_BUTTON_SIZE,
    height: AUDIO_BUTTON_SIZE,
    borderRadius: AUDIO_BUTTON_SIZE / 2,
    borderWidth: 2,
    borderColor: themeVariables.primaryColor,
    backgroundColor: themeVariables.whiteColor,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
  audioButtonActive: {
    backgroundColor: themeVariables.primaryColor,
    borderColor: themeVariables.primaryColor,
  },
});

export default QuoteBlock;
