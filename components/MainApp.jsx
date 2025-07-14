import React, { useState } from 'react';
import { SafeAreaView, View } from 'react-native';
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
} from '../screens';
import AuthNavigator from '../navigation/AuthNavigator';
import BottomNav from '../navigation/BottomNav';
import NotificationBanner from './NotificationBanner';
import ChildSwitcherModal from './ChildSwitcherModal';
import GameRenderer from './GameRenderer';
import { grade1Lessons } from '../data/grade1';
import { quoteMap } from '../data/grade2';
import { quoteMap as quoteMap2b } from '../data/grade2b';
import useNavigationHandlers from '../hooks/useNavigationHandlers';
import useProfile from '../hooks/useProfile';
import { launchImageLibrary } from 'react-native-image-picker';
import useAchievements from '../hooks/useAchievements';
import useLessonProgress from '../hooks/useLessonProgress';

const MainApp = () => {
  const { classes, children, setUser } = useUser();
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
    // Function to clear current profile and return to welcome screen
    wipeProfile,
  } = useProfile();
  const { nav, goTo, visitGrade } = useNavigationHandlers();
  const { achievements, notification, setNotification, awardAchievement } = useAchievements(profile, saveProfile);
  // Pass profile to lesson progress hook to adjust defaults by grade
  const { completedLessons, overrideProgress, setOverrideProgress, completeLesson, getCurrentProgress } = useLessonProgress(profile, awardAchievement);
  const [chooseChildVisible, setChooseChildVisible] = useState(false);

  if (showSplash) return <Splash />;

  const goHome = () => goTo('home');

  const goGrade1 = () => { visitGrade(1, {}, () => {}, awardAchievement); goTo('grade1'); };
  const goGrade2 = () => { visitGrade(2, {}, () => {}, awardAchievement); goTo('grade2'); };
  const goGrade3 = () => { visitGrade(3, {}, () => {}, awardAchievement); goTo('grade3'); };
  const goGrade4 = () => { visitGrade(4, {}, () => {}, awardAchievement); goTo('grade4'); };
  const goGrade2Set = (setNumber) => goTo('grade2Set', { setNumber });
  const goGrade2Lesson = (lessonNumber) => goTo('grade2Lesson', { ...nav, lessonNumber });
  const goGrade2b = () => { visitGrade(2, {}, () => {}, awardAchievement); goTo('grade2b'); };
  const goGrade2bSet = (setNumber) => goTo('grade2bSet', { setNumber });
  const goGrade2bLesson = (lessonNumber) => goTo('grade2bLesson', { ...nav, lessonNumber });

  const goBackToGrade2Set = () => goTo('grade2Set', { setNumber: nav.setNumber });
  const goBackToGrade2bSet = () => goTo('grade2bSet', { setNumber: nav.setNumber });
  const goBackToLesson = () => goTo(nav.lessonScreen || 'grade2Lesson', { setNumber: nav.setNumber, lessonNumber: nav.lessonNumber });

  const handleDailyChallenge = () => {
    awardAchievement('daily');
    const { setNumber, lessonNumber } = getCurrentProgress();
    let content = '';
    if (profile.grade == 1) {
      // Grade 1: show prayer for current lesson
      content = grade1Lessons.find(l => l.lesson === lessonNumber)?.prayer || '';
    } else if (profile.grade == 2) {
      // Grade 2: show quote text for current set and lesson
      const key = `${setNumber}-${lessonNumber}`;
      content = quoteMap[key] || '';
    } else if (profile.grade === '2b') {
      // Grade 2b: show quote text for current set and lesson from grade2b data
      const key = `${setNumber}-${lessonNumber}`;
      const qObj = quoteMap2b[key];
      content = qObj?.text || '';
    }
    goTo('practice', { quote: content, setNumber, lessonNumber });
  };

  const playSelectedGame = (gameId) => {
    const { setNumber, lessonNumber } = getCurrentProgress();
    let content = '';
    if (profile?.grade == 1) {
      // Grade 1: use lesson quote
      const lesson = grade1Lessons.find(l => l.lesson === lessonNumber);
      content = lesson ? lesson.quote : '';
    } else if (profile?.grade == 2) {
      // Grade 2: use quote text from grade2 data
      const qObj = quoteMap[`${setNumber}-${lessonNumber}`];
      content = qObj?.text || '';
    } else if (profile?.grade === '2b') {
      // Grade 2b: use quote text from grade2b data
      const qObj = quoteMap2b[`${setNumber}-${lessonNumber}`];
      content = qObj?.text || '';
    }
    goTo(gameId, { quote: content, setNumber, lessonNumber, fromGames: true, lessonScreen: nav.screen });
  };

  // Allow user to pick a new avatar image
  const handleAvatarPress = () => {
    launchImageLibrary({ mediaType: 'photo', includeBase64: true }, async (response) => {
      if (response.didCancel || response.errorCode) return;
      const asset = response.assets && response.assets[0];
      if (asset) {
        let avatarUri;
        if (asset.base64) {
          const type = asset.type || 'image/jpeg';
          avatarUri = `data:${type};base64,${asset.base64}`;
        } else {
          avatarUri = asset.uri;
        }
        const updatedProfile = { ...profile, avatar: avatarUri };
        await saveProfile(updatedProfile);
        setProfile(updatedProfile);
      }
    });
  };

  const renderScreen = () => {
    if (!profile) {
      return (
        <NavigationContainer>
          {/* onSignIn may receive { user, token } from Nuri auth or a raw profile for guest */}
          <AuthNavigator onSignIn={(data) => {
            const newProfile = data && data.user ? data.user : data;
            saveProfile(newProfile);
            // After signing in, reset navigation to Home
            goTo('home');
          }} />
        </NavigationContainer>
      );
    }
    if (['practice', 'tapGame', 'scrambleGame', 'nextWordGame', 'memoryGame', 'flashGame', 'revealGame', 'firstLetterGame', 'letterScrambleGame', 'fastTypeGame', 'hangmanGame', 'fillBlankGame', 'shapeBuilderGame', 'colorSwitchGame', 'rhythmRepeatGame', 'silhouetteSearchGame', 'memoryMazeGame', 'sceneChangeGame', 'wordSwapGame', 'buildRecallGame'].includes(nav.screen)) {
      const backHandler = nav.fromGames ? goHome : goBackToLesson;
      return <GameRenderer screen={nav.screen} quote={nav.quote} onBack={backHandler} level={level} awardAchievement={awardAchievement} />;
    }
    switch (nav.screen) {
      case 'grade1':
        return <Grade1SetScreen onBack={goHome} onLessonSelect={goTo.bind(null, 'grade1Lesson')} />;
      case 'grade1Lesson':
        return <Grade1LessonScreen lessonNumber={nav.lessonNumber} onBack={() => goTo('grade1')} />;
      case 'grade2Lesson':
        return (
          <Grade2LessonScreen
            setNumber={nav.setNumber}
            lessonNumber={nav.lessonNumber}
            onBack={goBackToGrade2Set}
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
            onBack={goBackToGrade2bSet}
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
        return <AchievementsScreen achievements={achievements} highlightId={nav.highlight} />;
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
            // Wipe user profile and navigate to Welcome screen
            onReset={wipeProfile}
            onSaveProfile={saveProfile}
          />
        );
      case 'class':
        return <ClassScreen childEntries={children || []} onBack={goHome} />;
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
        let content = '';
        if (profile.grade == 1) {
          // Grade 1: show prayer for current lesson
          content = grade1Lessons.find(l => l.lesson === lessonNumber)?.prayer || '';
        } else if (profile.grade == 2) {
          // Grade 2: show quote text from grade2 data
          const key = `${setNumber}-${lessonNumber}`;
          const qObj = quoteMap[key];
          content = qObj?.text || '';
        } else if (profile.grade === '2b') {
          // Grade 2b: show quote text from grade2b data
          const key = `${setNumber}-${lessonNumber}`;
          const qObj = quoteMap2b[key];
          content = qObj?.text || '';
        }
        return (
          <HomeScreen
            profile={profile}
            achievements={achievements}
            content={content}
            onDailyChallenge={handleDailyChallenge}
            onTestMemory={() => goTo('memoryGame', { quote: content })}
            onSeeClass={() => goTo('class')}
            onGoToSet={() => {}}
            onGoToLesson={() => {}}
            currentSet={setNumber}
            currentLesson={lessonNumber}
            // Open account modal
            onProfilePress={() => setChooseChildVisible(true)}
            // Open image picker for avatar change
            onAvatarPress={handleAvatarPress}
          />
        );
      }
    }
  };

  return (
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
        setAchievements={() => {}}
        saveProfile={saveProfile}
        setUser={setUser}
        setChooseChildVisible={setChooseChildVisible}
        deleteGuestAccount={deleteGuestAccount}
      />
      <View style={styles.container}>{renderScreen()}</View>
      <BottomNav
        goHome={goHome}
        goGrades={() => goTo('grades')}
        goClass={() => goTo('class')}
        goGames={() => goTo('games')}
        goAchievements={() => goTo('achievements')}
        goSettings={() => goTo('settings')}
        activeScreen={nav.screen}
      />
    </SafeAreaView>
  );
};

export default MainApp;
