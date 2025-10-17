import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import Slider from '@react-native-community/slider';
import themeVariables from '../styles/theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { grade1Lessons } from '../data/grade1';
import { quoteMap } from '../data/grade2';
import { quoteMap as quoteMap2b } from '../data/grade2b';
import { Button } from 'liquid-spirit-styleguide';
import elevenLabs from '../services/elevenLabsTTS';
import { DEFAULT_TTS_SPEED, MIN_TTS_SPEED, MAX_TTS_SPEED } from '../services/ttsDefaults';
import TopNav from '../components/TopNav';

const FONT_SIZE_OPTIONS = [16, 18, 20, 22, 24];
const DEFAULT_READING_FONT = 18;
const coerceFontSize = (value) => {
  const numeric = Number(value);
  if (Number.isFinite(numeric) && FONT_SIZE_OPTIONS.includes(numeric)) {
    return numeric;
  }
  return DEFAULT_READING_FONT;
};

const SettingsScreen = ({ profile, currentProgress, overrideProgress, onSaveOverride, onBack, onReset, onSaveProfile }) => {
  const [selectedSet, setSelectedSet] = useState(
    overrideProgress?.setNumber ?? currentProgress.setNumber
  );
  const [selectedLesson, setSelectedLesson] = useState(
    overrideProgress?.lessonNumber ?? currentProgress.lessonNumber
  );
  // ElevenLabs uses voice id from profile or env; no device voice list
  const [speed, setSpeed] = useState(profile?.ttsSpeed ?? DEFAULT_TTS_SPEED);
  const [fontSize, setFontSize] = useState(() => coerceFontSize(profile?.readingFontSize));
  // Slider width for rendering tick marks
  const [speedSliderWidth, setSpeedSliderWidth] = useState(0);
  const allowedSpeeds = [MIN_TTS_SPEED, 0.75, 1.0, DEFAULT_TTS_SPEED, 1.5, 1.75, MAX_TTS_SPEED];
  const fmtSpeed = (v) => `${Number(v).toFixed(2)}x`;
  const snapToAllowed = (val) => {
    const numeric = Number(val);
    const clampedBase = Math.max(MIN_TTS_SPEED, Math.min(MAX_TTS_SPEED, Number.isFinite(numeric) ? numeric : DEFAULT_TTS_SPEED));
    let closest = allowedSpeeds[0];
    let diff = Math.abs(clampedBase - closest);
    for (let i = 1; i < allowedSpeeds.length; i++) {
      const d = Math.abs(clampedBase - allowedSpeeds[i]);
      if (d < diff) { diff = d; closest = allowedSpeeds[i]; }
    }
    return closest;
  };
  // For grade-1 slider bubble positioning
  const [sliderWidth, setSliderWidth] = useState(0);
  const [bubbleLayout, setBubbleLayout] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (String(profile?.grade) === '2') {
      const lessons = Object.keys(quoteMap)
        .filter(key => key.startsWith(`${selectedSet}-`))
        .map(key => parseInt(key.split('-')[1], 10))
        .sort((a, b) => a - b);
      if (!lessons.includes(selectedLesson)) {
        setSelectedLesson(lessons[0]);
      }
    }
  }, [selectedSet]);

  const isFirstRun = useRef(true);
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    onSaveOverride({ setNumber: selectedSet, lessonNumber: selectedLesson });
  }, [selectedSet, selectedLesson]);

  // Persist and apply playback speed
  useEffect(() => {
    const numeric = Number(speed);
    const v = Math.max(MIN_TTS_SPEED, Math.min(MAX_TTS_SPEED, Number.isFinite(numeric) ? numeric : DEFAULT_TTS_SPEED));
    elevenLabs.setSpeed(v);
    onSaveProfile?.({ ...profile, ttsSpeed: v });
  }, [speed]);

  useEffect(() => {
    setFontSize(coerceFontSize(profile?.readingFontSize));
  }, [profile?.readingFontSize]);

  useEffect(() => {
    if (!profile) return;
    if (profile.readingFontSize === fontSize) return;
    onSaveProfile?.({ ...profile, readingFontSize: fontSize });
  }, [fontSize, profile, onSaveProfile]);

  // Cache is managed automatically with sensible defaults; no user controls

  // Pre-cache ElevenLabs audio for the selected lesson only (minimize API calls)
  useEffect(() => {
    const looksLikeUuid = typeof profile?.ttsVoice === 'string' && /^[a-z0-9-]{10,}$/i.test(profile.ttsVoice);
    const voiceId = looksLikeUuid ? profile.ttsVoice : undefined;

    const cacheTexts = async (texts) => {
      const unique = Array.from(new Set(texts.filter(t => typeof t === 'string' && t.trim().length > 0)));
      for (const t of unique) {
        try { await elevenLabs.synthesizeToFile({ text: t, voiceId }); } catch {}
      }
    };

    // Determine which texts to cache based on grade and selection
    if (String(profile.grade) === '1') {
      const lesson = grade1Lessons.find(l => l.lesson === selectedLesson);
      if (lesson) cacheTexts([lesson.prayer, lesson.quote]);
      return;
    }
    if (String(profile.grade) === '2') {
      const key = `${selectedSet}-${selectedLesson}`;
      const obj = quoteMap[key] || {};
      cacheTexts([obj.text, obj.prayer].filter(Boolean));
      return;
    }
    if (String(profile.grade) === '2b') {
      const key = `${selectedSet}-${selectedLesson}`;
      const obj = quoteMap2b[key] || {};
      cacheTexts([obj.text, obj.prayer].filter(Boolean));
      return;
    }
  }, [profile?.ttsVoice, profile?.grade, selectedSet, selectedLesson]);

  const hasBackHandler = typeof onBack === 'function';
  const renderHeader = () => (
    <TopNav
      title="Settings"
      onBack={hasBackHandler ? onBack : undefined}
      containerStyle={styles.headerRow}
      backAccessibilityLabel="Back to home"
    />
  );

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContent}>
          {renderHeader()}
          <Text style={styles.subtitle}>No profile loaded</Text>
          <Button label="Back" onPress={onBack} />
        </View>
      </SafeAreaView>
    );
  }

  // Voice options removed (we use ElevenLabs voice by ID from profile or env)

  const renderGrade1Settings = () => {
    const lessonNumbers = grade1Lessons.map(l => l.lesson);
    const minLesson = Math.min(...lessonNumbers);
    const maxLesson = Math.max(...lessonNumbers);
    const range = maxLesson - minLesson;
    const bubbleRatio = range > 0 ? (selectedLesson - minLesson) / range : 0.5;
    const rawLeft = sliderWidth * bubbleRatio - bubbleLayout.width / 2;
    const bubbleLeft = sliderWidth
      ? Math.min(Math.max(rawLeft, 0), sliderWidth - bubbleLayout.width)
      : 0;
    const sliderTopPadding = bubbleLayout.height ? bubbleLayout.height + 16 : 56;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Lesson Progress</Text>
        <View style={styles.sectionCard}>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldTitle}>Lesson</Text>
            <Text style={styles.fieldDescription}>
              Select the lesson you would like to continue from.
            </Text>
            <View
              style={[
                styles.sliderContainer,
                styles.lessonSliderContainer,
                { paddingTop: sliderTopPadding },
              ]}
              onLayout={({ nativeEvent }) =>
                setSliderWidth(nativeEvent.layout.width)
              }
            >
              <View
                style={[styles.sliderBubbleContainer, { left: bubbleLeft }]}
              >
                <View
                  style={styles.sliderBubble}
                  onLayout={({ nativeEvent }) =>
                    setBubbleLayout({
                      width: nativeEvent.layout.width,
                      height: nativeEvent.layout.height,
                    })
                  }
                >
                  <Text style={styles.sliderBubbleText}>{selectedLesson}</Text>
                </View>
                <View style={styles.sliderBubbleTriangle} />
              </View>

              <View style={styles.sliderRow}>
                <Text style={styles.sliderMinMax}>{minLesson}</Text>
                <Slider
                  style={styles.sliderFlex}
                  minimumValue={minLesson}
                  maximumValue={maxLesson}
                  step={1}
                  value={selectedLesson}
                  minimumTrackTintColor={themeVariables.tertiaryColor}
                  maximumTrackTintColor={themeVariables.neutralDark}
                  thumbTintColor={themeVariables.whiteColor}
                  onValueChange={val => setSelectedLesson(val)}
                />
                <Text style={styles.sliderMinMax}>{maxLesson}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderGrade2Settings = () => {
    const lessons = Object.keys(quoteMap)
      .filter(key => key.startsWith(`${selectedSet}-`))
      .map(key => parseInt(key.split('-')[1], 10))
      .sort((a, b) => a - b);

    const setOptions = [1, 2, 3];
    const columns = setOptions.length;
    return (
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Lesson Progress</Text>
        <View style={styles.sectionCard}>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldTitle}>Set</Text>
            <Text style={styles.fieldDescription}>
              Choose the memorisation set you want to review.
            </Text>
            {renderSquareSelector({
              items: setOptions,
              selectedValue: selectedSet,
              onSelect: setSelectedSet,
              accessibilityPrefix: 'Set',
              columns,
            })}
          </View>
          <View style={styles.sectionDivider} />
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldTitle}>Lesson</Text>
            <Text style={styles.fieldDescription}>
              Pick the lesson to jump back into for this set.
            </Text>
            {renderSquareSelector({
              items: lessons,
              selectedValue: selectedLesson,
              onSelect: setSelectedLesson,
              accessibilityPrefix: 'Lesson',
              columns,
            })}
          </View>
        </View>
      </View>
    );
  };

  const renderGrade2bSettings = () => {
    const lessons = Object.keys(quoteMap2b)
      .filter(key => key.startsWith(`${selectedSet}-`))
      .map(key => parseInt(key.split('-')[1], 10))
      .sort((a, b) => a - b);

    const setOptions = [4, 5, 6, 7];
    const columns = setOptions.length;
    return (
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Lesson Progress</Text>
        <View style={styles.sectionCard}>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldTitle}>Set</Text>
            <Text style={styles.fieldDescription}>
              Choose the memorisation set you want to review.
            </Text>
            {renderSquareSelector({
              items: setOptions,
              selectedValue: selectedSet,
              onSelect: setSelectedSet,
              accessibilityPrefix: 'Set',
              columns,
            })}
          </View>
          <View style={styles.sectionDivider} />
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldTitle}>Lesson</Text>
            <Text style={styles.fieldDescription}>
              Pick the lesson to jump back into for this set.
            </Text>
            {renderSquareSelector({
              items: lessons,
              selectedValue: selectedLesson,
              onSelect: setSelectedLesson,
              accessibilityPrefix: 'Lesson',
              columns,
            })}
          </View>
        </View>
      </View>
    );
  };

  const renderSquareSelector = ({ items, selectedValue, onSelect, accessibilityPrefix, columns }) => {
    const columnCount = columns || items.length || 1;
    const wrapperSizeStyle =
      columnCount >= 4 ? styles.segmentOptionWrapperFour : styles.segmentOptionWrapperThree;
    return (
      <View style={styles.segmentContainer}>
        {items.map((value) => (
          <View
            key={`square-option-${value}`}
            style={[
              styles.segmentOptionWrapper,
              wrapperSizeStyle,
            ]}
          >
            <TouchableOpacity
              style={[
                styles.segmentOption,
                selectedValue === value && styles.segmentOptionSelected,
              ]}
              onPress={() => onSelect(value)}
              accessibilityRole="button"
              accessibilityState={{ selected: selectedValue === value }}
              accessibilityLabel={`${accessibilityPrefix} ${value}`}
            >
              <Text
                style={[
                  styles.segmentLabel,
                  selectedValue === value && styles.segmentLabelSelected,
                ]}
              >
                {value}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  const renderFontSizeOption = (size) => {
    const isSelected = fontSize === size;
    return (
      <View key={`font-size-${size}`} style={styles.fontSizeOptionWrapper}>
        <TouchableOpacity
          style={[
            styles.fontSizeOption,
            isSelected && styles.fontSizeOptionSelected,
          ]}
          onPress={() => setFontSize(size)}
          accessibilityRole="button"
          accessibilityState={{ selected: isSelected }}
          accessibilityLabel={`Set reading font size to ${size} point`}
        >
          <Text
            style={[
              styles.fontSizeSample,
              { fontSize: size },
              isSelected && styles.fontSizeSampleSelected,
            ]}
          >
            Aa
          </Text>
          <Text
            style={[
              styles.fontSizeLabel,
              isSelected && styles.fontSizeLabelSelected,
            ]}
          >
            {size} pt
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {renderHeader()}

        <View style={[styles.section, styles.topSection]}>
          <Text style={styles.sectionLabel}>Reading</Text>
          <View style={styles.sectionCard}>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldTitle}>Font size</Text>
              <Text style={styles.fieldDescription}>
                Preview and select the size used for reading passages in the app.
              </Text>
              <View style={styles.fontSizeRows}>
                {[0, 1].map((rowIndex) => {
                  const startIndex = rowIndex === 0 ? 0 : 3;
                  const rowOptions = FONT_SIZE_OPTIONS.slice(startIndex, startIndex + 3);
                  return (
                    <View
                      key={`font-size-row-${rowIndex}`}
                      style={[
                        styles.fontSizeRow,
                        rowIndex === 1 && styles.fontSizeRowSpacing,
                      ]}
                    >
                      {rowOptions.map(renderFontSizeOption)}
                      {rowOptions.length < 3 &&
                        Array.from({ length: 3 - rowOptions.length }).map((_, idx) => (
                          <View
                            key={`font-size-spacer-${rowIndex}-${idx}`}
                            style={styles.fontSizeOptionWrapper}
                            pointerEvents="none"
                          >
                            <View style={[styles.fontSizeOption, styles.fontSizeOptionSpacer]} />
                          </View>
                        ))}
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        </View>

        {String(profile.grade) === '1' && renderGrade1Settings()}
        {String(profile.grade) === '2' && renderGrade2Settings()}
        {String(profile.grade) === '2b' && renderGrade2bSettings()}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Audio</Text>
          <View style={styles.sectionCard}>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldTitle}>Playback speed</Text>
              <Text style={styles.fieldDescription}>
                Adjust how quickly passages are read aloud during lessons.
              </Text>
              <Text style={styles.speedValue}>Current: {fmtSpeed(speed)}</Text>
              <View
                style={[styles.sliderContainer, styles.speedSliderContainer]}
                onLayout={({ nativeEvent }) => setSpeedSliderWidth(nativeEvent.layout.width)}
              >
                <View style={styles.tickContainer} pointerEvents="none">
                  {allowedSpeeds.map((sp, i) => {
                    const ratio = (sp - MIN_TTS_SPEED) / (MAX_TTS_SPEED - MIN_TTS_SPEED);
                    const tickW = 2;
                    const trackW = Math.max(0, speedSliderWidth);
                    const unclamped = ratio * trackW - tickW / 2;
                    const left = Math.max(0, Math.min(unclamped, trackW - tickW));
                    const active = Math.abs(sp - speed) < 0.001;
                    return (
                      <View
                        key={`tick-${i}`}
                        style={[styles.tick, { left }, active && styles.tickActive]}
                      />
                    );
                  })}
                </View>

                <View style={styles.sliderRow}>
                  <Slider
                    style={styles.sliderFlex}
                    minimumValue={MIN_TTS_SPEED}
                    maximumValue={MAX_TTS_SPEED}
                    step={0.01}
                    value={speed}
                    minimumTrackTintColor={themeVariables.tertiaryColor}
                    maximumTrackTintColor={themeVariables.neutralDark}
                    thumbTintColor={themeVariables.whiteColor}
                    onValueChange={val => setSpeed(snapToAllowed(val))}
                  />
                </View>

                <View style={styles.sliderBottomLabels}>
                  <Text style={styles.sliderBottomLabel}>{fmtSpeed(MIN_TTS_SPEED)}</Text>
                  <Text style={styles.sliderBottomLabel}>{fmtSpeed(MAX_TTS_SPEED)}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Account</Text>
          <TouchableOpacity style={styles.accountButton} onPress={onReset}>
            <View style={styles.accountLeft}>
              <Ionicons
                name="log-out-outline"
                size={20}
                color={themeVariables.whiteColor}
                style={styles.accountIcon}
              />
              <Text style={styles.accountText}>Logout</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={themeVariables.whiteColor} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  emptyContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    justifyContent: 'flex-start',
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    paddingTop: 8,
  },
  headerRow: {
    marginTop: 16,
    marginBottom: 24,
    paddingHorizontal: 0,
  },
  subtitle: {
    color: themeVariables.whiteColor,
    opacity: 0.75,
    fontSize: 16,
    marginBottom: 16,
  },
  section: {
    marginTop: 28,
  },
  topSection: {
    marginTop: 8,
  },
  sectionLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  sectionCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  fieldGroup: {
    paddingVertical: 4,
  },
  fieldTitle: {
    color: themeVariables.whiteColor,
    fontSize: 18,
    fontWeight: '600',
  },
  fieldDescription: {
    marginTop: 6,
    color: 'rgba(255,255,255,0.72)',
    fontSize: 14,
    lineHeight: 20,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginVertical: 16,
  },
  fontSizeRows: {
    marginTop: 20,
  },
  fontSizeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fontSizeRowSpacing: {
    marginTop: 12,
  },
  fontSizeOptionWrapper: {
    width: '31%',
  },
  fontSizeOption: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
  },
  fontSizeOptionSpacer: {
    opacity: 0,
  },
  fontSizeOptionSelected: {
    backgroundColor: themeVariables.whiteColor,
    borderColor: themeVariables.tertiaryColor,
  },
  fontSizeSample: {
    color: themeVariables.whiteColor,
    fontWeight: '700',
  },
  fontSizeSampleSelected: {
    color: themeVariables.primaryColor,
  },
  fontSizeLabel: {
    marginTop: 8,
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
  },
  fontSizeLabelSelected: {
    color: themeVariables.primaryColor,
    fontWeight: '600',
  },
  sliderContainer: {
    position: 'relative',
    width: '100%',
  },
  lessonSliderContainer: {
    marginTop: 20,
  },
  sliderBubbleContainer: {
    position: 'absolute',
    top: 0,
    alignItems: 'center',
  },
  sliderBubble: {
    alignItems: 'center',
    backgroundColor: themeVariables.tertiaryColor,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    overflow: 'visible',
  },
  sliderBubbleText: {
    color: themeVariables.whiteColor,
    fontSize: 14,
  },
  sliderBubbleTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: themeVariables.tertiaryColor,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sliderMinMax: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    width: 40,
    textAlign: 'center',
  },
  sliderFlex: {
    flex: 1,
    height: 40,
  },
  sliderBottomLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -4,
  },
  sliderBottomLabel: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 13,
  },
  speedSliderContainer: {
    marginTop: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  speedValue: {
    marginTop: 12,
    marginBottom: 8,
    color: themeVariables.whiteColor,
    fontSize: 15,
    fontWeight: '600',
  },
  tickContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 44,
    justifyContent: 'center',
  },
  tick: {
    position: 'absolute',
    width: 2,
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 1,
    alignSelf: 'flex-start',
  },
  tickActive: {
    backgroundColor: themeVariables.tertiaryColor,
    height: 14,
  },
  segmentContainer: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'flex-start',
    marginTop: 16,
  },
  segmentOptionWrapper: {
    flexGrow: 0,
    marginRight: 12,
  },
  segmentOptionWrapperThree: {
    width: '30%',
  },
  segmentOptionWrapperFour: {
    width: '22%',
  },
  segmentOption: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: themeVariables.borderRadiusPill,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  segmentOptionSelected: {
    backgroundColor: themeVariables.whiteColor,
    borderColor: themeVariables.tertiaryColor,
  },
  segmentLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
    fontWeight: '600',
  },
  segmentLabelSelected: {
    color: themeVariables.primaryColor,
  },
  accountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: themeVariables.borderRadiusPill,
    borderWidth: 1,
    borderColor: themeVariables.whiteColor,
    backgroundColor: 'transparent',
  },
  accountLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountIcon: {
    marginRight: 12,
  },
  accountText: {
    color: themeVariables.whiteColor,
    fontSize: 16,
    fontWeight: '600',
  },
});
