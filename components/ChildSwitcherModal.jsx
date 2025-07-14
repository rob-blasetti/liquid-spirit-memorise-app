import React from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList, Image } from 'react-native';
import Avatar from '@flipxyz/react-native-boring-avatars';
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
}) => (
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
              {guestProfile.avatar ? (
                <Image source={{ uri: guestProfile.avatar }} style={styles.childAvatar} />
              ) : (
                <Avatar size={40} name={guestProfile.name} variant="beam" />
              )}
              <Text style={styles.childText}>
                {guestProfile.name} (Guest){profile && profile.guest ? ' (Active)' : ''}
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
          const displayName = rp.name && rp.name.trim() ? rp.name : rp.username || '';
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
              {rp.avatar ? (
                <Image source={{ uri: rp.avatar }} style={styles.childAvatar} />
              ) : (
                <Avatar size={40} name={displayName} variant="beam" />
              )}
              <Text style={styles.childText}>
                {displayName}{profile && profile._id === rp._id ? ' (Active)' : ''}
              </Text>
            </TouchableOpacity>
          );
        })()}
        <FlatList
          data={children}
          keyExtractor={item => {
            const childObj = item.child || item;
            return childObj._id;
          }}
          renderItem={({ item }) => {
            const entry = item.child ? item : { child: item, classes: [] };
            const childObj = entry.child;
            const fullName = childObj.firstName && childObj.firstName.trim()
              ? `${childObj.firstName} ${childObj.lastName || ''}`.trim()
              : (childObj.username || childObj.name || '');
            const gradeNum = typeof childObj.grade === 'string'
              ? parseInt(childObj.grade, 10)
              : childObj.grade;
            const selected = { ...childObj, name: fullName, grade: gradeNum };
            return (
              <TouchableOpacity
                style={styles.childButton}
                onPress={() => {
                  const childAchievements = selected.achievements || defaultAchievements;
                  const childScore = selected.score || 0;
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
                {childObj.avatar
                  ? <Image source={{ uri: childObj.avatar }} style={styles.childAvatar} />
                  : <Avatar size={40} name={fullName} variant="beam" />}
                <Text style={styles.childText}>
                  {fullName}{profile && !profile.guest && profile._id === childObj._id ? ' (Active)' : ''}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </View>
  </Modal>
);

export default ChildSwitcherModal;
