import React from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList, Pressable, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FastImage from 'react-native-fast-image';
import Avatar from '@liquidspirit/react-native-boring-avatars';
import { BlurView } from '@react-native-community/blur';
import themeVariables from '../stylesheets/theme';
import { fetchUserAchievements } from '../../services/achievementsService';
import { achievements as defaultAchievements } from '../../utils/data/core/achievements';
import { buildProfileFromUser } from '../../services/profileUtils';

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
  const activeAvatarUri = profile?.profilePicture || profile?.avatar;
  const activeDisplayName = (() => {
    if (!profile || typeof profile !== 'object') return 'Current Profile';
    const parts = [profile.firstName, profile.lastName]
      .filter(part => typeof part === 'string' && part.trim().length > 0);
    if (parts.length > 0) {
      return parts.join(' ');
    }
    if (profile.username && profile.username.trim().length > 0) {
      return profile.username.trim();
    }
    if (profile.name && profile.name.trim().length > 0) {
      return profile.name.trim();
    }
    return 'Current Profile';
  })();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={() => setProfileSwitcherVisible(false)}
    >
      <View style={modalStyles.modalOverlay}>
        <Pressable
          style={modalStyles.backdrop}
          onPress={() => setProfileSwitcherVisible(false)}
        />
        <View style={modalStyles.modalContent}>
          <BlurView
            style={modalStyles.modalBlur}
            blurType="light"
            blurAmount={24}
            reducedTransparencyFallbackColor="rgba(20, 18, 46, 0.92)"
          />
          <TouchableOpacity
            style={modalStyles.closeButton}
            onPress={() => setProfileSwitcherVisible(false)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={22} color={themeVariables.whiteColor} />
          </TouchableOpacity>
          <View style={modalStyles.modalInner}>
            <View style={modalStyles.activeProfileRow}>
              {activeAvatarUri ? (
                <FastImage
                  source={{
                    uri: activeAvatarUri,
                    priority: FastImage.priority.normal,
                    cache: FastImage.cacheControl.immutable,
                  }}
                  style={modalStyles.activeAvatar}
                  resizeMode={FastImage.resizeMode.cover}
                />
              ) : (
                <View style={modalStyles.activeAvatar}>
                  <Avatar size={56} name={activeDisplayName} variant="beam" />
                </View>
              )}
              <Text style={modalStyles.activeName} numberOfLines={1}>
                {activeDisplayName}
              </Text>
            </View>
            <Text style={modalStyles.modalTitle}>Switch Profile</Text>

            {guestProfile ? (
              <>
                <TouchableOpacity
                  style={[
                    modalStyles.profileOption,
                    profile?.guest && modalStyles.profileOptionDisabled,
                  ]}
                  onPress={async () => {
                    if (profile?.guest) return;
                    const gp = guestProfile;
                    const guestAch = gp.achievements || defaultAchievements;
                    const guestPoints =
                      gp.totalPoints != null ? gp.totalPoints : gp.score || 0;
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
                      style={modalStyles.profileAvatar}
                      resizeMode={FastImage.resizeMode.cover}
                    />
                  ) : (
                    <View style={modalStyles.profileAvatar}>
                      <Avatar
                        size={44}
                        name={guestProfile.name || guestProfile.username || 'Guest'}
                        variant="beam"
                      />
                    </View>
                  )}
                  <Text
                    style={[
                      modalStyles.profileLabel,
                      profile?.guest && modalStyles.profileLabelDisabled,
                    ]}
                  >
                    {(guestProfile.name || guestProfile.username || 'Guest')} (Guest)
                    {profile?.guest ? ' (Active)' : ''}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={modalStyles.deleteButton}
                  onPress={deleteGuestAccount}
                >
                  <Text style={modalStyles.deleteButtonText}>Delete Guest Account</Text>
                </TouchableOpacity>
                <View style={modalStyles.sectionDivider} />
              </>
            ) : null}

            {registeredProfile
              ? (() => {
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
                    <>
                      <TouchableOpacity
                        style={[
                          modalStyles.profileOption,
                          isActiveRegistered && modalStyles.profileOptionDisabled,
                        ]}
                        onPress={async () => {
                          if (isActiveRegistered) return;
                          let regPoints =
                            registeredDerived.totalPoints != null
                              ? registeredDerived.totalPoints
                              : rp.score || 0;
                          let regAchievements =
                            Array.isArray(rp.achievements) && rp.achievements.length
                              ? rp.achievements
                              : defaultAchievements;
                          try {
                            const {
                              achievements: serverAchievements = [],
                              totalPoints,
                            } = await fetchUserAchievements(
                              rp._id || rp.id || rp.nuriUserId,
                            );
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
                          const normalizedRegistered = buildProfileFromUser(
                            baseRegistered,
                            {
                              authType: 'ls-login',
                              childList,
                              profileKind: 'parent',
                            },
                          );
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
                            style={modalStyles.profileAvatar}
                            resizeMode={FastImage.resizeMode.cover}
                          />
                        ) : (
                          <View style={modalStyles.profileAvatar}>
                            <Avatar size={44} name={displayName} variant="beam" />
                          </View>
                        )}
                        <Text
                          style={[
                            modalStyles.profileLabel,
                            isActiveRegistered && modalStyles.profileLabelDisabled,
                          ]}
                        >
                          {displayName}
                          {isActiveRegistered ? ' (Active)' : ''}
                        </Text>
                      </TouchableOpacity>
                      <View style={modalStyles.sectionDivider} />
                    </>
                  );
                })()
              : null}

            <FlatList
              data={childEntries}
              style={modalStyles.listWrapper}
              contentContainerStyle={modalStyles.listContent}
              showsVerticalScrollIndicator={false}
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
                const displayName =
                  derivedChild.name || childObj.name || childObj.username || 'Learner';
                const avatarUri =
                  childObj.profilePicture ||
                  childObj.avatar ||
                  derivedChild.profilePicture;
                const initialPoints =
                  derivedChild.totalPoints != null ? derivedChild.totalPoints : childObj.score || 0;
                const isActiveChild =
                  resolveProfileId(profile) === resolveProfileId(childObj) && !profile?.guest;

                return (
                  <TouchableOpacity
                    style={[
                      modalStyles.profileOption,
                      isActiveChild && modalStyles.profileOptionDisabled,
                    ]}
                    onPress={async () => {
                      if (isActiveChild) return;
                      let freshPoints = initialPoints;
                      let freshAchievements =
                        Array.isArray(childObj.achievements) && childObj.achievements.length
                          ? childObj.achievements
                          : defaultAchievements;
                      try {
                        const {
                          achievements: serverAchievements = [],
                          totalPoints,
                        } = await fetchUserAchievements(
                          childObj._id || childObj.id || childObj.nuriUserId,
                        );
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
                        style={modalStyles.profileAvatar}
                        resizeMode={FastImage.resizeMode.cover}
                      />
                    ) : (
                      <View style={modalStyles.profileAvatar}>
                        <Avatar size={44} name={displayName} variant="beam" />
                      </View>
                    )}
                    <Text
                      style={[
                        modalStyles.profileLabel,
                        isActiveChild && modalStyles.profileLabelDisabled,
                      ]}
                    >
                      {displayName}
                      {isActiveChild ? ' (Active)' : ''}
                    </Text>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                childEntries.length ? null : (
                  <Text style={modalStyles.emptyText}>
                    No additional learner profiles yet.
                  </Text>
                )
              }
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const modalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
    paddingTop: 48,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    width: '100%',
    borderTopLeftRadius: themeVariables.borderRadiusPill,
    borderTopRightRadius: themeVariables.borderRadiusPill,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    backgroundColor: 'rgba(20, 18, 46, 0.92)',
    overflow: 'hidden',
    position: 'relative',
    paddingBottom: 24,
    maxHeight: '82%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 12,
  },
  modalBlur: {
    ...StyleSheet.absoluteFillObject,
  },
  closeButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: 16,
    padding: 8,
    zIndex: 2,
  },
  modalInner: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 8,
  },
  activeProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  activeAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeName: {
    flexShrink: 1,
    fontSize: 20,
    fontWeight: '700',
    color: themeVariables.whiteColor,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: themeVariables.whiteColor,
    textAlign: 'center',
    marginBottom: 20,
  },
  profileOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    marginBottom: 12,
  },
  profileOptionDisabled: {
    opacity: 0.5,
  },
  profileAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    marginRight: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: themeVariables.whiteColor,
  },
  profileLabelDisabled: {
    color: 'rgba(255, 255, 255, 0.65)',
  },
  deleteButton: {
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    marginTop: 4,
    marginBottom: 12,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: themeVariables.redColor,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    marginVertical: 12,
  },
  listWrapper: {
    maxHeight: 280,
  },
  listContent: {
    paddingBottom: 4,
    paddingTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    paddingVertical: 16,
  },
});

export default ProfileSwitcherModal;
