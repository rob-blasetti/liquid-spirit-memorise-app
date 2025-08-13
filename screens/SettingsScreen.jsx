import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import Slider from '@react-native-community/slider';
import themeVariables from '../styles/theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { grade1Lessons } from '../data/grade1';
import { quoteMap } from '../data/grade2';
import { quoteMap as quoteMap2b } from '../data/grade2b';
import { Button } from 'liquid-spirit-styleguide';
import Tts from 'react-native-tts';

const voiceOptions = [
  { label: 'Samantha (US)', value: 'com.apple.ttsbundle.Samantha-compact' },
  { label: 'Daniel (UK)', value: 'com.apple.ttsbundle.Daniel-compact' },
  { label: 'Karen (AU)', value: 'com.apple.ttsbundle.Karen-compact' },
];

const SettingsScreen = ({ profile, currentProgress, overrideProgress, onSaveOverride, onBack, onReset, onSaveProfile }) => {
  const [selectedSet, setSelectedSet] = useState(
    overrideProgress?.setNumber ?? currentProgress.setNumber
  );
  const [selectedLesson, setSelectedLesson] = useState(
    overrideProgress?.lessonNumber ?? currentProgress.lessonNumber
  );
  const [selectedVoice, setSelectedVoice] = useState(profile?.ttsVoice ?? null);
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

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>No profile loaded</Text>
        <Button label="Back" onPress={onBack} />
      </SafeAreaView>
    );
  }

  const renderVoiceOptions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>TTS Voice</Text>
      {voiceOptions.map((voice) => (
        <View key={voice.value} style={styles.itemWrapper}>
          <TouchableOpacity
            style={[
              styles.item,
              selectedVoice === voice.value && styles.itemSelected,
            ]}
            onPress={async () => {
              await Tts.setDefaultVoice(voice.value);
              setSelectedVoice(voice.value);
              onSaveProfile?.({ ...profile, ttsVoice: voice.value });
            }}
          >
            <Text
              style={[
                styles.itemText,
                selectedVoice === voice.value && styles.itemTextSelected,
              ]}
            >
              {voice.label}
            </Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

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
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Grade: {profile.grade}</Text>
        {String(profile.grade) === '1' && renderGrade1Settings()}
        {String(profile.grade) === '2' && renderGrade2Settings()}
        {String(profile.grade) === '2b' && renderGrade2bSettings()}

        {renderVoiceOptions()}
        
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
  content: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  title: {
    color: themeVariables.whiteColor,
    fontSize: 24,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
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
    width: 24,
    textAlign: 'center',
  },
  // Flex style for slider within row
  sliderFlex: {
    flex: 1,
    height: 40,
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
