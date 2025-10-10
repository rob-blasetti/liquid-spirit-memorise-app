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
  onPointsPress,
  showGradeChip = true,
  showPoints = true,
}) => {
  const { firstName, lastName, username, totalPoints } = profile;
  const fullName = [ firstName, lastName ]
    .filter(part => typeof part === 'string' && part.trim().length > 0)
    .join(' ');
  const displayName = fullName || username;
  const rawGradeValue = profile.grade;
  const gradeString = rawGradeValue === null || typeof rawGradeValue === 'undefined'
    ? ''
    : String(rawGradeValue).trim();
  const shouldShowGradeChip = gradeString.length > 0
    && ![ 'n/a', 'na', 'null', 'undefined', 'nan' ].includes(gradeString.toLowerCase());
  const formattedGradeLabel = shouldShowGradeChip
    ? gradeString.replace(
      /[a-z]+/gi,
      segment => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase(),
    )
    : null;
  const gradeChipText = (() => {
    if (!formattedGradeLabel) return null;
    const labelLower = formattedGradeLabel.toLowerCase();
    if (labelLower.startsWith('grade ')) return formattedGradeLabel;
    if (/^\d/.test(formattedGradeLabel)) return `Grade ${formattedGradeLabel}`;
    if (labelLower === '2b') return 'Grade 2B';
    return formattedGradeLabel;
  })();

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
                {showGradeChip && shouldShowGradeChip && gradeChipText ? (
                  <Chip
                    text={gradeChipText}
                    icon="school-outline"
                    color={themeVariables.primaryColor}
                    bg="rgba(255, 255, 255, 0.85)"
                    style={styles.gradeChip}
                  />
                ) : null}
                {showPoints ? (
                  <TouchableOpacity
                    style={styles.pointsDisplay}
                    onPress={onPointsPress}
                    accessibilityRole="button"
                    accessibilityLabel="View achievements"
                    disabled={typeof onPointsPress !== 'function'}
                    activeOpacity={0.75}
                  >
                    <View style={styles.starButton}>
                      <Ionicons name="star-outline" size={STAR_ICON_SIZE} color={themeVariables.blackColor} />
                    </View>
                    <Text style={styles.pointsText}>{totalPoints ?? 0}</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
              {canSwitchAccount ? (
                <View style={styles.gradeChevronButton}>
                  <Ionicons name="chevron-down" size={12} color={themeVariables.blackColor} />
                </View>
              ) : null}
            </View>

            <View style={[styles.nameContainer, showGradeChip && shouldShowGradeChip && styles.nameIndented]}>
              <Text style={styles.profileName}>{displayName}</Text>
              {(profile.linkedAccount || profile.type === 'linked') && (
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
