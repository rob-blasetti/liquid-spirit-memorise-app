import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Image as RNImage, Alert } from 'react-native';
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
import { getCurrentContent, getContentFor } from '../services/contentSelector';
import useNavigationHandlers from '../hooks/useNavigationHandlers';
import useProfile from '../hooks/useProfile';
import { launchImageLibrary } from 'react-native-image-picker';
import useAchievements from '../hooks/useAchievements';
import useLessonProgress from '../hooks/useLessonProgress';
import { uploadAndSetProfilePicture } from '../services/profileService';
import { AchievementsProvider } from '../contexts/AchievementsContext';

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
  const { nav, goTo, visitGrade } = useNavigationHandlers();
  const achievementsState = useAchievements(profile, saveProfile);
  const { achievements, notification, setNotification, awardAchievement, awardGameAchievement } = achievementsState;
  // Pass profile to lesson progress hook to adjust defaults by grade
  const { completedLessons, overrideProgress, setOverrideProgress, completeLesson, getCurrentProgress } = useLessonProgress(profile, awardAchievement);
  const [chooseChildVisible, setChooseChildVisible] = useState(false);

  // Preload Pearlina image for Home screen into FastImage cache
  useEffect(() => {
    const asset = RNImage.resolveAssetSource(require('../assets/img/pearlina-pointing-right.png'));
    FastImage.preload([{ uri: asset.uri }]);
  }, []);

  if (showSplash) return <Splash />;

  const goHome = () => goTo('home');

  const goGrade1 = () => { visitGrade(1, {}, () => {}, awardAchievement); goTo('grade1'); };
  const goGrade2 = () => { visitGrade(2, {}, () => {}, awardAchievement); goTo('grade2'); };
  const goGrade3 = () => { visitGrade(3, {}, () => {}, awardAchievement); goTo('grade3'); };
  const goGrade4 = () => { visitGrade(4, {}, () => {}, awardAchievement); goTo('grade4'); };
  const goGrade2Set = (setNumber) => goTo('grade2Set', { setNumber });
  // Navigate to a specific Grade 2 lesson, preserving the current setNumber
  const goGrade2Lesson = (lessonNumber) => goTo('grade2Lesson', { setNumber: nav.setNumber, lessonNumber });
  const goGrade2b = () => { visitGrade(2, {}, () => {}, awardAchievement); goTo('grade2b'); };
  const goGrade2bSet = (setNumber) => goTo('grade2bSet', { setNumber });
  // Navigate to a specific Grade 2b lesson, preserving the current setNumber
  const goGrade2bLesson = (lessonNumber) => goTo('grade2bLesson', { setNumber: nav.setNumber, lessonNumber });

  const goBackToGrade2Set = () => goTo('grade2Set', { setNumber: nav.setNumber });
  const goBackToGrade2bSet = () => goTo('grade2bSet', { setNumber: nav.setNumber });
  const goBackToLesson = () => goTo(nav.lessonScreen || 'grade2Lesson', { setNumber: nav.setNumber, lessonNumber: nav.lessonNumber });

  const handleDailyChallenge = () => {
    awardAchievement('daily');
    const { setNumber, lessonNumber } = getCurrentProgress();
    const content = getContentFor(profile, setNumber, lessonNumber, { type: 'prayer' });
    goTo('practice', { quote: content, setNumber, lessonNumber });
  };

  const playSelectedGame = (gameId) => {
    const { setNumber, lessonNumber } = getCurrentProgress();
    const content = getContentFor(profile, setNumber, lessonNumber, { type: 'quote' });
    goTo(gameId, { quote: content, setNumber, lessonNumber, fromGames: true, lessonScreen: nav.screen });
  };

  // Allow user to pick a new avatar image with optimistic update
  const handleAvatarPress = () => {
    launchImageLibrary({ mediaType: 'photo' }, async (response) => {
      if (response.didCancel || response.errorCode) return;
      const asset = response.assets?.[0];
      if (!asset) return;

      // Optimistically update avatar in UI
      const originalProfile = profile;
      const oldProfilePicture = originalProfile.profilePicture;
      const optimisticProfile = { ...originalProfile, profilePicture: asset.uri };
      setProfile(optimisticProfile);

      try {
        // 1) upload to S3 & update the server
        const updatedServerProfile = await uploadAndSetProfilePicture(originalProfile, asset);

        // 2) cache and push into state
        const newProfile = { ...originalProfile, ...updatedServerProfile };
        await saveProfile(newProfile);
        setProfile(newProfile);
      } catch (err) {
        console.error('Avatar upload/update failed:', err);
        // Revert avatar on failure
        setProfile(originalProfile);
        Alert.alert('Error', 'Could not update your profile picture. Please try again.');
      }
    });
  };

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
        const { setNumber, lessonNumber } = getCurrentProgress();
        const content = getCurrentContent(profile, getCurrentProgress, { type: 'prayer' });
        return (
          <HomeScreen
            profile={profile}
            achievements={achievements}
            onDailyChallenge={handleDailyChallenge}
            currentSet={setNumber}
            currentLesson={lessonNumber}
            onProfilePress={() => setChooseChildVisible(true)}
            onAvatarPress={handleAvatarPress}
            onJourney={() => goTo('lessonJourney')}
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
        />
      )}
    </SafeAreaView>
    </ScreenBackground>
    </AchievementsProvider>
  );
};

export default MainApp;
