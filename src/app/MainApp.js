import React, { useEffect, useMemo } from 'react';
import { SafeAreaView, View, Animated, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useUser } from './contexts/UserContext';
import { useDifficulty } from './contexts/DifficultyContext';
import styles from '../ui/stylesheets/mainAppStyles';
import AuthNavigator from './navigation/AuthNavigator';
import NotificationBanner from '../ui/components/NotificationBanner';
import ProfileSwitcherModal from '../ui/components/ProfileSwitcherModal';
import ProfileModal from '../ui/components/ProfileModal';
import ScreenRenderer, { renderLazy, SplashScreen } from '../ui/components/ScreenRenderer';
import ScreenBackground from '../ui/components/ScreenBackground';
import ComingSoonModal from '../ui/components/ComingSoonModal';

import useNavigationHandlers from '../hooks/useNavigationHandlers';
import useProfile from '../hooks/useProfile';
import useAchievements from '../hooks/useAchievements';
import useLessonProgress from '../hooks/useLessonProgress';
import { AchievementsProvider } from './contexts/AchievementsContext';
import ScreenTransition from '../ui/components/ScreenTransition';

import { resolveProfileId } from '../services/profileUtils';
import useHomeScreenTransition from '../hooks/useHomeScreenTransition';
import useAppPreloadEffects from './hooks/useAppPreloadEffects';
import useAuthSignInHandler from './hooks/useAuthSignInHandler';
import useMainAppRuntime from './hooks/useMainAppRuntime';
import useMainAppControls from './hooks/useMainAppControls';
import useMainAppComposition from './hooks/useMainAppComposition';

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
  const {
    completedLessons,
    overrideProgress,
    setOverrideProgress,
    completeLesson,
    getCurrentProgress,
    getProgressForGrade,
  } = useLessonProgress(profile, awardAchievement, recordLessonCompletion);
  const {
    profileSwitchEligible,
    avatarActions,
    navigationActions,
    appActions,
    lessonState,
  } = useMainAppComposition({
    profile,
    registeredProfile,
    guestProfile,
    children,
    setProfile,
    saveProfile,
    goTo,
    nav,
    markGradeVisited,
    visitedGrades,
    awardAchievement,
    getCurrentProgress,
    recordDailyChallenge,
    completeLesson,
    overrideProgress,
    setOverrideProgress,
    getProgressForGrade,
    completedLessons,
  });

  const handleAuthSignIn = useAuthSignInHandler({
    setToken,
    setFamily,
    setChildren,
    setUsers,
    setUser,
    saveProfile,
    goTo,
  });
  useAppPreloadEffects({
    navScreen: nav.screen,
    profile,
    childrenProfiles: children,
  });

  useMainAppRuntime({
    transitionState,
    displayNav,
    showSplash,
    storageLoaded,
    profile,
    registeredProfile,
    guestProfile,
    children,
    user,
    token,
    setUsers,
    refreshFromServer,
  });

  const {
    profileSwitcherVisible,
    setProfileSwitcherVisible,
    profileModalVisible,
    setProfileModalVisible,
    comingSoonGrade,
    setComingSoonGrade,
    accountActions,
    modalHandlers,
  } = useMainAppControls({
    profile,
    token,
    wipeProfile,
    clearUserData,
    deleteGuestAccount,
    saveProfile,
  });

  if (showSplash) return renderLazy(<SplashScreen />);

  const renderScreenForNav = (navState) => {
    if (!profile) {
      return (
        <NavigationContainer>
          <AuthNavigator
            onSignIn={async (data) => {
              try {
                await handleAuthSignIn(data);
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
