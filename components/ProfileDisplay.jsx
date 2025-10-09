import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Avatar from '@liquidspirit/react-native-boring-avatars';
import LinearGradient from 'react-native-linear-gradient';
import themeVariables from '../styles/theme';
import Chip from './Chip';

const AVATAR_SIZE = 68; // slightly smaller avatar
const STAR_ICON_SIZE = 14; // compact star so it fits beside the grade

const ProfileDisplay = ({
  profile,
  currentSet,
  currentLesson,
  onAvatarPress,
  onProfilePress,
  canSwitchAccount,
}) => {
  const { firstName, lastName, username, totalPoints } = profile;
  const fullName = [ firstName, lastName ]
    .filter(part => typeof part === 'string' && part.trim().length > 0)
    .join(' ');
  const displayName = fullName || username;
  const gradeLabel = profile.grade?.toString() || 'N/A';
  const isGradeTwoB = gradeLabel?.toLowerCase() === '2b';

  // lesson pattern: Lesson {set}.{lesson} (falls back to just lesson if no set)
  const lessonDisplay = (typeof currentSet !== 'undefined' && currentSet !== null)
    ? `${currentSet}.${currentLesson}`
    : (typeof currentLesson !== 'undefined' && currentLesson !== null ? `${currentLesson}` : 'N/A');

  return (
    <LinearGradient
      colors={['#b13cb3', '#5a2ca0']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <View style={styles.profileContainer}>
          <TouchableOpacity style={styles.avatarWrapper} onPress={onAvatarPress}>
            {(() => {
              const avatarUri = profile.profilePicture || profile.avatar;
              return avatarUri ? (
                <FastImage
                  source={{
                    uri: avatarUri,
                    priority: FastImage.priority.high,
                    cache: FastImage.cacheControl.immutable,
                  }}
                  style={styles.profileAvatar}
                  resizeMode={FastImage.resizeMode.cover}
                />
              ) : (
                <Avatar size={AVATAR_SIZE} name={displayName} variant="beam" />
              );
            })()}
            <View style={styles.avatarOverlay}>
              <Ionicons name="camera" size={14} color={themeVariables.blackColor} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.profileTextContainer} onPress={onProfilePress}>
            <View style={styles.gradeRow}>
              <View style={styles.gradeContent}>
                {isGradeTwoB ? (
                  <Chip
                    text="Grade 2B"
                    icon="school-outline"
                    color={themeVariables.primaryColor}
                    bg="rgba(255, 255, 255, 0.85)"
                    style={styles.gradeChip}
                  />
                ) : (
                  <Text style={styles.profileGrade}>Grade {gradeLabel}</Text>
                )}
                <View style={styles.pointsDisplay}>
                  <View style={styles.starButton}>
                    <Ionicons name="star-outline" size={STAR_ICON_SIZE} color={themeVariables.blackColor} />
                  </View>
                  <Text style={styles.pointsText}>{totalPoints ?? 0}</Text>
                </View>
              </View>
              {canSwitchAccount ? (
                <View style={styles.gradeChevronButton}>
                  <Ionicons name="chevron-down" size={12} color={themeVariables.blackColor} />
                </View>
              ) : null}
            </View>

            <View style={[styles.nameContainer, isGradeTwoB && styles.nameIndented]}>
              <Text style={styles.profileName}>{displayName}</Text>
              {profile.type === 'linked' && (
                <Ionicons name="link" size={14} color={themeVariables.whiteColor} style={styles.linkIcon} />
              )}
            </View>

            {/* Lesson moved out of ProfileDisplay to Home screen */}
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderRadius: 50, // more rounded
    overflow: 'hidden',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarWrapper: {
    position: 'relative',
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
  },
  profileAvatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: themeVariables.whiteColor,
    borderRadius: 14,
    padding: 6,
    elevation: 2,
  },
  profileTextContainer: {
    justifyContent: 'center',
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: themeVariables.whiteColor,
  },
  profileGrade: {
    fontSize: 14,
    color: themeVariables.whiteColor,
    marginRight: 8,
  },
  gradeChip: {
    marginRight: 8,
    alignSelf: 'flex-start',
  },
  gradeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    width: '100%',
  },
  gradeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pointsDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  starButton: {
    backgroundColor: themeVariables.whiteColor,
    borderRadius: 14,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1.5,
    marginRight: 4,
  },
  pointsText: {
    fontSize: 12,
    fontWeight: '700',
    color: themeVariables.whiteColor,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameIndented: {
    marginLeft: 6,
  },
  gradeChevronButton: {
    marginLeft: 12,
    backgroundColor: themeVariables.whiteColor,
    borderRadius: 14,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1.5,
  },
  linkIcon: {
    marginLeft: 8,
  },
});

export default ProfileDisplay;
