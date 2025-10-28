import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import themeVariables from '../stylesheets/theme';

const DEFAULT_READING_FONT = 18;
const clampReadingFont = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return DEFAULT_READING_FONT;
  const clamped = Math.min(28, Math.max(14, numeric));
  return Number.isFinite(clamped) ? clamped : DEFAULT_READING_FONT;
};

const PrayerBlock = ({
  prayer,
  profile,
  maxHeight,
}) => {
  const readingFontSize = clampReadingFont(profile?.readingFontSize);
  const [scrollMetrics, setScrollMetrics] = useState({ containerHeight: 0, contentHeight: 0 });

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
    <View style={[styles.card, maxHeight ? { maxHeight } : null]}>
      <View style={styles.container}>
        <View style={styles.textColumn}>
          <ScrollView
            style={[
              styles.textScroll,
              maxHeight ? { maxHeight: Math.max(80, maxHeight - 40) } : null,
            ]}
            contentContainerStyle={styles.textScrollContent}
            onLayout={handleScrollLayout}
            onContentSizeChange={handleContentSizeChange}
            scrollEnabled={isScrollable}
            showsVerticalScrollIndicator={isScrollable}
            nestedScrollEnabled
          >
            <View style={styles.textContent}>
              <Text style={[styles.prayerText, { fontSize: readingFontSize }]}>{prayer}</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
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
  textContent: {
    borderLeftWidth: 4,
    borderLeftColor: themeVariables.primaryColor,
    paddingLeft: 12,
    alignSelf: 'flex-start',
  },
  prayerText: {
    fontSize: 24,
    textAlign: 'left',
    color: themeVariables.whiteColor,
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default PrayerBlock;
