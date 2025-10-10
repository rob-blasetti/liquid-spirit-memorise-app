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

const SettingsScreen = ({ profile, currentProgress, overrideProgress, onSaveOverride, onBack, onReset, onSaveProfile }) => {
  const [selectedSet, setSelectedSet] = useState(
    overrideProgress?.setNumber ?? currentProgress.setNumber
  );
  const [selectedLesson, setSelectedLesson] = useState(
    overrideProgress?.lessonNumber ?? currentProgress.lessonNumber
  );
  // ElevenLabs uses voice id from profile or env; no device voice list
  const [speed, setSpeed] = useState(profile?.ttsSpeed ?? 1.0);
  // Slider width for rendering tick marks
  const [speedSliderWidth, setSpeedSliderWidth] = useState(0);
  const allowedSpeeds = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
  const fmtSpeed = (v) => `${Number(v).toFixed(2)}x`;
  const snapToAllowed = (val) => {
    const v = Math.max(0.5, Math.min(2.0, Number(val) || 1));
    let closest = allowedSpeeds[0];
    let diff = Math.abs(v - closest);
    for (let i = 1; i < allowedSpeeds.length; i++) {
      const d = Math.abs(v - allowedSpeeds[i]);
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
    const v = Math.max(0.5, Math.min(2.0, Number(speed) || 1));
    elevenLabs.setSpeed(v);
    onSaveProfile?.({ ...profile, ttsSpeed: v });
  }, [speed]);

  // Cache is managed automatically with sensible defaults; no user controls

  // Pre-cache ElevenLabs audio for the selected lesson only (minimize API calls)
  useEffect(() => {
    const looksLikeUuid = typeof profile?.ttsVoice === 'string' && /^[a-f0-9-]{10,}$/i.test(profile.ttsVoice);
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
    <View style={styles.headerRow}>
      {hasBackHandler ? (
        <TouchableOpacity
          style={styles.headerButton}
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Back to home"
        >
          <Ionicons name="chevron-back" size={20} color={themeVariables.whiteColor} />
        </TouchableOpacity>
      ) : (
        <View style={styles.headerButtonPlaceholder} />
      )}
      <Text style={styles.headerTitle}>Settings</Text>
      <View style={styles.headerButtonPlaceholder} />
    </View>
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
    // Calculate bubble position
    const range = maxLesson - minLesson;
    const bubbleRatio = range > 0 ? (selectedLesson - minLesson) / range : 0.5;
    const rawLeft = sliderWidth * bubbleRatio - bubbleLayout.width / 2;
    const bubbleLeft = sliderWidth
      ? Math.min(Math.max(rawLeft, 0), sliderWidth - bubbleLayout.width)
      : 0;
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lesson</Text>
        <View
          style={styles.sliderContainer}
          onLayout={({ nativeEvent }) =>
            setSliderWidth(nativeEvent.layout.width)
          }
        >
          {/* Bubble container with pointer */}
          <View
            style={[styles.sliderBubbleContainer, { left: bubbleLeft }]}
          >
            {/* Bubble rectangle */}
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
            {/* Pointer triangle */}
            <View style={styles.sliderBubbleTriangle} />
          </View>
          {/* Slider and min/max labels positioned below bubble */}
          <View
            style={[
              styles.sliderRow,
              { marginTop: bubbleLayout.height + 16 },
            ]}
          >
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
    );
  };

  const renderGrade2Settings = () => {
    const lessons = Object.keys(quoteMap)
      .filter(key => key.startsWith(`${selectedSet}-`))
      .map(key => parseInt(key.split('-')[1], 10))
      .sort((a, b) => a - b);

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Set</Text>
        <View style={styles.segmentContainer}>
          {[1, 2, 3].map(setNum => (
            <TouchableOpacity
              key={setNum}
              style={[
                styles.segmentOption,
                selectedSet === setNum && styles.segmentOptionSelected,
              ]}
              onPress={() => setSelectedSet(setNum)}
            >
              <Text
                style={[
                  styles.itemText,
                  selectedSet === setNum && styles.itemTextSelected,
                ]}
              >
                {setNum}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.sectionTitle}>Lesson</Text>
        <View style={styles.segmentContainer}>
          {lessons.map(ln => (
            <TouchableOpacity
              key={ln}
              style={[
                styles.segmentOption,
                selectedLesson === ln && styles.segmentOptionSelected,
              ]}
              onPress={() => setSelectedLesson(ln)}
            >
              <Text
                style={[
                  styles.itemText,
                  selectedLesson === ln && styles.itemTextSelected,
                ]}
              >
                {ln}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderGrade2bSettings = () => {
    const lessons = Object.keys(quoteMap2b)
      .filter(key => key.startsWith(`${selectedSet}-`))
      .map(key => parseInt(key.split('-')[1], 10))
      .sort((a, b) => a - b);

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Set</Text>
        <View style={styles.segmentContainer}>
          {[4, 5, 6, 7].map(setNum => (
            <TouchableOpacity
              key={setNum}
              style={[
                styles.segmentOption,
                selectedSet === setNum && styles.segmentOptionSelected,
              ]}
              onPress={() => setSelectedSet(setNum)}
            >
              <Text
                style={[
                  styles.itemText,
                  selectedSet === setNum && styles.itemTextSelected,
                ]}
              >
                {setNum}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.sectionTitle}>Lesson</Text>
        <View style={styles.segmentContainer}>
          {lessons.map(ln => (
            <TouchableOpacity
              key={ln}
              style={[
                styles.segmentOption,
                selectedLesson === ln && styles.segmentOptionSelected,
              ]}
              onPress={() => setSelectedLesson(ln)}
            >
              <Text
                style={[
                  styles.itemText,
                  selectedLesson === ln && styles.itemTextSelected,
                ]}
              >
                {ln}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {renderHeader()}
        <Text style={styles.subtitle}>Grade: {profile.grade}</Text>
        {String(profile.grade) === '1' && renderGrade1Settings()}
        {String(profile.grade) === '2' && renderGrade2Settings()}
        {String(profile.grade) === '2b' && renderGrade2bSettings()}

        {/* Playback speed */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Playback Speed</Text>
          <Text style={styles.centerLabel}>Current: {fmtSpeed(speed)}</Text>
          <View
            style={styles.sliderContainer}
            onLayout={({ nativeEvent }) => setSpeedSliderWidth(nativeEvent.layout.width)}
          >
            {/* Ticks for each snap point */}
            <View style={styles.tickContainer} pointerEvents="none">
              {allowedSpeeds.map((sp, i) => {
                const min = 0.5, max = 2.0;
                const ratio = (sp - min) / (max - min);
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

            {/* Slider only */}
            <View style={styles.sliderRow}>
              <Slider
                style={styles.sliderFlex}
                minimumValue={0.5}
                maximumValue={2.0}
                step={0.01}
                value={speed}
                minimumTrackTintColor={themeVariables.tertiaryColor}
                maximumTrackTintColor={themeVariables.neutralDark}
                thumbTintColor={themeVariables.whiteColor}
                onValueChange={val => setSpeed(snapToAllowed(val))}
              />
            </View>

            {/* Bottom min/max labels */}
            <View style={styles.sliderBottomLabels}>
              <Text style={styles.sliderBottomLabel}>{fmtSpeed(0.5)}</Text>
              <Text style={styles.sliderBottomLabel}>{fmtSpeed(2.0)}</Text>
            </View>
          </View>
        </View>

        {/* ElevenLabs voice configured via profile.ttsVoice or .env */}
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.itemWrapper}>
            <TouchableOpacity style={[styles.item]} onPress={onReset}>
              <Ionicons name="log-out-outline" size={20} color={themeVariables.redColor} style={styles.accountIcon} />
              <Text style={[styles.itemText, styles.accountText]}>Logout</Text>
            </TouchableOpacity>
          </View>
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
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  headerButton: {
    minWidth: 36,
    minHeight: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonPlaceholder: {
    width: 36,
    height: 36,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: themeVariables.whiteColor,
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    color: themeVariables.whiteColor,
    opacity: 0.75,
    fontSize: 16,
    marginBottom: 16,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    color: themeVariables.whiteColor,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  itemWrapper: {
    marginBottom: 12,
  },
  segmentContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    backgroundColor: themeVariables.neutralLight,
    borderRadius: themeVariables.borderRadiusPill,
    overflow: 'hidden',
  },
  segmentOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentOptionSelected: {
    backgroundColor: themeVariables.tertiaryColor,
  },
  // Display selected slider value inside a pink circular background
  sliderValue: {
    backgroundColor: themeVariables.tertiaryColor,
    color: themeVariables.whiteColor,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignSelf: 'center',
  },
  // Slider track styling (height only; width flexes)
  slider: {
    height: 40,
  },
  // Container for slider and its min/max labels
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  // Label for slider min and max values
  sliderMinMax: {
    color: themeVariables.whiteColor,
    fontSize: 14,
    width: 36,
    textAlign: 'center',
  },
  // Flex style for slider within row
  sliderFlex: {
    flex: 1,
    height: 40,
  },
  sliderBottomLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -6,
  },
  sliderBottomLabel: {
    color: themeVariables.whiteColor,
    fontSize: 12,
    opacity: 0.85,
  },
  // Slider container to measure width and position the floating bubble
  sliderContainer: {
    position: 'relative',
    width: '100%',
  },
  // Container wrapping bubble rectangle and pointer triangle
  sliderBubbleContainer: {
    position: 'absolute',
    top: 0,
    alignItems: 'center',
  },
  // Floating bubble rectangle for the value
  sliderBubble: {
    alignItems: 'center',
    backgroundColor: themeVariables.tertiaryColor,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    overflow: 'visible',
  },
  // Text inside the floating bubble
  sliderBubbleText: {
    color: themeVariables.whiteColor,
    fontSize: 14,
  },
  // Triangle pointer underneath the bubble
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
  centerLabel: {
    color: themeVariables.whiteColor,
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  // Ticks under the speed slider
  tickContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 40,
    justifyContent: 'center',
  },
  tick: {
    position: 'absolute',
    width: 2,
    height: 8,
    backgroundColor: themeVariables.neutralDark,
    borderRadius: 1,
    alignSelf: 'flex-start',
  },
  tickActive: {
    backgroundColor: themeVariables.tertiaryColor,
    height: 10,
  },
  item: {
    backgroundColor: themeVariables.neutralLight,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: themeVariables.borderRadiusPill,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemSelected: {
    backgroundColor: themeVariables.tertiaryColor,
  },
  itemText: {
    flex: 1,
    color: themeVariables.darkText,
    fontSize: 16,
  },
  itemTextSelected: {
    color: themeVariables.whiteColor,
  },
  accountItem: {
    backgroundColor: 'transparent',
  },
  accountIcon: {
    marginRight: 12,
  },
  accountText: {
    color: themeVariables.redColor,
  },
});
