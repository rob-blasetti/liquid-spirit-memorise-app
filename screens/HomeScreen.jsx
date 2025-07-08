import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Avatar from '@flipxyz/react-native-boring-avatars';
import { Button } from 'liquid-spirit-styleguide';
import themeVariables from '../styles/theme';
import QuoteBlock from '../components/QuoteBlock';

const HomeScreen = ({ profile, achievements, onDailyChallenge, onTestMemory, onSeeClass, currentSet, currentLesson, content, onProfilePress, onAvatarPress }) => {
  const totalPoints = achievements
    ? achievements.filter(ach => ach.earned).reduce((sum, ach) => sum + (ach.points || 0), 0)
    : 0;
  const defaultReferences = [
    { word: 'love', examples: ['I love my family.', 'Love conquers all.'] },
    { word: 'heart', examples: ['My heart is joyful.', 'He spoke from the heart.'] },
  ];
  return (
    <View style={styles.container}>
      {/* Header: avatar (change pic) and points */}
      <View style={styles.header}>
        <View style={styles.profileContainer}>
          <TouchableOpacity style={styles.avatarWrapper} onPress={onAvatarPress}>
            {profile.avatar ? (
              <Image source={{ uri: profile.avatar }} style={styles.profileAvatar} />
            ) : (
              <Avatar size={60} name={profile.name} variant="beam" />
            )}
            <View style={styles.avatarOverlay}>
              <Ionicons name="camera" size={14} color={themeVariables.blackColor} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileTextContainer} onPress={onProfilePress}>
            <Text style={styles.profileName}>{profile.name}</Text>
            <Text style={styles.profileGrade}>Grade {profile.grade || 'N/A'}</Text>
            <Text style={styles.progressText}>Set {currentSet}, Lesson {currentLesson}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.pointsContainer}>
          <Ionicons name="star" size={20} color="#f1c40f" />
          <Text style={styles.pointsText}>{totalPoints}</Text>
        </View>
      </View>


      {/* Current quote or prayer */}
      <View style={styles.contentContainer}>
        <QuoteBlock quote={content} references={defaultReferences} />
      </View>

      {/* Bottom action buttons */}
      <View style={styles.bottomButtonContainer}>
        <Button label="Daily Challenge" onPress={onDailyChallenge} />
        {/* Test My Memory button */}
        {onTestMemory && (
          <Button label="Test My Memory" onPress={onTestMemory} />
        )}
        {/* Only show See Class if there are classes */}
        {onSeeClass && (
          <Button label="See Class" onPress={onSeeClass} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: 16,
    borderRadius: themeVariables.borderRadiusPill,
    backgroundColor: themeVariables.greyColor,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsText: {
    fontSize: 16,
    marginLeft: 4,
    fontWeight: 'bold',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  profileTextContainer: {
    marginLeft: 12,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileGrade: {
    fontSize: 16,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: themeVariables.whiteColor,
    borderRadius: 12,
    padding: 4,
  },
  // Main container
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: themeVariables.darkGreyColor,
  },
  // Content display
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  // Bottom action buttons
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
  // Progress display
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '500',
    color: themeVariables.primaryColor,
  },
});

export default HomeScreen;