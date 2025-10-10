import React from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList, Pressable, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FastImage from 'react-native-fast-image';
import Avatar from '@liquidspirit/react-native-boring-avatars';
import styles from '../styles/mainAppStyles';
import { fetchUserAchievements } from '../services/achievementsService';
import { achievements as defaultAchievements } from '../data/achievements';
import { buildProfileFromUser } from '../services/profileUtils';

const ProfileSwitcherModal = ({
  visible,
  registeredProfile,
  guestProfile,
  profile,
  children,
  saveProfile,
  setUser,
  setProfileSwitcherVisible,
  deleteGuestAccount,
}) => {
  const resolveProfileId = (entity) => {
    if (!entity || typeof entity !== 'object') return null;
    const id = entity._id ?? entity.id ?? entity.nuriUserId ?? null;
    return id != null ? String(id) : null;
  };

  const childEntries = Array.isArray(children) ? children : [];

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setProfileSwitcherVisible(false)} />
        <View style={styles.modalContent}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setProfileSwitcherVisible(false)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Switch Profile</Text>

          {guestProfile && (
            <>
              <TouchableOpacity
                style={[
                  styles.childButton,
                  profile?.guest && localStyles.disabledButton,
                ]}
                onPress={async () => {
                  if (profile?.guest) return;
                  const gp = guestProfile;
                  const guestAch = gp.achievements || defaultAchievements;
                  const guestPoints = gp.totalPoints != null ? gp.totalPoints : (gp.score || 0);
                  const baseGuest = {
                    ...gp,
                    guest: true,
                    achievements: guestAch,
                    totalPoints: guestPoints,
                  };
                  const normalizedGuest = buildProfileFromUser(baseGuest, {
                    authType: 'guest-login',
                    profileKind: 'guest',
                  });
                  const finalGuest = {
                    ...gp,
                    ...normalizedGuest,
                    guest: true,
                    achievements: guestAch,
                    totalPoints: guestPoints,
                    accountType: 'guest',
                  };
                  await saveProfile(finalGuest);
                  setUser(finalGuest);
                  setProfileSwitcherVisible(false);
                }}
                disabled={Boolean(profile?.guest)}
              >
                {guestProfile.profilePicture || guestProfile.avatar ? (
                  <FastImage
                    source={{
                      uri: guestProfile.profilePicture || guestProfile.avatar,
                      priority: FastImage.priority.normal,
                      cache: FastImage.cacheControl.immutable,
                    }}
                    style={styles.childAvatar}
                    resizeMode={FastImage.resizeMode.cover}
                  />
                ) : (
                  <Avatar size={40} name={(guestProfile.name || guestProfile.username || 'Guest')} variant="beam" />
                )}
                <Text
                  style={[
                    styles.childText,
                    profile?.guest && localStyles.disabledText,
                  ]}
                >
                  {(guestProfile.name || guestProfile.username || 'Guest')} (Guest)
                  {profile?.guest ? ' (Active)' : ''}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.deleteButton} onPress={deleteGuestAccount}>
                <Text style={styles.deleteButtonText}>Delete Guest Account</Text>
              </TouchableOpacity>
              <View style={styles.divider} />
            </>
          )}

          {registeredProfile && (() => {
            const rp = registeredProfile;
            const childList = Array.isArray(children) ? children : [];
            const registeredDerived = buildProfileFromUser(rp, {
              authType: 'ls-login',
              childList,
              profileKind: 'parent',
            });
            const displayName = registeredDerived.name;
            const isActiveRegistered =
              resolveProfileId(profile) === resolveProfileId(rp);
            return (
              <TouchableOpacity
                style={[
                  styles.childButton,
                  isActiveRegistered && localStyles.disabledButton,
                ]}
                onPress={async () => {
                  if (isActiveRegistered) return;
                  let regPoints = registeredDerived.totalPoints != null ? registeredDerived.totalPoints : (rp.score || 0);
                  let regAchievements = Array.isArray(rp.achievements) && rp.achievements.length
                    ? rp.achievements
                    : defaultAchievements;
                  try {
                    const {
                      achievements: serverAchievements = [],
                      totalPoints,
                    } = await fetchUserAchievements(rp._id || rp.id || rp.nuriUserId);
                    if (Array.isArray(serverAchievements) && serverAchievements.length) {
                      regAchievements = serverAchievements;
                    }
                    if (typeof totalPoints === 'number') regPoints = totalPoints;
                  } catch {}
                  const baseRegistered = {
                    ...rp,
                    guest: false,
                    achievements: regAchievements,
                    totalPoints: regPoints,
                  };
                  const normalizedRegistered = buildProfileFromUser(baseRegistered, {
                    authType: 'ls-login',
                    childList,
                    profileKind: 'parent',
                  });
                  const finalRegistered = {
                    ...rp,
                    ...normalizedRegistered,
                    guest: false,
                    achievements: regAchievements,
                    totalPoints: regPoints,
                    accountType: 'parent',
                  };
                  await saveProfile(finalRegistered);
                  setUser(finalRegistered);
                  setProfileSwitcherVisible(false);
                }}
                disabled={isActiveRegistered}
              >
                {rp.profilePicture || rp.avatar ? (
                  <FastImage
                    source={{
                      uri: rp.profilePicture || rp.avatar,
                      priority: FastImage.priority.normal,
                      cache: FastImage.cacheControl.immutable,
                    }}
                    style={styles.childAvatar}
                    resizeMode={FastImage.resizeMode.cover}
                  />
                ) : (
                  <Avatar size={40} name={displayName} variant="beam" />
                )}
                <Text
                  style={[
                    styles.childText,
                    isActiveRegistered && localStyles.disabledText,
                  ]}
                >
                  {displayName}
                  {isActiveRegistered ? ' (Active)' : ''}
                </Text>
              </TouchableOpacity>
            );
          })()}

          <FlatList
            data={childEntries}
            keyExtractor={(item, index) => {
              const childObj = item.child || item;
              const childId = resolveProfileId(childObj);
              return childId ? String(childId) : String(index);
            }}
            renderItem={({ item }) => {
              const childObj = item.child || item;
              const childList = Array.isArray(children) ? children : [];
              const derivedChild = buildProfileFromUser(childObj, {
                authType: 'ls-login',
                childList,
                profileKind: 'child',
              });
              const displayName = derivedChild.name || childObj.name || childObj.username || 'Learner';
              const avatarUri = childObj.profilePicture || childObj.avatar || derivedChild.profilePicture;
              const initialPoints = derivedChild.totalPoints != null
                ? derivedChild.totalPoints
                : (childObj.score || 0);
              const isActiveChild =
                resolveProfileId(profile) === resolveProfileId(childObj) && !profile?.guest;

              return (
                <TouchableOpacity
                  style={[
                    styles.childButton,
                    isActiveChild && localStyles.disabledButton,
                  ]}
                  onPress={async () => {
                    if (isActiveChild) return;
                    let freshPoints = initialPoints;
                    let freshAchievements = Array.isArray(childObj.achievements) && childObj.achievements.length
                      ? childObj.achievements
                      : defaultAchievements;
                    try {
                      const {
                        achievements: serverAchievements = [],
                        totalPoints,
                      } = await fetchUserAchievements(childObj._id || childObj.id || childObj.nuriUserId);
                      if (Array.isArray(serverAchievements) && serverAchievements.length) {
                        freshAchievements = serverAchievements;
                      }
                      if (typeof totalPoints === 'number') freshPoints = totalPoints;
                    } catch {}
                    const baseChild = {
                      ...childObj,
                      guest: false,
                      achievements: freshAchievements,
                      totalPoints: freshPoints,
                    };
                    const normalizedChild = buildProfileFromUser(baseChild, {
                      authType: 'ls-login',
                      childList,
                      profileKind: 'child',
                    });
                    const finalChild = {
                      ...childObj,
                      ...normalizedChild,
                      guest: false,
                      achievements: freshAchievements,
                      totalPoints: freshPoints,
                      accountType: 'child',
                    };
                    await saveProfile(finalChild);
                    setUser(finalChild);
                    setProfileSwitcherVisible(false);
                  }}
                  disabled={isActiveChild}
                >
                  {avatarUri ? (
                    <FastImage
                      source={{
                        uri: avatarUri,
                        priority: FastImage.priority.normal,
                        cache: FastImage.cacheControl.immutable,
                      }}
                      style={styles.childAvatar}
                      resizeMode={FastImage.resizeMode.cover}
                    />
                  ) : (
                    <Avatar size={40} name={displayName} variant="beam" />
                  )}
                  <Text
                    style={[
                      styles.childText,
                      isActiveChild && localStyles.disabledText,
                    ]}
                  >
                    {displayName}
                    {isActiveChild ? ' (Active)' : ''}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
};

const localStyles = StyleSheet.create({
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    color: '#888',
  },
});

export default ProfileSwitcherModal;
