import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Avatar from '@liquidspirit/react-native-boring-avatars';
import LinearGradient from 'react-native-linear-gradient';
import themeVariables from '../styles/theme';

const ProfileDisplay = ({
  profile,
  achievements,
  currentSet,
  currentLesson,
  onAvatarPress,
  onProfilePress,
}) => {
  const { firstName, lastName, username, totalPoints } = profile;
  const fullName = [ firstName, lastName ]
    .filter(part => typeof part === 'string' && part.trim().length > 0)
    .join(' ');
  const displayName = fullName || username;

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
                <Avatar size={64} name={displayName} variant="beam" />
              );
            })()}
            <View style={styles.avatarOverlay}>
              <Ionicons name="camera" size={14} color={themeVariables.blackColor} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.profileTextContainer} onPress={onProfilePress}>
            <View style={styles.nameContainer}>
              <Text style={styles.profileName}>{displayName}</Text>
              {profile.type === 'linked' && (
                <Ionicons name="link" size={14} color={themeVariables.whiteColor} style={styles.linkIcon} />
              )}
            </View>
            <Text style={styles.profileGrade}>Grade {profile.grade?.toString() || 'N/A'}</Text>
          {/* Show only lesson for Grade 1, otherwise include set */}
          {profile.grade == 1 ? (
            <Text style={styles.progressText}>Lesson {currentLesson}</Text>
          ) : (
            <Text style={styles.progressText}>Set {currentSet}, Lesson {currentLesson}</Text>
          )}
          </TouchableOpacity>
        </View>

        <View style={styles.pointsContainer}>
          <Ionicons name="star" size={20} color="#f1c40f" />
          <Text style={styles.pointsText}>{totalPoints}</Text>
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
    borderRadius: 20,
    overflow: 'hidden',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: 20,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarWrapper: {
    position: 'relative',
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
    marginLeft: 20,
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
  },
  pointsText: {
    fontSize: 16,
    marginLeft: 4,
    fontWeight: 'bold',
    color: themeVariables.whiteColor,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkIcon: {
    marginLeft: 8,
  },
});

export default ProfileDisplay;