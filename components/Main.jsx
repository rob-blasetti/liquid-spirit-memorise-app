import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Image as RNImage,
  InteractionManager,
  Animated,
  StyleSheet,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useUser } from '../contexts/UserContext';
import { useDifficulty } from '../contexts/DifficultyContext';
import styles from '../styles/mainAppStyles';
import AuthNavigator from '../navigation/AuthNavigator';
import NotificationBanner from './NotificationBanner';
import ProfileSwitcherModal from './ProfileSwitcherModal';
import ProfileModal from './ProfileModal';
import ScreenRenderer, { renderLazy, SplashScreen } from './ScreenRenderer';
import ScreenBackground from './ScreenBackground';
import ComingSoonModal from './ComingSoonModal';
import FastImage from 'react-native-fast-image';
import { preloadImages, collectChildAndClassImageUris } from '../services/imageCache';
import useNavigationHandlers from '../hooks/useNavigationHandlers';
import useProfile from '../hooks/useProfile';
import useAchievements from '../hooks/useAchievements';
import useLessonProgress from '../hooks/useLessonProgress';
import { AchievementsProvider } from '../contexts/AchievementsContext';
import { createNavigationActions } from '../services/navigationService';
import { createAppActions } from '../services/appFlowService';
import { createAvatarActions } from '../services/avatarService';
import ScreenTransition from './ScreenTransition';
import { prefetchGames } from '../games/lazyGameRoutes';
import { gameIds } from '../games';
import {
  buildProfileFromUser,
  deriveAuthMetadata,
  normalizeChildEntries,
  resolveAuthType,
  resolveUserFromPayload,
} from '../services/profileUtils';
import { TEST_USER_EMAIL, getTestUserClassData } from '../data/testUserClassData';
import useHomeScreenTransition from '../hooks/useHomeScreenTransition';
import { deleteNuriUser } from '../services/authService';
import { clearCredentials } from '../services/credentialService';
import {
  markAppInteractive,
  markNavigationComplete,
} from '../services/performanceService';

const resolveProfileId = (entity) => {
  if (!entity || typeof entity !== 'object') return null;
  const id = entity._id ?? entity.id ?? entity.nuriUserId ?? null;
  return id != null ? String(id) : null;
};

