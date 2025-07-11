import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import speechService from '../services/speechService';
import themeVariables from '../styles/theme';

const stripPunctuation = (str) =>
  str.replace(/[.,!?;:'"“”‘’]/g, '').toLowerCase();

const QuoteBlock = ({
  quote,
  profile,
  references = [],
  backgroundImage,
  backgroundColor = themeVariables.neutralLight,
}) => {
  const [activeRef, setActiveRef] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
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
        await speechService.stopTTS();
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
      speechService.stopTTS();
      speechService.cleanupTTSListeners();
    };
  }, []);

  return (
    <ImageBackground
      source={backgroundImage}
      style={[styles.background, { backgroundColor }]}
    >
      <Text style={styles.quoteText}>
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

      {displayText.trim() !== '' && (
        <TouchableOpacity
          style={styles.audioButton}
          onPress={handleAudioPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel={isSpeaking ? "Stop reading quote" : "Read quote aloud"}
          accessibilityHint={isSpeaking ? "Double tap to stop the speech" : "Double tap to hear this quote"}
        >
          <Ionicons
            name={isSpeaking ? 'stop-circle-outline' : 'play-circle-outline'}
            size={24}
            color={themeVariables.primaryColor}
          />
        </TouchableOpacity>
      )}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quoteText: {
    fontSize: 18,
    textAlign: 'center',
  },
  underline: {
    textDecorationLine: 'underline',
    color: themeVariables.primaryColor,
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
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: themeVariables.whiteColor,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
});

export default QuoteBlock;
