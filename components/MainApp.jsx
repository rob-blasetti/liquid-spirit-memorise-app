import React, { useState, useEffect, useMemo } from 'react';
import { SafeAreaView, View, Image as RNImage } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useUser } from '../contexts/UserContext';
import { useDifficulty } from '../contexts/DifficultyContext';
import styles from '../styles/mainAppStyles';
import {
  GradesScreen,
  Grade1SetScreen,
  Grade1LessonScreen,
  Grade2Screen,
  Grade2SetScreen,
  Grade2LessonScreen,
  Grade2bScreen,
  Grade2bSetScreen,
  Grade2bLessonScreen,
  Grade3Screen,
  Grade4Screen,
  SettingsScreen,
  AchievementsScreen,
  HomeScreen,
  Splash,
  GamesListScreen,
  ClassScreen,
  LessonJourneyScreen,
} from '../screens';
import AuthNavigator from '../navigation/AuthNavigator';
import BottomNav from '../navigation/BottomNav';
import NotificationBanner from './NotificationBanner';
import ChildSwitcherModal from './ChildSwitcherModal';
import GameRenderer from './GameRenderer';
import { isGameScreen } from '../navigation/router';
import ScreenBackground from './ScreenBackground';
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

const MainApp = () => {
  const { classes, children, user, setUser, setChildren, setFamily, setToken } = useUser();
  const { level } = useDifficulty();
  const {
    showSplash,
    profile,
    registeredProfile,
    guestProfile,
    setProfile,
    setGuestProfile,
    saveProfile,
    deleteGuestAccount,
    wipeProfile,
  } = useProfile();
  const { nav, goTo, visitedGrades, markGradeVisited } = useNavigationHandlers();
  const achievementsState = useAchievements(profile, saveProfile);
  const { achievements, notification, setNotification, awardAchievement, awardGameAchievement } = achievementsState;
  // Pass profile to lesson progress hook to adjust defaults by grade
  const { completedLessons, overrideProgress, setOverrideProgress, completeLesson, getCurrentProgress } = useLessonProgress(profile, awardAchievement);
  const [chooseChildVisible, setChooseChildVisible] = useState(false);

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

  const {
    goHome,
    goGrade1,
    goGrade2,
    goGrade3,
    goGrade4,
    goGrade2Set,
    goGrade2Lesson,
    goGrade2b,
    goGrade2bSet,
    goGrade2bLesson,
    goBackToGrade2Set,
    goBackToGrade2bSet,
    goBackToLesson,
  } = navigationActions;

  const appActions = useMemo(
    () =>
      createAppActions({
        profile,
        goTo,
        nav,
        getCurrentProgress,
        awardAchievement,
      }),
    [profile, goTo, nav, getCurrentProgress, awardAchievement],
  );

  const { handleDailyChallenge, playSelectedGame, getHomeProgress } = appActions;

  const avatarActions = useMemo(
    () =>
      createAvatarActions({
        profile,
        setProfile,
        saveProfile,
      }),
    [profile, setProfile, saveProfile],
  );

  const { pickNewAvatar } = avatarActions;

  // Preload Pearlina image for Home screen into FastImage cache
  useEffect(() => {
    const asset = RNImage.resolveAssetSource(require('../assets/img/pearlina-pointing-right.png'));
    FastImage.preload([{ uri: asset.uri }]);
  }, []);

  // Warm cache with likely avatar + class images when children load/switch
  useEffect(() => {
    if (!children || children.length === 0) return;
    const uris = collectChildAndClassImageUris(children);
    // Avatars and thumbnails don't need high priority globally
    preloadImages(uris, { priority: 'low' });
  }, [children]);

  // Also preload the active profile's avatar if present (switches, uploads)
  useEffect(() => {
    const avatarUri = profile?.profilePicture || profile?.avatar;
    if (avatarUri) preloadImages([avatarUri], { priority: 'normal' });
  }, [profile?.profilePicture, profile?.avatar]);

  if (showSplash) return <Splash />;

  const renderScreen = () => {
    if (!profile) {
      return (
        <NavigationContainer>
          {/* onSignIn may receive { user, token } from Nuri auth or a raw profile for guest */}
        <AuthNavigator onSignIn={(data) => {
            console.log('User signed in:', data);
            // Handle guest login directly
            if (data.guest) {
              saveProfile(data);
              goTo('home');
              return;
            }
            // Registered or LS user login flow
            const token = data.token || null;
            if (token) {
              setToken(token);
            }
            const fullUser = data.user || null;
            setUser(fullUser);
            const children = data.classes || [];
            setChildren(children);
            // Determine active learning profile: first child for LS, else self
            let activeProfile = Array.isArray(children) && children.length > 0 ? children[0] : fullUser;
            // Normalize grade: numeric grades to Number, preserve '2b'
            const gradeVal = activeProfile?.grade || '1';
            const normalizedGrade = gradeVal === '2b' ? '2b' : Number(gradeVal);
            activeProfile = { ...activeProfile, grade: normalizedGrade };
            // Persist profile for learning context
            saveProfile(activeProfile);
            // Navigate into the app
            goTo('home');
          }} />
        </NavigationContainer>
      );
    }
    // Render games within the main layout instead of early-returning
    if (isGameScreen(nav.screen)) {
      const backHandler = nav.fromGames ? () => goTo('games') : goBackToLesson;
      return (
        <GameRenderer
          screen={nav.screen}
          quote={nav.quote}
          onBack={backHandler}
          level={level}
          awardGameAchievement={awardGameAchievement}
        />
      );
    }
    switch (nav.screen) {
      case 'grade1':
        return (
          <Grade1SetScreen
            onBack={goHome}
            onLessonSelect={lessonNumber => goTo('grade1Lesson', { lessonNumber })}
          />
        );
      case 'grade1Lesson':
        return (
          <Grade1LessonScreen
            lessonNumber={nav.lessonNumber}
            onBack={nav.from === 'journey' ? () => goTo('lessonJourney') : () => goTo('grade1')}
          />
        );
      case 'grade2Lesson':
        return (
          <Grade2LessonScreen
            setNumber={nav.setNumber}
            lessonNumber={nav.lessonNumber}
            onBack={nav.from === 'journey' ? () => goTo('lessonJourney') : goBackToGrade2Set}
            onComplete={completeLesson}
            onPractice={(q) => goTo('practice', { quote: q })}
            onPlayGame={(q) => goTo('tapGame', { quote: q })}
          />
        );
      case 'grade2bLesson':
        return (
          <Grade2bLessonScreen
            setNumber={nav.setNumber}
            lessonNumber={nav.lessonNumber}
            onBack={nav.from === 'journey' ? () => goTo('lessonJourney') : goBackToGrade2bSet}
            onComplete={completeLesson}
            onPractice={(q) => goTo('practice', { quote: q })}
            onPlayGame={(q) => goTo('tapGame', { quote: q })}
          />
        );
      case 'grade2Set':
        return <Grade2SetScreen setNumber={nav.setNumber} onLessonSelect={goGrade2Lesson} onBack={goGrade2} />;
      case 'grade2bSet':
        return <Grade2bSetScreen setNumber={nav.setNumber} onLessonSelect={goGrade2bLesson} onBack={goGrade2b} />;
      case 'grade2':
        return <Grade2Screen onSetSelect={goGrade2Set} onBack={goHome} />;
      case 'grade2b':
        return <Grade2bScreen onSetSelect={goGrade2bSet} onBack={goHome} />;
      case 'grade3':
        return <Grade3Screen onBack={goHome} />;
      case 'grade4':
        return <Grade4Screen onBack={goHome} />;
      case 'achievements':
        return <AchievementsScreen />;
      case 'games':
        return <GamesListScreen onSelect={playSelectedGame} />;
      case 'settings':
        return (
        <SettingsScreen
          profile={profile}
          currentProgress={getCurrentProgress()}
          overrideProgress={overrideProgress}
          onSaveOverride={setOverrideProgress}
          onBack={goHome}
          // Logout: clear guest or registered profile appropriately
          onReset={() => {
            if (profile?.guest) {
              deleteGuestAccount();
            } else {
              wipeProfile();
            }
          }}
          onSaveProfile={saveProfile}
        />
        );
      case 'class':
        return <ClassScreen childEntries={children || []} onBack={goHome} />;
      case 'lessonJourney':
        return (
          <LessonJourneyScreen
            profile={profile}
            currentProgress={getCurrentProgress()}
            completedLessons={completedLessons}
            onBack={goHome}
            goToLesson={(setNumber, lessonNumber) => {
              if (profile.grade === 1) {
                goTo('grade1Lesson', { lessonNumber, from: 'journey' });
              } else if (profile.grade === 2) {
                goTo('grade2Lesson', { setNumber, lessonNumber, from: 'journey' });
              } else if (profile.grade === '2b') {
                goTo('grade2bLesson', { setNumber, lessonNumber, from: 'journey' });
              }
            }}
          />
        );
      case 'grades':
        return (
          <GradesScreen
            onGradeSelect={(g, setNumber) => {
              if (g === 1) {
                goGrade1();
              } else if (g === 2) {
                if (setNumber === 2) {
                  goGrade2b();
                } else if (setNumber) {
                  goGrade2Set(setNumber);
                } else {
                  goGrade2();
                }
              } else if (g === 3) {
                goGrade3();
              } else if (g === 4) {
                goGrade4();
              }
            }}
          />
        );
      default: {
        const { setNumber, lessonNumber } = getHomeProgress();
        // Determine if user can switch accounts (guest, registered, or multiple children)
        const accountCount = (guestProfile ? 1 : 0) + (registeredProfile ? 1 : 0) + (Array.isArray(children) ? children.length : 0);
        const canSwitchAccount = accountCount > 1;
        return (
          <HomeScreen
            profile={profile}
            achievements={achievements}
            onDailyChallenge={handleDailyChallenge}
            currentSet={setNumber}
            currentLesson={lessonNumber}
            onProfilePress={() => setChooseChildVisible(true)}
            onAvatarPress={pickNewAvatar}
            onJourney={() => goTo('lessonJourney')}
            canSwitchAccount={canSwitchAccount}
          />
        );
      }
    }
  };

  return (
    <AchievementsProvider value={achievementsState}>
    <ScreenBackground>
    <SafeAreaView style={styles.container}>
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
      <ChildSwitcherModal
        visible={chooseChildVisible}
        registeredProfile={registeredProfile}
        guestProfile={guestProfile}
        profile={profile}
        children={children}
        saveProfile={saveProfile}
        setUser={setUser}
        setChooseChildVisible={setChooseChildVisible}
        deleteGuestAccount={deleteGuestAccount}
      />
      <View style={styles.container}>{renderScreen()}</View>
      {profile && (
        <BottomNav
          goHome={goHome}
          goGrades={() => goTo('grades')}
          goClass={() => goTo('class')}
          goGames={() => goTo('games')}
          goAchievements={() => goTo('achievements')}
          goSettings={() => goTo('settings')}
          activeScreen={nav.screen}
          showClassTab={profile?.type === 'linked'}
        />
      )}
    </SafeAreaView>
    </ScreenBackground>
    </AchievementsProvider>
  );
};

export default MainApp;