const Main = () => {
  const {
    children,
    setUser,
    setUsers,
    setChildren,
    setFamily,
    setToken,
    user,
    token,
    storageLoaded,
    clearUserData,
  } = useUser();
  const { level } = useDifficulty();
  const {
    showSplash,
    profile,
    registeredProfile,
    guestProfile,
    setProfile,
    saveProfile,
    deleteGuestAccount,
    wipeProfile,
  } = useProfile();
  const { nav, goTo, visitedGrades, markGradeVisited } = useNavigationHandlers();
  const {
    displayNav,
    transitionState,
    transitionProgress,
    viewportWidth,
  } = useHomeScreenTransition(nav);
  const achievementsState = useAchievements(profile, saveProfile);
  const {
    achievements,
    notification,
    setNotification,
    awardAchievement,
    awardGameAchievement,
    refreshFromServer,
    recordGamePlay,
    recordLessonCompletion,
    recordDailyChallenge,
  } = achievementsState;
  // Pass profile to lesson progress hook to adjust defaults by grade
  const { completedLessons, overrideProgress, setOverrideProgress, completeLesson, getCurrentProgress } = useLessonProgress(profile, awardAchievement, recordLessonCompletion);
  const [profileSwitcherVisible, setProfileSwitcherVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [comingSoonGrade, setComingSoonGrade] = useState(null);

  const previousScreenRef = useRef(null);
  const pendingTransitionRef = useRef(null);
  const appInteractiveReportedRef = useRef(false);

  const profileSwitchEligible = useMemo(() => {
    if (!profile) return false;
    const activeProfileId = resolveProfileId(profile);
    const childEntries = Array.isArray(children) ? children : [];
    const hasSiblingOption = childEntries.some((entry) => {
      const childObj = entry?.child && typeof entry.child === 'object' ? entry.child : entry;
      const childId = resolveProfileId(childObj);
      return childId && childId !== activeProfileId;
    });
    const hasRegisteredOption = (() => {
      if (!registeredProfile) return false;
      const registeredId = resolveProfileId(registeredProfile);
      return registeredId && registeredId !== activeProfileId;
    })();
    const hasGuestOption = Boolean(guestProfile) && !profile?.guest;
    return hasRegisteredOption || hasSiblingOption || hasGuestOption;
  }, [profile, registeredProfile, guestProfile, children]);

  const avatarActions = useMemo(() => {
    if (!profile) return null;
    return createAvatarActions({ profile, setProfile, saveProfile });
  }, [profile, setProfile, saveProfile]);

  const navigationActions = useMemo(
    () =>
      createNavigationActions({
        goTo,
        nav,
        markGradeVisited,
        visitedGrades,
        awardAchievement,
      }),
    [goTo, nav, markGradeVisited, visitedGrades, awardAchievement],
  );

  const appActions = useMemo(
    () =>
      createAppActions({
        profile,
        goTo,
        nav,
        getCurrentProgress,
        awardAchievement,
        recordDailyChallenge,
      }),
    [profile, goTo, nav, getCurrentProgress, awardAchievement, recordDailyChallenge],
  );
  // Preload Pearlina image for Home screen into FastImage cache
  // Animate slide transitions when toggling between home and classes
  useEffect(() => {
    const asset = RNImage.resolveAssetSource(require('../assets/img/pearlina-pointing-right.png'));
    FastImage.preload([{ uri: asset.uri }]);
  }, []);

  // Warm the most common game modules after first paint to trim Suspense delays
  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      prefetchGames(['practice', ...gameIds.slice(0, 3)]);
    });
    return () => {
      if (task && typeof task.cancel === 'function') task.cancel();
    };
  }, []);

  // When player opens the games hub, preload the rest of the listed games in the background
  useEffect(() => {
    if (nav.screen !== 'games') return undefined;
    const task = InteractionManager.runAfterInteractions(() => {
      prefetchGames(gameIds);
    });
    return () => {
      if (task && typeof task.cancel === 'function') task.cancel();
    };
  }, [nav.screen]);

  // Warm cache with likely avatar + class images when child list or active profile changes
  useEffect(() => {
    const uris = new Set();
    const avatarUri = profile?.profilePicture || profile?.avatar;
    if (avatarUri) uris.add(avatarUri);
    const childUris = collectChildAndClassImageUris(children || []);
    childUris.forEach((uri) => {
      if (uri) {
        uris.add(uri);
      }
    });
    if (uris.size === 0) return;
    const primary = [];
    const secondary = [];
    uris.forEach((uri) => {
      if (!uri) return;
      if (uri === avatarUri) primary.push(uri);
      else secondary.push(uri);
    });
    if (primary.length) preloadImages(primary, { priority: 'normal' });
    if (secondary.length) preloadImages(secondary, { priority: 'low' });
  }, [children, profile?.profilePicture, profile?.avatar]);

  const setUsersRef = useRef(setUsers);
  const achievementsFetchRef = useRef(null);
  useEffect(() => {
    setUsersRef.current = setUsers;
  }, [setUsers]);

  useEffect(() => {
    if (transitionState) {
      pendingTransitionRef.current = transitionState;
    }
  }, [transitionState]);

  useEffect(() => {
    const screen = displayNav?.screen;
    if (!screen || showSplash) return;

    const pendingTransition = pendingTransitionRef.current;
    const fromScreen = pendingTransition?.from?.screen ?? previousScreenRef.current ?? null;
    const wasAnimated = Boolean(pendingTransition);

    markNavigationComplete(screen, {
      from: fromScreen,
      animated: wasAnimated,
    });

    pendingTransitionRef.current = null;
    previousScreenRef.current = screen;
  }, [displayNav?.screen, showSplash, markNavigationComplete]);

  useEffect(() => {
    if (showSplash || !storageLoaded) return;
    const screen = displayNav?.screen;
    if (!screen || appInteractiveReportedRef.current) return;

    appInteractiveReportedRef.current = true;
    markAppInteractive({
      initialScreen: screen,
      hasProfile: Boolean(profile),
      hasToken: Boolean(token),
    });
  }, [showSplash, storageLoaded, displayNav?.screen, profile, token, markAppInteractive]);

  useEffect(() => {
    if (!profile && !registeredProfile) return;
    const childEntries = Array.isArray(children) ? children : [];
    const normalizedChildList = normalizeChildEntries(childEntries, { authType: 'ls-login' });
    const candidateProfiles = [
      registeredProfile,
      profile,
      ...normalizedChildList,
    ].filter(Boolean);

    const seen = new Set();
    const dedupedProfiles = [];
    candidateProfiles.forEach((candidate, index) => {
      const id = resolveProfileId(candidate);
      const key = id != null ? `id:${id}` : `fallback:${candidate.accountType || 'profile'}:${index}`;
      if (seen.has(key)) return;
      seen.add(key);
      dedupedProfiles.push(candidate);
    });

    if (dedupedProfiles.length > 0) {
      setUsersRef.current(dedupedProfiles);
    }
  }, [profile, registeredProfile, children]);

  const lessonState = useMemo(
    () => ({
      completeLesson,
      overrideProgress,
      setOverrideProgress,
      getCurrentProgress,
      completedLessons,
    }),
    [completeLesson, overrideProgress, setOverrideProgress, getCurrentProgress, completedLessons],
  );

  const handleDeleteRegisteredAccount = useCallback(async () => {
    if (!profile || profile.guest) {
      throw new Error('Only registered accounts can be deleted.');
    }

    const userId = profile._id || profile.id || profile.nuriUserId;
    if (!userId) {
      throw new Error('Unable to determine account identifier.');
    }

    if (!token) {
      throw new Error('Missing authentication token.');
    }

    await deleteNuriUser({ token, userId });

    try {
      await clearCredentials();
    } catch (credentialError) {
      console.warn('Failed to clear saved credentials after account deletion', credentialError);
    }

    await wipeProfile({ clearRegistered: true });
    await clearUserData();
  }, [profile, token, wipeProfile, clearUserData]);

  const accountActions = useMemo(
    () => ({
      deleteGuestAccount,
      wipeProfile,
      saveProfile,
      deleteRegisteredAccount: handleDeleteRegisteredAccount,
    }),
    [deleteGuestAccount, wipeProfile, saveProfile, handleDeleteRegisteredAccount],
  );

  const modalHandlers = useMemo(
    () => ({
      setProfileModalVisible,
      setComingSoonGrade,
    }),
    [setProfileModalVisible, setComingSoonGrade],
  );

  useEffect(() => {
    if (!storageLoaded) return;
    if (!profile) {
      achievementsFetchRef.current = null;
      return;
    }
    const isGuestProfile = Boolean(profile?.guest || profile?.type === 'guest');
    if (isGuestProfile) {
      achievementsFetchRef.current = null;
      return;
    }
    const profileId = resolveProfileId(profile);
    if (!profileId) return;
    const activeUserId = resolveProfileId(user);
    if (!activeUserId) return;
    if (achievementsFetchRef.current === profileId) return;
    achievementsFetchRef.current = profileId;
    refreshFromServer();
  }, [storageLoaded, profile, user, refreshFromServer]);

  if (showSplash) return renderLazy(<SplashScreen />);

  const renderScreenForNav = (navState) => {
    if (!profile) {
      return (
        <NavigationContainer>
          <AuthNavigator
            onSignIn={async (data) => {
              const payload = data || {};
              const rawUser = resolveUserFromPayload(payload);
              if (!rawUser) {
                console.warn('Auth payload did not include a user object');
                return;
              }
              const authType = resolveAuthType(payload, rawUser);
              const authMetadata = deriveAuthMetadata(payload, rawUser);
              const { family, token } = authMetadata;
              let childList = Array.isArray(authMetadata.children) ? authMetadata.children : [];
              const candidateEmails = [
                rawUser?.email,
                payload?.email,
                payload?.user?.email,
              ]
                .map(value => (typeof value === 'string' ? value.trim().toLowerCase() : null))
                .filter(Boolean);
              const isTestClassUser = candidateEmails.includes(TEST_USER_EMAIL);
              const testUserData = isTestClassUser ? getTestUserClassData() : null;
              if (isTestClassUser && testUserData) {
                childList = testUserData.children;
              }
              const normalizedUser = buildProfileFromUser(rawUser, { authType, childList });
              let normalizedChildren = normalizedUser.linkedAccount
                ? normalizeChildEntries(childList, { authType })
                : [];
              if (isTestClassUser && testUserData) {
                const clonedClasses = (testUserData.classes || []).map(cls => ({
                  ...cls,
                  facilitators: (cls.facilitators || []).map(person => ({ ...person })),
                  participants: (cls.participants || []).map(person => ({ ...person })),
                }));
                normalizedUser.classes = clonedClasses;
                normalizedUser.class = clonedClasses;
                normalizedUser.numberOfChildren = normalizedChildren.length;
              }
              const availableProfiles = normalizedUser.linkedAccount
                ? [normalizedUser, ...normalizedChildren]
                : [normalizedUser];
              try {
                await setToken(token ?? null);
                await setFamily(normalizedUser.guest ? null : (family ?? null));
                await setChildren(normalizedChildren);
                await setUsers(availableProfiles);
                await setUser(normalizedUser);
                await saveProfile(normalizedUser);
                goTo('home');
              } catch (error) {
                console.error('Failed to process authentication payload', error);
              }
            }}
          />
        </NavigationContainer>
      );
    }
    return (
      <ScreenRenderer
        navState={navState || displayNav}
        profile={profile}
        user={user}
        achievements={achievements}
        childrenProfiles={children}
        level={level}
        navigationActions={navigationActions}
        goTo={goTo}
        appActions={appActions}
        lessonState={lessonState}
        accountActions={accountActions}
        modalHandlers={modalHandlers}
        awardGameAchievement={awardGameAchievement}
        recordGamePlay={recordGamePlay}
      />
    );
  };

  let screenContent;

  if (ScreenTransition.canAnimate({ transitionState, viewportWidth })) {
    const { from, to, direction } = transitionState;

    screenContent = (
      <ScreenTransition
        transitionState={transitionState}
        transitionProgress={transitionProgress}
        viewportWidth={viewportWidth}
        renderScreenForNav={renderScreenForNav}
      />
    );
  } else {
    screenContent = renderScreenForNav(displayNav);
  }

  return (
    <AchievementsProvider value={achievementsState}>
      <ScreenBackground>
        <SafeAreaView style={styles.container}>
          <ProfileModal
            visible={profileModalVisible}
            profile={profile}
            onClose={() => setProfileModalVisible(false)}
            onOpenSwitcher={() => {
              setProfileModalVisible(false);
              if (profileSwitchEligible) {
                setProfileSwitcherVisible(true);
              }
            }}
            switcherAvailable={profileSwitchEligible}
            onAvatarPress={avatarActions?.pickNewAvatar}
          />
          <ProfileSwitcherModal
            visible={profileSwitcherVisible}
            registeredProfile={registeredProfile}
            guestProfile={guestProfile}
            profile={profile}
            children={children}
            saveProfile={saveProfile}
            setUser={setUser}
            setProfileSwitcherVisible={setProfileSwitcherVisible}
            deleteGuestAccount={deleteGuestAccount}
          />
          <View style={styles.container}>{screenContent}</View>
          <ComingSoonModal
            visible={comingSoonGrade != null}
            grade={comingSoonGrade}
            onClose={() => setComingSoonGrade(null)}
          />
          {notification && (
            <NotificationBanner
              title={notification.title}
              onPress={() => {
                goTo('achievements', { highlight: notification.id });
                setNotification(null);
              }}
              onHide={() => setNotification(null)}
            />
          )}
        </SafeAreaView>
      </ScreenBackground>
    </AchievementsProvider>
  );
};

export default Main;
