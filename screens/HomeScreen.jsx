import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faStar, faCamera } from '@fortawesome/free-solid-svg-icons';
import Avatar from '@flipxyz/react-native-boring-avatars';
import { Button } from 'liquid-spirit-styleguide';
import themeVariables from '../styles/theme';

const HomeScreen = ({ profile, achievements, onDailyChallenge, onSeeClass, currentSet, currentLesson, content, onProfilePress, onAvatarPress }) => {
  const totalPoints = achievements
    ? achievements.filter(ach => ach.earned).reduce((sum, ach) => sum + (ach.points || 0), 0)
    : 0;
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
              <FontAwesomeIcon icon={faCamera} size={14} color={themeVariables.whiteColor} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileTextContainer} onPress={onProfilePress}>
            <Text style={styles.profileName}>{profile.name}</Text>
            <Text style={styles.profileGrade}>Grade {profile.grade || 'N/A'}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.pointsContainer}>
          <FontAwesomeIcon icon={faStar} size={20} color="#f1c40f" />
          <Text style={styles.pointsText}>{totalPoints}</Text>
        </View>
      </View>

      {/* Current progress */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>Set {currentSet}, Lesson {currentLesson}</Text>
      </View>

      {/* Current quote or prayer */}
      <View style={styles.contentContainer}>
        <Text style={styles.contentText}>{content}</Text>
      </View>

      {/* Bottom action buttons */}
      <View style={styles.bottomButtonContainer}>
        <Button label="Daily Challenge" onPress={onDailyChallenge} />
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
    paddingVertical: 16,
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
    alignItems: 'center',
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
  // Main container
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  // Content display
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  contentText: {
    fontSize: 18,
    textAlign: 'center',
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