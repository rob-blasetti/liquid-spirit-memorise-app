import React, { useCallback, useMemo } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import FastImage from 'react-native-fast-image';
import Avatar from '@liquidspirit/react-native-boring-avatars';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Button as StyleguideButton } from 'liquid-spirit-styleguide';
import { BlurView } from '@react-native-community/blur';
import themeVariables from '../stylesheets/theme';
import useParentalGate from '../../hooks/useParentalGate';
import LSLinkedLogo from '../../assets/img/LS_Linked_Logo.png';

const AVATAR_SIZE = 96;

const ProfileModal = ({
  visible,
  profile,
  onClose,
  onOpenSwitcher,
  switcherAvailable,
  onAvatarPress,
}) => {
  const { requestPermission: requestParentalPermission, ParentalGate } = useParentalGate();
  const { displayName, avatarUri } = useMemo(() => {
    if (!profile || typeof profile !== 'object') {
      return {
        displayName: 'Your Profile',
        avatarUri: null,
      };
    }
    const parts = [profile.firstName, profile.lastName].filter(
      part => typeof part === 'string' && part.trim().length > 0,
    );
    const fallback = profile.username || profile.name || 'Your Profile';
    const computedDisplayName = parts.length > 0 ? parts.join(' ') : fallback;
    const uri = profile.profilePicture || profile.avatar || null;
    return {
      displayName: computedDisplayName,
      avatarUri: uri,
    };
  }, [profile]);

  const gradeLabel = useMemo(() => {
    if (!profile || typeof profile !== 'object') return null;
    const rawGrade = profile.grade;
    if (rawGrade === null || typeof rawGrade === 'undefined') return null;
    const gradeString = String(rawGrade).trim();
    if (gradeString.length === 0) return null;
    const lowered = gradeString.toLowerCase();
    if (['n/a', 'na', 'null', 'undefined', 'nan'].includes(lowered)) return null;
    const formatted = gradeString.replace(
      /[a-z]+/gi,
      segment => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase(),
    );
    if (lowered === '2b') return 'Grade 2B';
    if (/^\d/.test(gradeString)) return `Grade ${gradeString}`;
    if (formatted.toLowerCase().startsWith('grade ')) return formatted;
    return formatted;
  }, [profile]);

  const totalPoints = useMemo(() => {
    if (!profile || typeof profile !== 'object') return null;
    const { totalPoints: rawPoints } = profile;
    if (typeof rawPoints === 'number') return rawPoints;
    if (typeof rawPoints === 'string') {
      const parsed = Number(rawPoints);
      if (!Number.isNaN(parsed)) return parsed;
    }
    return null;
  }, [profile]);

  const accountMeta = useMemo(() => {
    if (!profile || typeof profile !== 'object') return null;
    if (profile.guest || profile.accountType === 'guest') {
      return {
        key: 'account-guest',
        icon: 'person-outline',
        text: 'Guest account',
      };
    }
    const linked = Boolean(profile.linkedAccount || profile.type === 'linked');
    if (linked) {
      return {
        key: 'account-linked',
        icon: null,
        image: LSLinkedLogo,
        text: 'LS Linked',
      };
    }
    return {
      key: 'account-unlinked',
      icon: 'unlink-outline',
      text: 'Unlinked account',
    };
  }, [profile]);

  const metaItems = useMemo(() => {
    const items = [];
    if (gradeLabel) {
      items.push({
        key: 'grade',
        icon: 'school-outline',
        text: gradeLabel,
      });
    }
    if (totalPoints !== null) {
      items.push({
        key: 'points',
        icon: 'star-outline',
        text: `${totalPoints} pts`,
      });
    }
    if (accountMeta) {
      items.push(accountMeta);
    }
    return items;
  }, [gradeLabel, totalPoints, accountMeta]);

  const hasMetaInfo = metaItems.length > 0;

  const canChangeAvatar = typeof onAvatarPress === 'function';

  const handleAvatarPress = useCallback(async () => {
    if (!canChangeAvatar) return;
    const approved = await requestParentalPermission();
    if (!approved) return;
    onAvatarPress?.();
  }, [canChangeAvatar, onAvatarPress, requestParentalPermission]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <BlurView
            style={styles.modalBlur}
            blurType="light"
            blurAmount={24}
            reducedTransparencyFallbackColor="rgba(20, 18, 46, 0.92)"
          />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={22} color={themeVariables.whiteColor} />
          </TouchableOpacity>
          <View style={styles.modalInner}>
            <Text style={styles.titleText}>Profile</Text>
            <TouchableOpacity
              style={styles.avatarWrapper}
              onPress={handleAvatarPress}
              disabled={!canChangeAvatar}
              activeOpacity={0.7}
              accessibilityRole={canChangeAvatar ? 'button' : undefined}
              accessibilityLabel={canChangeAvatar ? 'Change profile picture' : undefined}
              accessibilityState={canChangeAvatar ? undefined : { disabled: true }}
            >
              {avatarUri ? (
                <FastImage
                  source={{
                    uri: avatarUri,
                    priority: FastImage.priority.high,
                    cache: FastImage.cacheControl.immutable,
                  }}
                  style={styles.avatar}
                  resizeMode={FastImage.resizeMode.cover}
                />
              ) : (
                <Avatar size={AVATAR_SIZE} name={displayName} variant="beam" />
              )}
              {canChangeAvatar ? (
                <View style={styles.avatarBadge} pointerEvents="none">
                  <Ionicons name="camera" size={18} color={themeVariables.whiteColor} />
                </View>
              ) : null}
            </TouchableOpacity>
            <Text style={[styles.nameText, !hasMetaInfo && styles.nameTextSpaced]} numberOfLines={1}>
              {displayName}
            </Text>
            {hasMetaInfo ? (
              <View style={styles.metaRow}>
                {metaItems.map(item => (
                  <View key={item.key} style={styles.metaItem}>
                    {item.image ? (
                      <Image source={item.image} style={styles.metaIconImage} resizeMode="contain" />
                    ) : (
                      <Ionicons
                        name={item.icon}
                        size={14}
                        color={themeVariables.primaryColor}
                        style={styles.metaIcon}
                      />
                    )}
                    <Text style={styles.metaText}>{item.text}</Text>
                  </View>
                ))}
              </View>
            ) : null}
            {switcherAvailable ? (
              <StyleguideButton
                label="Switch Profile"
                onPress={onOpenSwitcher}
                primary
                size="large"
                style={styles.switchButton}
                textStyle={styles.switchButtonText}
              />
            ) : null}
          </View>
        </View>
        {ParentalGate}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 380,
    borderRadius: themeVariables.borderRadiusPill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    backgroundColor: 'rgba(20, 18, 46, 0.92)',
    overflow: 'hidden',
    position: 'relative',
  },
  modalBlur: {
    ...StyleSheet.absoluteFillObject,
  },
  modalInner: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: 16,
    padding: 8,
  },
  avatarWrapper: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    overflow: 'visible',
    marginBottom: 16,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: AVATAR_SIZE / 2,
    zIndex: 1,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    zIndex: 2,
    elevation: 10,
  },
  nameText: {
    fontSize: 22,
    fontWeight: '700',
    color: themeVariables.whiteColor,
  },
  nameTextSpaced: {
    marginBottom: 24,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themeVariables.whiteColor,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 6,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: themeVariables.primaryColor,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  metaIcon: {
    marginRight: 6,
  },
  metaIconImage: {
    width: 16,
    height: 16,
    marginRight: 6,
  },
  metaText: {
    fontSize: 14,
    fontWeight: '600',
    color: themeVariables.primaryColor,
  },
  switchButton: {
    alignSelf: 'stretch',
    marginBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  switchButtonText: {
    fontWeight: '700',
    color: themeVariables.whiteColor,
  },
});

export default ProfileModal;
