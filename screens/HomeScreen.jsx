import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from 'liquid-spirit-styleguide';
import themeVariables from '../styles/theme';
import QuoteBlock from '../components/QuoteBlock';
import ProfileDisplay from '../components/ProfileDisplay';

const HomeScreen = ({
  profile,
  achievements,
  onDailyChallenge,
  onTestMemory,
  onSeeClass,
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
        <Button secondary label="Daily Challenge" onPress={onDailyChallenge} />
        {onTestMemory && (
          <Button secondary label="Test My Memory" onPress={onTestMemory} />
        )}
        {onSeeClass && (
          <Button secondary label="See Class" onPress={onSeeClass} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: themeVariables.primaryColor,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    // Ensure header tall enough to fit avatar and text comfortably
    minHeight: 200,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: themeVariables.whiteColor,
    borderRadius: 12,
    padding: 4,
  },
  profileTextContainer: {
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: themeVariables.whiteColor,
  },
  profileGrade: {
    fontSize: 16,
    color: themeVariables.whiteColor,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
    color: themeVariables.whiteColor,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
  },
  pointsText: {
    fontSize: 16,
    marginLeft: 4,
    fontWeight: 'bold',
    color: themeVariables.whiteColor,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  bottomButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  bottomButton: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: themeVariables.primaryColor,
    paddingVertical: 12,
    borderRadius: themeVariables.borderRadiusPill,
    alignItems: 'center',
  },
  bottomButtonText: {
    color: themeVariables.whiteColor,
    fontSize: 14,
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },
});

export default HomeScreen;
