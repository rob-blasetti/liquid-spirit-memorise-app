import React, { useMemo } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';
import Avatar from '@liquidspirit/react-native-boring-avatars';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Button as StyleguideButton } from 'liquid-spirit-styleguide';
import { BlurView } from '@react-native-community/blur';
import themeVariables from '../styles/theme';

const AVATAR_SIZE = 96;

const ProfileModal = ({
  visible,
  profile,
  onClose,
  onOpenSwitcher,
  switcherAvailable,
  onAvatarPress,
}) => {
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

  const canChangeAvatar = typeof onAvatarPress === 'function';

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
            <TouchableOpacity
              style={styles.avatarWrapper}
              onPress={onAvatarPress}
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
            </TouchableOpacity>
            <Text style={styles.nameText} numberOfLines={1}>
              {displayName}
            </Text>
            <StyleguideButton
              label="Switch Profile"
              onPress={onOpenSwitcher}
              primary
              size="large"
              disabled={!switcherAvailable}
              style={styles.switchButton}
              textStyle={styles.switchButtonText}
            />
            {!switcherAvailable ? (
              <Text style={styles.helperText}>
                Add another profile to enable switching.
              </Text>
            ) : null}
          </View>
        </View>
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
    overflow: 'hidden',
    marginBottom: 16,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  nameText: {
    fontSize: 22,
    fontWeight: '700',
    color: themeVariables.whiteColor,
    marginBottom: 24,
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
  helperText: {
    marginTop: 12,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.75)',
    textAlign: 'center',
  },
});

export default ProfileModal;
