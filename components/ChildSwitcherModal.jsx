import React from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList, Pressable, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FastImage from 'react-native-fast-image';
import Avatar from '@liquidspirit/react-native-boring-avatars';
import styles from '../styles/mainAppStyles';
import { fetchUserAchievements } from '../services/achievementsService';
import { achievements as defaultAchievements } from '../data/achievements';

const ChildSwitcherModal = ({
  visible,
  registeredProfile,
  guestProfile,
  profile,
  children,
  saveProfile,
  setUser,
  setChooseChildVisible,
  deleteGuestAccount,
}) => {
  const activeId = registeredProfile?._id || guestProfile?._id;
  const filteredChildren = Array.isArray(children)
    ? children.filter(item => {
        const childObj = item.child || item;
        return childObj._id !== activeId;
      })
    : [];

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setChooseChildVisible(false)} />
        <View style={styles.modalContent}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setChooseChildVisible(false)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Change Account</Text>

          {guestProfile && (
            <>
              <TouchableOpacity
                style={styles.childButton}
                onPress={async () => {
                  const gp = guestProfile;
                  const guestAch = gp.achievements || defaultAchievements;
              // Determine totalPoints for guest (fallback to score for legacy data)
              let guestPoints = gp.totalPoints != null ? gp.totalPoints : (gp.score || 0);
              // Guests may not have server points; keep fallback
              await saveProfile({
                ...gp,
                guest: true,
                achievements: guestAch,
                totalPoints: guestPoints,
              });
              setUser({
                ...gp,
                achievements: guestAch,
                totalPoints: guestPoints,
              });
                  setChooseChildVisible(false);
                }}
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
                  <Avatar size={40} name={guestProfile.name} variant="beam" />
                )}
                <Text style={styles.childText}>
                  {guestProfile.name} (Guest)
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
            // Derive display name: prefer firstName + lastName, then name, then username
            const displayName = rp.firstName?.trim()
              ? `${rp.firstName} ${rp.lastName || ''}`.trim()
              : rp.name?.trim()
                ? rp.name
                : rp.username || '';
            const regAch = rp.achievements || defaultAchievements;
            // Determine totalPoints for registered user (fallback to score for legacy data)
            const regPoints = rp.totalPoints != null ? rp.totalPoints : (rp.score || 0);
            return (
              <TouchableOpacity
                style={styles.childButton}
                onPress={async () => {
                  // Try to fetch fresh totals from server before switching
                  let regPoints = rp.totalPoints != null ? rp.totalPoints : (rp.score || 0);
                  try {
                    const { totalPoints } = await fetchUserAchievements(rp._id || rp.id || rp.nuriUserId);
                    if (typeof totalPoints === 'number') regPoints = totalPoints;
                  } catch {}
                  const updated = {
                    ...rp,
                    guest: false,
                    achievements: regAch,
                    totalPoints: regPoints,
                  };
                  await saveProfile(updated);
                  setUser(updated);
                  setChooseChildVisible(false);
                }}
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
                <Text style={styles.childText}>
                  {displayName}
                  {profile?._id === rp._id ? ' (Active)' : ''}
                </Text>
              </TouchableOpacity>
            );
          })()}

          <FlatList
            data={filteredChildren}
            keyExtractor={item => (item.child || item)._id}
            renderItem={({ item }) => {
              const childObj = item.child || item;
              const fullName = childObj.firstName?.trim()
                ? `${childObj.firstName} ${childObj.lastName || ''}`.trim()
                : childObj.username || childObj.name || '';
              // Preserve original grade value (e.g., '2b') or numeric grade
              const selected = { ...childObj, name: fullName, grade: childObj.grade };
              const childAchievements = selected.achievements || defaultAchievements;
              // Determine totalPoints for child (fallback to score for legacy data)
              const childPoints = selected.totalPoints != null ? selected.totalPoints : (selected.score || 0);
              return (
                <TouchableOpacity
                  style={styles.childButton}
                  onPress={async () => {
                    // Try to fetch fresh totals from server before switching
                    let freshPoints = childPoints;
                    try {
                      const { totalPoints } = await fetchUserAchievements(selected._id || selected.id || selected.nuriUserId);
                      if (typeof totalPoints === 'number') freshPoints = totalPoints;
                    } catch {}
                    // Persist selected child profile with proper totalPoints
                    await saveProfile({
                      ...selected,
                      guest: false,
                      achievements: childAchievements,
                      totalPoints: freshPoints,
                    });
                    setUser({
                      ...selected,
                      achievements: childAchievements,
                      totalPoints: freshPoints,
                    });
                    setChooseChildVisible(false);
                  }}
                >
                  {selected.profilePicture || selected.avatar ? (
                    <FastImage
                      source={{
                        uri: selected.profilePicture || selected.avatar,
                        priority: FastImage.priority.normal,
                        cache: FastImage.cacheControl.immutable,
                      }}
                      style={styles.childAvatar}
                      resizeMode={FastImage.resizeMode.cover}
                    />
                  ) : (
                    <Avatar size={40} name={fullName} variant="beam" />
                  )}
                  <Text style={styles.childText}>
                    {fullName}
                    {profile?._id === selected._id && !profile?.guest ? ' (Active)' : ''}
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

export default ChildSwitcherModal;
