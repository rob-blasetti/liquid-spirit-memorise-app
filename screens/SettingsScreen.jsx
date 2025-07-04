import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import themeVariables from '../styles/theme';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { grade1Lessons } from '../data/grade1';
import { quoteMap } from '../data/grade2';
import { Button } from 'liquid-spirit-styleguide';

const SettingsScreen = ({ profile, currentProgress, overrideProgress, onSaveOverride, onBack, onReset }) => {
  const [selectedSet, setSelectedSet] = useState(
    overrideProgress?.setNumber ?? currentProgress.setNumber
  );
  const [selectedLesson, setSelectedLesson] = useState(
    overrideProgress?.lessonNumber ?? currentProgress.lessonNumber
  );

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
  // Auto-save override when selection changes (skip initial mount)
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
  
  // Grade 1: select lesson only
  if (profile.grade === 1) {
    return (
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
        <Text style={styles.title}>Settings</Text>
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
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity style={[styles.listItem, styles.accountItem]} onPress={onReset}>
          <FontAwesomeIcon icon={faTrash} size={16} color={themeVariables.redColor} style={styles.accountIcon} />
          <Text style={[styles.listItemText, styles.accountText]}>Wipe User Details</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }
  
  // Grade 2: select set then lesson
  if (profile.grade === 2) {
    const lessons = Object.keys(quoteMap)
      .filter(key => key.startsWith(`${selectedSet}-`))
      .map(key => parseInt(key.split('-')[1], 10))
      .sort((a, b) => a - b);
    return (
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
        <Text style={styles.title}>Settings</Text>
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
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity style={[styles.listItem, styles.accountItem]} onPress={onReset}>
          <FontAwesomeIcon icon={faTrash} size={16} color={themeVariables.redColor} style={styles.accountIcon} />
          <Text style={[styles.listItemText, styles.accountText]}>Wipe User Details</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }
  
  // Other grades: not implemented
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Settings for Grade {profile.grade} not available</Text>
      <View style={styles.buttonContainer}>
        <Button secondary label="Back" onPress={onBack} />
        <Button label="Reset" onPress={onReset} />        
      </View>
    </View>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  rowLabel: {
    width: 80,
    fontSize: 16,
    color: themeVariables.primaryColor,
  },
  rowOptions: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 16,
  },
  gridItem: {
    width: '30%',
    margin: '1.5%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: themeVariables.primaryColor,
    borderRadius: themeVariables.borderRadiusPill,
    backgroundColor: themeVariables.whiteColor,
  },
  gridItemSelected: {
    backgroundColor: themeVariables.primaryColor,
  },
  gridItemText: {
    fontSize: 14,
    color: themeVariables.primaryColor,
  },
  gridItemTextSelected: {
    color: themeVariables.whiteColor,
  },
  cell: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: themeVariables.primaryColor,
    borderRadius: themeVariables.borderRadiusPill,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: themeVariables.whiteColor,
  },
  cellSelected: {
    backgroundColor: themeVariables.primaryColor,
  },
  cellText: {
    fontSize: 14,
    color: themeVariables.primaryColor,
  },
  cellTextSelected: {
    color: themeVariables.whiteColor,
  },
  buttonContainer: {
    width: '80%',
    marginTop: 16,
  },
  resetRow: {
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    marginTop: 16,
  },
  resetRowText: {
    color: themeVariables.redColor,
    fontSize: 16,
  },
  // New list-style settings
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
  // Account section items
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