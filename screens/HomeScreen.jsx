import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import themeVariables from '../styles/theme';
import QuoteBlock from '../components/QuoteBlock';
import ProfileDisplay from '../components/ProfileDisplay';

const HomeScreen = ({
  profile,
  achievements,
  onDailyChallenge,
  onTestMemory,
  onSeeClass,
  onGoToSet,
  onGoToLesson,
  currentSet,
  currentLesson,
  content,
  onProfilePress,
  onAvatarPress,
}) => {
  const defaultReferences = [
    { word: 'love', examples: ['I love my family.', 'Love conquers all.'] },
    { word: 'heart', examples: ['My heart is joyful.', 'He spoke from the heart.'] },
  ];

  console.log('profile: ', profile);

  return (
    <View style={styles.container}>
      {/* Profile Header */}
      <ProfileDisplay
        profile={profile}
        achievements={achievements}
        currentSet={currentSet}
        currentLesson={currentLesson}
        onAvatarPress={onAvatarPress}
        onProfilePress={onProfilePress}
      />

      {/* Quote/Content */}
      <View style={styles.contentContainer}>
        <QuoteBlock quote={content} profile={profile} references={defaultReferences} />
      </View>

      {/* Action Buttons */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity style={styles.customButton} onPress={onDailyChallenge}>
          <Text style={styles.customButtonText}>Daily Challenge</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>

        {onSeeClass && (
          <TouchableOpacity style={styles.customButton} onPress={onSeeClass}>
            <Text style={styles.customButtonText}>See Class</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>
        )}

          <TouchableOpacity style={styles.customButton} onPress={onGoToSet}>
            <Text style={styles.customButtonText}>Go to Set</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.customButton} onPress={onGoToLesson}>
            <Text style={styles.customButtonText}>Current Lesson</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    backgroundColor: themeVariables.primaryColor,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 24,
  },
  bottomButtonContainer: {
    width: '100%',
    marginTop: 24,
    gap: 12,
    marginBottom: 16,
  },
  customButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: themeVariables.whiteColor,
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 20,
    width: '100%',
  },
  customButtonText: {
    color: themeVariables.whiteColor,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default HomeScreen;
