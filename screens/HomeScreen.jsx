import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import Avatar from '@flipxyz/react-native-boring-avatars';
import themeVariables from '../styles/theme';

/**
 * Home screen showing profile overview, current progress, and action tiles.
 * Props:
 *  - profile: { name, grade, score }
 *  - onDailyChallenge: () => void
 *  - onGoCurrentLesson: () => void
 *  - onGoSet: () => void
 *  - onSeeClass: () => void
 *  - currentSet: number
 *  - currentLesson: number
 */
const HomeScreen = ({ profile, achievements, onDailyChallenge, onGoCurrentLesson, onGoSet, onSeeClass, currentSet, currentLesson }) => {
  const totalPoints = achievements
    ? achievements.filter(ach => ach.earned).reduce((sum, ach) => sum + (ach.points || 0), 0)
    : 0;
  return (
    <>
      {/* Header: avatar and points */}
      <View style={styles.header}>
        <View style={styles.profileContainer}>
          <Avatar size={60} name={profile.name} variant="beam" />
          <View style={styles.profileTextContainer}>
            <Text style={styles.profileName}>{profile.name}</Text>
            <Text style={styles.profileGrade}>Grade {profile.grade || 'N/A'}</Text>
          </View>
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
    {/* Tile grid */}
    <View style={styles.tileContainer}>
      <TouchableOpacity style={styles.tile} onPress={onDailyChallenge}>
        <Text style={styles.tileText}>Daily Challenge</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.tile} onPress={onGoCurrentLesson}>
        <Text style={styles.tileText}>Current Lesson</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.tile} onPress={onGoSet}>
        <Text style={styles.tileText}>Go To Set</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.tile} onPress={onSeeClass}>
        <Text style={styles.tileText}>See Class</Text>
      </TouchableOpacity>
    </View>
    </>
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
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileGrade: {
    fontSize: 16,
  },
  tileContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16,
  },
  tile: {
    backgroundColor: themeVariables.primaryColor,
    width: '48%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderRadius: themeVariables.borderRadiusPill,
  },
  tileText: {
    color: themeVariables.whiteColor,
    fontSize: 16,
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