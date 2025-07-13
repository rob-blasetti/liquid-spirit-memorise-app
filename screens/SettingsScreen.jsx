import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
    if (profile?.grade === 2) {
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
      <View style={styles.container}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>No profile loaded</Text>
        <Button label="Back" onPress={onBack} />
      </View>
    );
  }

  const renderVoiceOptions = () => (
    <>
      <Text style={styles.sectionTitle}>TTS Voice</Text>
      {voiceOptions.map((voice) => (
        <TouchableOpacity
          key={voice.value}
          style={[
            styles.listItem,
            selectedVoice === voice.value && styles.listItemSelected,
          ]}
          onPress={async () => {
            await Tts.setDefaultVoice(voice.value);
            setSelectedVoice(voice.value);
            // Persist the selected voice in user profile
            if (onSaveProfile) {
              onSaveProfile({ ...profile, ttsVoice: voice.value });
            }
          }}
        >
          <Text
            style={[
              styles.listItemText,
              selectedVoice === voice.value && styles.listItemTextSelected,
            ]}
          >
            {voice.label}
          </Text>
        </TouchableOpacity>
      ))}
    </>
  );

  const renderGrade1Settings = () => (
    <>
      <Text style={styles.sectionTitle}>Lesson</Text>
      {grade1Lessons.map(l => (
        <TouchableOpacity
          key={l.lesson}
          style={[styles.listItem, selectedLesson === l.lesson && styles.listItemSelected]}
          onPress={() => setSelectedLesson(l.lesson)}
        >
          <Text style={[styles.listItemText, selectedLesson === l.lesson && styles.listItemTextSelected]}>
            Lesson {l.lesson}
          </Text>
        </TouchableOpacity>
      ))}
    </>
  );

  const renderGrade2Settings = () => {
    const lessons = Object.keys(quoteMap)
      .filter(key => key.startsWith(`${selectedSet}-`))
      .map(key => parseInt(key.split('-')[1], 10))
      .sort((a, b) => a - b);

    return (
      <>
        <Text style={styles.sectionTitle}>Set</Text>
        {[1, 2, 3].map(setNum => (
          <TouchableOpacity
            key={setNum}
            style={[styles.listItem, selectedSet === setNum && styles.listItemSelected]}
            onPress={() => setSelectedSet(setNum)}
          >
            <Text style={[styles.listItemText, selectedSet === setNum && styles.listItemTextSelected]}>
              Set {setNum}
            </Text>
          </TouchableOpacity>
        ))}
        <Text style={styles.sectionTitle}>Lesson</Text>
        {lessons.map(ln => (
          <TouchableOpacity
            key={ln}
            style={[styles.listItem, selectedLesson === ln && styles.listItemSelected]}
            onPress={() => setSelectedLesson(ln)}
          >
            <Text style={[styles.listItemText, selectedLesson === ln && styles.listItemTextSelected]}>
              Lesson {ln}
            </Text>
          </TouchableOpacity>
        ))}
      </>
    );
  };
  
  // Settings for Grade 2b (Book 3-2): Sets 4-7 and lessons per data/grade2b
  const renderGrade2bSettings = () => {
    const lessons = Object.keys(quoteMap2b)
      .filter(key => key.startsWith(`${selectedSet}-`))
      .map(key => parseInt(key.split('-')[1], 10))
      .sort((a, b) => a - b);

    return (
      <>
        <Text style={styles.sectionTitle}>Set</Text>
        {[4, 5, 6, 7].map(setNum => (
          <TouchableOpacity
            key={setNum}
            style={[styles.listItem, selectedSet === setNum && styles.listItemSelected]}
            onPress={() => setSelectedSet(setNum)}
          >
            <Text style={[styles.listItemText, selectedSet === setNum && styles.listItemTextSelected]}>
              Set {setNum}
            </Text>
          </TouchableOpacity>
        ))}
        <Text style={styles.sectionTitle}>Lesson</Text>
        {lessons.map(ln => (
          <TouchableOpacity
            key={ln}
            style={[styles.listItem, selectedLesson === ln && styles.listItemSelected]}
            onPress={() => setSelectedLesson(ln)}
          >
            <Text style={[styles.listItemText, selectedLesson === ln && styles.listItemTextSelected]}>
              Lesson {ln}
            </Text>
          </TouchableOpacity>
        ))}
      </>
    );
  };

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Grade: {profile.grade}</Text>
      {profile.grade === 1 && renderGrade1Settings()}
      {profile.grade === 2 && renderGrade2Settings()}
      {profile.grade === '2b' && renderGrade2bSettings()}

      <Text style={styles.sectionTitle}>Account</Text>
      <TouchableOpacity style={[styles.listItem, styles.accountItem]} onPress={onReset}>
        <Ionicons name="trash" size={16} color={themeVariables.redColor} style={styles.accountIcon} />
        <Text style={[styles.listItemText, styles.accountText]}>Wipe User Details</Text>
      </TouchableOpacity>

      {renderVoiceOptions()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 16,
    backgroundColor: themeVariables.darkGreyColor,
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    width: '100%',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: themeVariables.primaryColor,
  },
  listItem: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: themeVariables.whiteColor,
  },
  listItemSelected: {
    backgroundColor: themeVariables.primaryColor,
  },
  listItemText: {
    fontSize: 16,
    color: themeVariables.primaryColor,
  },
  listItemTextSelected: {
    color: themeVariables.whiteColor,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountIcon: {
    marginRight: 12,
  },
  accountText: {
    color: themeVariables.redColor,
  },
});

export default SettingsScreen;
