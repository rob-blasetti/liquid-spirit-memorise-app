import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Avatar from '@liquidspirit/react-native-boring-avatars';
import LinearGradient from 'react-native-linear-gradient';
import themeVariables from '../styles/theme';

const AVATAR_SIZE = 68; // slightly smaller avatar
const STAR_SIZE = 48; // slightly smaller star for the score

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
                    priority: FastImage.priority.normal,
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
            <View style={styles.nameContainer}>
              <Text style={styles.profileName}>{displayName}</Text>
              {canSwitchAccount ? (
                <Ionicons name="chevron-down" size={16} color={themeVariables.whiteColor} style={styles.chevronIcon} />
              ) : null}
              {profile.type === 'linked' && (
                <Ionicons name="link" size={14} color={themeVariables.whiteColor} style={styles.linkIcon} />
              )}
            </View>

            <Text style={styles.profileGrade}>Grade {profile.grade?.toString() || 'N/A'}</Text>

            {/* Lesson moved out of ProfileDisplay to Home screen */}
          </TouchableOpacity>
        </View>

        <View style={styles.pointsContainer}>
          <View style={styles.starWrapper}>
            <Ionicons name="star" size={STAR_SIZE} color="#f1c40f" />
            <Text style={styles.pointsBadge}>{totalPoints ?? 0}</Text>
          </View>
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
    justifyContent: 'space-between',
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
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: themeVariables.whiteColor,
  },
  profileGrade: {
    fontSize: 14,
    color: themeVariables.whiteColor,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  starWrapper: {
    width: STAR_SIZE + 8,
    height: STAR_SIZE + 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pointsBadge: {
    position: 'absolute',
    textAlign: 'center',
    alignSelf: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: themeVariables.blackColor,
    // small shadow so it reads nicely over the star
    textShadowColor: 'rgba(0,0,0,0.12)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
    marginTop: 4,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkIcon: {
    marginLeft: 8,
  },
  chevronIcon: {
    marginLeft: 6,
  },
});

export default ProfileDisplay;
