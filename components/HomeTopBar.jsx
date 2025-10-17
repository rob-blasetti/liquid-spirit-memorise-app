import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Avatar from '@liquidspirit/react-native-boring-avatars';
import themeVariables from '../styles/theme';
import Chip from './Chip';

const AVATAR_SIZE = 56;

const HomeTopBar = ({
  profile,
  onAvatarPress,
  onOpenAchievements,
  onOpenSettings,
  onOpenClass,
}) => {
  const { displayName, totalPoints, avatarUri, isLinkedAccount, gradeChipText } = useMemo(() => {
    const {
      firstName,
      lastName,
      username,
      totalPoints: profilePoints,
      grade,
    } = profile;
    const fullName = [firstName, lastName]
      .filter(part => typeof part === 'string' && part.trim().length > 0)
      .join(' ');
    const computedDisplayName = fullName || username;
    const pictureUri = profile.profilePicture || profile.avatar;
    const linkedAccount = Boolean(profile?.linkedAccount || profile?.type === 'linked');
    const rawGradeValue = grade;
    const gradeString = rawGradeValue === null || typeof rawGradeValue === 'undefined'
      ? ''
      : String(rawGradeValue).trim();
    const normalizedGradeLabel = gradeString.length > 0
      && !['n/a', 'na', 'null', 'undefined', 'nan'].includes(gradeString.toLowerCase())
      ? gradeString.replace(
        /[a-z]+/gi,
        segment => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase(),
      )
      : null;
    const resolvedGradeLabel = (() => {
      if (!normalizedGradeLabel) return null;
      const lower = normalizedGradeLabel.toLowerCase();
      if (lower.startsWith('grade ')) return normalizedGradeLabel;
      if (/^\d/.test(normalizedGradeLabel)) return `Grade ${normalizedGradeLabel}`;
      if (lower === '2b') return 'Grade 2B';
      return normalizedGradeLabel;
    })();
    return {
      displayName: computedDisplayName,
      totalPoints: profilePoints ?? 0,
      avatarUri: pictureUri,
      isLinkedAccount: linkedAccount,
      gradeChipText: resolvedGradeLabel,
    };
  }, [profile]);

  const canPressAvatar = typeof onAvatarPress === 'function';
  const showPointsButton = typeof onOpenAchievements === 'function';
  const showSettingsButton = typeof onOpenSettings === 'function';
  const canOpenClass = typeof onOpenClass === 'function' && isLinkedAccount;

  return (
    <View style={styles.topBar}>
      <View style={styles.row}>
        <View style={styles.sideColumnLeft}>
          {gradeChipText ? (
            <Chip
              text={gradeChipText}
              icon="school-outline"
              color={themeVariables.whiteColor}
              bg="rgba(255, 255, 255, 0.18)"
              iconSize={18}
              style={styles.gradeChip}
              textStyle={styles.gradeChipText}
              onPress={canOpenClass ? onOpenClass : undefined}
              accessibilityLabel={
                canOpenClass ? `View classes for ${gradeChipText}` : gradeChipText
              }
            />
          ) : null}
        </View>
        <View style={styles.sideColumnRight}>
          {showPointsButton ? (
            <TouchableOpacity
              style={styles.pointsButton}
              onPress={onOpenAchievements}
              accessibilityRole="button"
              accessibilityLabel="View achievements"
              activeOpacity={0.75}
            >
              <Ionicons
                name="star-outline"
                size={20}
                color={themeVariables.whiteColor}
                style={styles.pointsIcon}
              />
              <Text style={styles.pointsText}>{totalPoints}</Text>
            </TouchableOpacity>
          ) : null}
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
        <View pointerEvents="box-none" style={styles.centerOverlay}>
          <TouchableOpacity
            style={[
              styles.avatarWrapper,
              isLinkedAccount && styles.avatarWrapperLinked,
            ]}
            onPress={canPressAvatar ? onAvatarPress : undefined}
            accessibilityRole={canPressAvatar ? 'button' : undefined}
            accessibilityLabel={canPressAvatar ? 'Open profile options' : undefined}
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
          </TouchableOpacity>
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
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: AVATAR_SIZE,
    width: '100%',
    position: 'relative',
  },
  sideColumnLeft: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingRight: 12,
  },
  sideColumnRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    columnGap: 12,
  },
  centerOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 24,
    padding: 10,
  },
  pointsIcon: {
    marginRight: 8,
  },
  pointsText: {
    color: themeVariables.whiteColor,
    fontSize: 16,
    fontWeight: '600',
  },
  gradeChip: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 24,
    minHeight: 40,
  },
  gradeChipText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
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
    overflow: 'hidden',
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
  settingsButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 20,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default HomeTopBar;
