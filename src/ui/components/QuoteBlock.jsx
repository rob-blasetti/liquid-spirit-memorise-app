import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import themeVariables from '../stylesheets/theme';

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
  maxHeight,
}) => {
  const readingFontSize = clampReadingFont(profile?.readingFontSize);
  const [definitionExamples, setDefinitionExamples] = useState(null);
  const [isDefinitionVisible, setDefinitionVisible] = useState(false);
  const [scrollMetrics, setScrollMetrics] = useState({ containerHeight: 0, contentHeight: 0 });

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

  const handleReferencePress = useCallback(examples => {
    if (!Array.isArray(examples) || examples.length === 0) {
      return;
    }
    setDefinitionExamples(examples);
    setDefinitionVisible(true);
  }, []);

  const handleCloseDefinitions = useCallback(() => {
    setDefinitionVisible(false);
  }, []);

  const handleDefinitionsDismiss = useCallback(() => {
    setDefinitionExamples(null);
  }, []);

  return (
    <>
      <View style={[styles.card, maxHeight ? { maxHeight } : null]}>
        <View style={[styles.container, maxHeight ? { maxHeight } : null]}>
          <View style={styles.textColumn}>
            <ScrollView
              style={[
                styles.textScroll,
                maxHeight ? { maxHeight: Math.max(120, maxHeight - 40) } : null,
              ]}
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
                        onPress={() => handleReferencePress(part.examples)}
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
        </View>
      </View>

      <Modal
        visible={isDefinitionVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCloseDefinitions}
        onDismiss={handleDefinitionsDismiss}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <BlurView
              style={styles.modalBlur}
              blurType="light"
              blurAmount={24}
              reducedTransparencyFallbackColor="rgba(20, 18, 46, 0.92)"
            />
            <View style={styles.modalInner}>
              <ScrollView
                style={styles.modalScroll}
                contentContainerStyle={styles.modalScrollContent}
                showsVerticalScrollIndicator={false}
              >
                {definitionExamples &&
                  definitionExamples.map((ex, i) => (
                    <Text key={i} style={styles.exampleText}>
                      • {ex}
                    </Text>
                  ))}
              </ScrollView>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleCloseDefinitions}
                activeOpacity={0.8}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignSelf: 'stretch',
  },
  textColumn: {
    flex: 1,
    minHeight: 0,
  },
  textScroll: {
    flexGrow: 0,
    flexShrink: 1,
  },
  textScrollContent: {
    paddingRight: 2,
  },
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 8,
    alignSelf: 'stretch',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    position: 'relative',
    width: '84%',
    maxWidth: 380,
    maxHeight: '78%',
    borderRadius: themeVariables.borderRadiusPill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    backgroundColor: 'rgba(20, 18, 46, 0.92)',
    overflow: 'hidden',
  },
  modalBlur: {
    ...StyleSheet.absoluteFillObject,
  },
  modalInner: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  modalScroll: {
    maxHeight: '100%',
  },
  modalScrollContent: {
    paddingBottom: 8,
  },
  exampleText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 12,
    color: themeVariables.whiteColor,
    textAlign: 'left',
  },
  closeButton: {
    marginTop: 20,
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: themeVariables.borderRadiusPill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  closeButtonText: {
    color: themeVariables.whiteColor,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});

export default QuoteBlock;
