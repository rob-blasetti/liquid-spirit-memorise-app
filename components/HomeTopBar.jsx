import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Avatar from '@liquidspirit/react-native-boring-avatars';
import themeVariables from '../styles/theme';

const AVATAR_SIZE = 84;

const HomeTopBar = ({
  profile,
  onAvatarPress,
  onOpenAchievements,
  onOpenSettings,
}) => {
  const { displayName, totalPoints, avatarUri, isLinkedAccount } = useMemo(() => {
    const { firstName, lastName, username, totalPoints: profilePoints } = profile;
    const fullName = [firstName, lastName]
      .filter(part => typeof part === 'string' && part.trim().length > 0)
      .join(' ');
    const computedDisplayName = fullName || username;
    const pictureUri = profile.profilePicture || profile.avatar;
    const linkedAccount = Boolean(profile?.linkedAccount || profile?.type === 'linked');
    return {
      displayName: computedDisplayName,
      totalPoints: profilePoints ?? 0,
      avatarUri: pictureUri,
      isLinkedAccount: linkedAccount,
    };
  }, [profile]);

  const canPressAvatar = typeof onAvatarPress === 'function';
  const showPointsButton = typeof onOpenAchievements === 'function';
  const showSettingsButton = typeof onOpenSettings === 'function';

  return (
    <View style={styles.topBar}>
      <View style={styles.row}>
        <View style={styles.sideContainer}>
          {showPointsButton ? (
            <TouchableOpacity
              style={styles.pointsButton}
              onPress={onOpenAchievements}
              accessibilityRole="button"
              accessibilityLabel="View achievements"
              activeOpacity={0.75}
            >
              <View style={styles.starIconWrapper}>
                <Ionicons
                  name="star-outline"
                  size={18}
                  color={themeVariables.blackColor}
                />
              </View>
              <Text style={styles.pointsText}>{totalPoints}</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity
          style={[
            styles.avatarWrapper,
            isLinkedAccount && styles.avatarWrapperLinked,
          ]}
          onPress={canPressAvatar ? onAvatarPress : undefined}
          accessibilityRole={canPressAvatar ? 'button' : undefined}
          accessibilityLabel={canPressAvatar ? 'Update profile picture' : undefined}
          disabled={!canPressAvatar}
          activeOpacity={0.8}
        >
          {avatarUri ? (
            <FastImage
              source={{
                uri: avatarUri,
                priority: FastImage.priority.high,
                cache: FastImage.cacheControl.immutable,
              }}
              style={[
                styles.avatar,
                isLinkedAccount && styles.avatarLinked,
              ]}
              resizeMode={FastImage.resizeMode.cover}
            />
          ) : (
            <Avatar
              size={isLinkedAccount ? AVATAR_SIZE - 6 : AVATAR_SIZE}
              name={displayName}
              variant="beam"
            />
          )}
          {canPressAvatar ? (
            <View style={styles.avatarOverlay}>
              <Ionicons name="camera" size={16} color={themeVariables.blackColor} />
            </View>
          ) : null}
        </TouchableOpacity>

        <View style={[styles.sideContainer, styles.sideContainerRight]}>
          {showSettingsButton ? (
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={onOpenSettings}
              accessibilityRole="button"
              accessibilityLabel="Open settings"
              activeOpacity={0.75}
            >
              <Ionicons
                name="settings-outline"
                size={20}
                color={themeVariables.whiteColor}
              />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  topBar: {
    width: '100%',
    backgroundColor: 'rgba(13, 23, 60, 0.65)',
    borderRadius: 28,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sideContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  sideContainerRight: {
    alignItems: 'flex-end',
  },
  pointsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  starIconWrapper: {
    backgroundColor: themeVariables.whiteColor,
    borderRadius: 16,
    padding: 6,
    marginRight: 6,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1.5,
  },
  pointsText: {
    color: themeVariables.whiteColor,
    fontSize: 15,
    fontWeight: '600',
  },
  avatarWrapper: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    overflow: 'visible',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: AVATAR_SIZE / 2,
  },
  avatarWrapperLinked: {
    borderWidth: 3,
    borderColor: themeVariables.primaryColor,
    padding: 3,
  },
  avatarLinked: {
    borderRadius: (AVATAR_SIZE - 6) / 2,
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: themeVariables.whiteColor,
    borderRadius: 16,
    padding: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    zIndex: 2,
  },
  settingsButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 20,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default HomeTopBar;
