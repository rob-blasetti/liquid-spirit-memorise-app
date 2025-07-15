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
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lesson</Text>
        <Text style={styles.sliderValue}>{selectedLesson}</Text>
        <Slider
          style={styles.slider}
          minimumValue={minLesson}
          maximumValue={maxLesson}
          step={1}
          value={selectedLesson}
          minimumTrackTintColor={themeVariables.tertiaryColor}
          maximumTrackTintColor={themeVariables.neutralDark}
          thumbTintColor={themeVariables.whiteColor}
          onValueChange={val => setSelectedLesson(val)}
        />
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
    backgroundColor: themeVariables.primaryColor,
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
  sliderValue: {
    color: themeVariables.whiteColor,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
    marginBottom: 12,
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
