import React from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList } from 'react-native';
import FastImage from 'react-native-fast-image';
import Avatar from '@liquidspirit/react-native-boring-avatars';
import styles from '../styles/mainAppStyles';
import { achievements as defaultAchievements } from '../data/achievements';

const ChildSwitcherModal = ({
  visible,
  registeredProfile,
  guestProfile,
  profile,
  children,
  setAchievements,
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
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Change Account</Text>

          {guestProfile && (
            <>
              <TouchableOpacity
                style={styles.childButton}
                onPress={() => {
                  const gp = guestProfile;
                  const guestAch = gp.achievements || defaultAchievements;
                  const guestScore = gp.score || 0;
                  setAchievements(guestAch);
                  saveProfile({
                    ...gp,
                    guest: true,
                    achievements: guestAch,
                    score: guestScore,
                  });
                  setUser({
                    ...gp,
                    achievements: guestAch,
                    score: guestScore,
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
            const displayName = rp.name?.trim() ? rp.name : rp.username || '';
            const regAch = rp.achievements || defaultAchievements;
            const regScore = rp.score || 0;
            return (
              <TouchableOpacity
                style={styles.childButton}
                onPress={() => {
                  setAchievements(regAch);
                  saveProfile(rp);
                  setUser({
                    ...rp,
                    achievements: regAch,
                    score: regScore,
                  });
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
              const gradeNum = typeof childObj.grade === 'string'
                ? parseInt(childObj.grade, 10)
                : childObj.grade;
              const selected = { ...childObj, name: fullName, grade: gradeNum };
              const childAchievements = selected.achievements || defaultAchievements;
              const childScore = selected.score || 0;
              return (
                <TouchableOpacity
                  style={styles.childButton}
                  onPress={() => {
                    setAchievements(childAchievements);
                    saveProfile({
                      ...selected,
                      guest: false,
                      achievements: childAchievements,
                      score: childScore,
                    });
                    setUser({
                      ...selected,
                      achievements: childAchievements,
                      score: childScore,
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
