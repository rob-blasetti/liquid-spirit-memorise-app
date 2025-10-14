import React, { useMemo } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';
import Avatar from '@liquidspirit/react-native-boring-avatars';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Button as StyleguideButton } from 'liquid-spirit-styleguide';
import themeVariables from '../styles/theme';

const AVATAR_SIZE = 96;

const ProfileModal = ({
  visible,
  profile,
  onClose,
  onOpenSwitcher,
  switcherAvailable,
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

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={22} color={themeVariables.blackColor} />
          </TouchableOpacity>
          <View style={styles.avatarWrapper}>
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
          </View>
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
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: themeVariables.whiteColor,
    borderRadius: 28,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
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
    color: themeVariables.blackColor,
    marginBottom: 24,
  },
  switchButton: {
    alignSelf: 'stretch',
  },
  switchButtonText: {
    fontWeight: '700',
  },
  helperText: {
    marginTop: 12,
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
  },
});

export default ProfileModal;
