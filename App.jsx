import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, Button, StyleSheet, TouchableOpacity, Modal, FlatList, Image } from 'react-native';
import Avatar from '@flipxyz/react-native-boring-avatars';
import ThemedButton from './components/ThemedButton';
import GradesScreen from './screens/GradesScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Use FontAwesome via @fortawesome/react-native-fontawesome
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTrash, faHome, faBook, faTrophy, faCog, faGamepad } from '@fortawesome/free-solid-svg-icons';
// import Grade1Screen from './screens/Grade1Screen';
import Grade2Screen from './screens/Grade2Screen';
import Grade2SetScreen from './screens/Grade2SetScreen';
import Grade2LessonScreen from './screens/Grade2LessonScreen';
import QuotePracticeScreen from './games/QuotePracticeScreen';
import Grade3Screen from './screens/Grade3Screen';
import Grade4Screen from './screens/Grade4Screen';
import SettingsScreen from './screens/SettingsScreen';
import AchievementsScreen from './screens/AchievementsScreen';
import TapMissingWordsGame from './games/TapMissingWordsGame';
import TapScrambledGame from './games/TapScrambledGame';
import NextWordQuizGame from './games/NextWordQuizGame';
import MemoryMatchGame from './games/MemoryMatchGame';
import FlashCardRecallGame from './games/FlashCardRecallGame';
import RevealWordGame from './games/RevealWordGame';
import FirstLetterQuizGame from './games/FirstLetterQuizGame';
import LetterScrambleGame from './games/LetterScrambleGame';
import FastTypeGame from './games/FastTypeGame';
import HangmanGame from './games/HangmanGame';
import FillBlankTypingGame from './games/FillBlankTypingGame';
import ProfileSetupScreen from './screens/ProfileSetupScreen';
import HomeScreen from './screens/HomeScreen';
import { grade1Lessons } from './data/grade1';
import { quoteMap } from './data/grade2';
import StartScreen from './screens/StartScreen';
import Splash from './screens/Splash';
import Grade1SetScreen from './screens/Grade1SetScreen';
import Grade1LessonScreen from './screens/Grade1LessonScreen';
import GamesListScreen from './screens/GamesListScreen';
import ClassScreen from './screens/ClassScreen';
import { useUser } from './contexts/UserContext';
// Game registry for daily challenge
import { pickRandomGame } from './games';
import { API_URL } from './config';

import { UserProvider, UserContext } from './contexts/UserContext';

 const MainApp = () => {
  // access user context (user, family, children, classes)
  const { user, classes, children, setUser } = useUser();
  useEffect(() => {
    console.log('API_URL:', API_URL);
  }, []);
  const [showSplash, setShowSplash] = useState(true);
  const [nav, setNav] = useState({ screen: 'home' });
  const [profile, setProfile] = useState(null);
  // when profile loads, if multiple children, ask the user to pick a default child
  const [chooseChildVisible, setChooseChildVisible] = useState(false);
  useEffect(() => {
    if (!profile) return;
    // Use profile.children (array of { child, classes }) to decide if we need to choose
    const childEntries = profile.children || [];
    if (childEntries.length > 1) {
      setChooseChildVisible(true);
    } else if (childEntries.length === 1) {
      // only one entry: auto-select its child
      const entry = childEntries[0];
      const child = entry.child || entry;
      setProfile(child);
      setUser(child);
    }
  }, [profile]);
  const [showSetup, setShowSetup] = useState(false);
  const [achievements, setAchievements] = useState([
    {
      id: 'daily',
      title: 'Daily Learner',
      description: 'Do a memorisation game each day',
      icon: 'calendar-check-o',
      points: 5,
      earned: false,
    },
    {
      id: 'set1',
      title: 'Set 1 Master',
      description: 'Complete all lessons in Set 1',
      icon: 'trophy',
      points: 10,
      earned: false,
    },
    {
      id: 'prayer1',
      title: 'Prayer Beginner',
      description: 'Memorise your first prayer',
      icon: 'trophy',
      points: 5,
      earned: false,
    },
    {
      id: 'prayer5',
      title: 'Prayer Enthusiast',
      description: 'Memorise five prayers',
      icon: 'trophy',
      points: 15,
      prereq: 'prayer1',
      earned: false,
    },
    {
      id: 'prayer10',
      title: 'Prayer Expert',
      description: 'Memorise ten prayers',
      icon: 'trophy',
      points: 25,
      prereq: 'prayer5',
      earned: false,
    },
    {
      id: 'quote1',
      title: 'Quote Starter',
      description: 'Memorise your first quote',
      icon: 'trophy',
      points: 5,
      earned: false,
    },
    {
      id: 'quote5',
      title: 'Quote Collector',
      description: 'Memorise five quotes',
      icon: 'trophy',
      points: 15,
      prereq: 'quote1',
      earned: false,
    },
    {
      id: 'quote15',
      title: 'Quote Scholar',
      description: 'Memorise fifteen quotes',
      icon: 'trophy',
      points: 25,
      prereq: 'quote5',
      earned: false,
    },
    {
      id: 'set2',
      title: 'Set 2 Master',
      description: 'Complete all lessons in Set 2',
      icon: 'trophy',
      points: 10,
      prereq: 'set1',
      earned: false,
    },
    {
      id: 'set3',
      title: 'Set 3 Master',
      description: 'Complete all lessons in Set 3',
      icon: 'trophy',
      points: 10,
      prereq: 'set2',
      earned: false,
    },
    {
      id: 'set4',
      title: 'Set 4 Master',
      description: 'Complete all lessons in Set 4',
      icon: 'trophy',
      points: 10,
      prereq: 'set3',
      earned: false,
    },
    {
      id: 'grade1',
      title: 'Grade 1 Star',
      description: 'Finish all Grade 1 lessons',
      icon: 'trophy',
      points: 20,
      prereq: 'set4',
      earned: false,
    },
    {
      id: 'grade2',
      title: 'Grade 2 Star',
      description: 'Finish all Grade 2 lessons',
      icon: 'trophy',
      points: 25,
      prereq: 'grade1',
      earned: false,
    },
    {
      id: 'streak3',
      title: 'Daily Streak 3',
      description: 'Do the daily challenge three days in a row',
      icon: 'calendar-check-o',
      points: 5,
      earned: false,
    },
    {
      id: 'streak7',
      title: 'Daily Streak 7',
      description: 'Do the daily challenge seven days in a row',
      icon: 'calendar-check-o',
      points: 15,
      prereq: 'streak3',
      earned: false,
    },
    {
      id: 'streak30',
      title: 'Daily Streak 30',
      description: 'Do the daily challenge thirty days in a row',
      icon: 'calendar-check-o',
      points: 30,
      prereq: 'streak7',
      earned: false,
    },
    {
      id: 'game1',
      title: 'Game Beginner',
      description: 'Play your first game',
      icon: 'trophy',
      points: 5,
      earned: false,
    },
    {
      id: 'game10',
      title: 'Game Fanatic',
      description: 'Play ten games',
      icon: 'trophy',
      points: 20,
      prereq: 'game1',
      earned: false,
    },
    {
      id: 'practice20',
      title: 'Quote Practice Pro',
      description: 'Practice quotes twenty times',
      icon: 'trophy',
      points: 10,
      prereq: 'quote1',
      earned: false,
    },
    {
      id: 'tapPerfect',
      title: 'Tap Game Champ',
      description: 'Finish a tap game without mistakes',
      icon: 'trophy',
      points: 15,
      prereq: 'game1',
      earned: false,
    },
    {
      id: 'profile',
      title: 'Profile Setup',
      description: 'Create your profile and avatar',
      icon: 'trophy',
      points: 5,
      earned: false,
    },
    {
      id: 'explorer',
      title: 'Class Explorer',
      description: 'Visit all grade levels',
      icon: 'trophy',
      points: 10,
      earned: false,
    },
  ]);
  const [completedLessons, setCompletedLessons] = useState({});
  const [overrideProgress, setOverrideProgress] = useState(null);
  const [visitedGrades, setVisitedGrades] = useState({});
  const [gamesPlayed, setGamesPlayed] = useState(0);

  // Splash timeout (skip delay during tests)
  useEffect(() => {
    if (process.env.NODE_ENV === 'test') {
      setShowSplash(false);
      return;
    }
    const timeout = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timeout);
  }, []);
  
  // Load saved override progress
  useEffect(() => {
    const loadOverride = async () => {
      try {
        const setStr = await AsyncStorage.getItem('currentSet');
        const lessonStr = await AsyncStorage.getItem('currentLesson');
        if (setStr != null && lessonStr != null) {
          setOverrideProgress({
            setNumber: parseInt(setStr, 10),
            lessonNumber: parseInt(lessonStr, 10),
          });
        }
      } catch (e) {
        // ignore errors
      }
    };
    loadOverride();
  }, []);
  // Load saved profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await AsyncStorage.getItem('user');
        if (data) setProfile(JSON.parse(data));
      } catch (e) {
        // ignore errors
      }
    };
    loadProfile();
  }, []);

  

  if (showSplash) {
    return <Splash />;
  }
  const handleStartSignIn = (user) => {
    saveProfile(user);
  };
  
  // Save override progress (or clear if null)
  const saveOverrideProgress = async (progress) => {
    setOverrideProgress(progress);
    try {
      if (progress) {
        await AsyncStorage.setItem('currentSet', progress.setNumber.toString());
        await AsyncStorage.setItem('currentLesson', progress.lessonNumber.toString());
      } else {
        await AsyncStorage.removeItem('currentSet');
        await AsyncStorage.removeItem('currentLesson');
      }
    } catch (e) {
      // ignore errors
    }
  };
  const handleContinueGuest = () => setShowSetup(true);
  const goHome = () => setNav({ screen: 'home' });
  const visitGrade = (g) => {
    setVisitedGrades(prev => {
      const updated = { ...prev, [g]: true };
      if (updated[1] && updated[2] && updated[3] && updated[4]) {
        awardAchievement('explorer');
      }
      return updated;
    });
  };
  const goGrade1 = () => { visitGrade(1); setNav({ screen: 'grade1' }); };
  const goGrade2 = () => { visitGrade(2); setNav({ screen: 'grade2' }); };
  const goGrades = () => setNav({ screen: 'grades' });
  const goClass = () => setNav({ screen: 'class' });
  const goGrade3 = () => { visitGrade(3); setNav({ screen: 'grade3' }); };
  const goGrade4 = () => { visitGrade(4); setNav({ screen: 'grade4' }); };
  const goSettings = () => setNav({ screen: 'settings' });
  const goAchievements = () => setNav({ screen: 'achievements' });
  const goGames = () => setNav({ screen: 'games' });
  const goGrade2Set = (setNumber) => setNav({ screen: 'grade2Set', setNumber });
  // Navigate to "coming soon" for Grade 2 - Book 3-2 from Grades screen
  const goGrade2Coming = () => setNav({ screen: 'grade2Coming' });
  const goGrade2Lesson = (lessonNumber) => setNav(prev => ({ screen: 'grade2Lesson', setNumber: prev.setNumber, lessonNumber }));
  const goBackToGrade2Set = () => setNav(prev => ({ screen: 'grade2Set', setNumber: prev.setNumber }));
  const goBackToGrade2 = () => setNav({ screen: 'grade2' });
  const goPractice = (quote) => setNav(prev => ({
    screen: 'practice',
    quote,
    setNumber: prev.setNumber,
    lessonNumber: prev.lessonNumber,
  }));
  const goTapGame = (quote) => {
    markGamePlayed();
    setNav(prev => ({
      screen: 'tapGame',
      quote,
      setNumber: prev.setNumber,
      lessonNumber: prev.lessonNumber,
    }));
  };
  const goScrambleGame = (quote) => {
    markGamePlayed();
    setNav(prev => ({
      screen: 'scrambleGame',
      quote,
      setNumber: prev.setNumber,
      lessonNumber: prev.lessonNumber,
    }));
  };
  const goNextWordGame = (quote) => {
    markGamePlayed();
    setNav(prev => ({
      screen: 'nextWordGame',
      quote,
      setNumber: prev.setNumber,
      lessonNumber: prev.lessonNumber,
    }));
  };
  const goMemoryGame = (quote) => {
    markGamePlayed();
    setNav(prev => ({
      screen: 'memoryGame',
      quote,
      setNumber: prev.setNumber,
      lessonNumber: prev.lessonNumber,
    }));
  };
  const goFlashGame = (quote) => {
    markGamePlayed();
    setNav(prev => ({
      screen: 'flashGame',
      quote,
      setNumber: prev.setNumber,
      lessonNumber: prev.lessonNumber,
    }));
  };
  const goRevealGame = (quote) => {
    markGamePlayed();
    setNav(prev => ({
      screen: 'revealGame',
      quote,
      setNumber: prev.setNumber,
      lessonNumber: prev.lessonNumber,
    }));
  };
  const goFirstLetterGame = (quote) => {
    markGamePlayed();
    setNav(prev => ({
      screen: 'firstLetterGame',
      quote,
      setNumber: prev.setNumber,
      lessonNumber: prev.lessonNumber,
    }));
  };
  const goLetterScrambleGame = (quote) => {
    markGamePlayed();
    setNav(prev => ({
      screen: 'letterScrambleGame',
      quote,
      setNumber: prev.setNumber,
      lessonNumber: prev.lessonNumber,
    }));
  };
  const goFastTypeGame = (quote) => {
    markGamePlayed();
    setNav(prev => ({
      screen: 'fastTypeGame',
      quote,
      setNumber: prev.setNumber,
      lessonNumber: prev.lessonNumber,
    }));
  };
  const goHangmanGame = (quote) => {
    markGamePlayed();
    setNav(prev => ({
      screen: 'hangmanGame',
      quote,
      setNumber: prev.setNumber,
      lessonNumber: prev.lessonNumber,
    }));
  };
  const goFillBlankGame = (quote) => {
    markGamePlayed();
    setNav(prev => ({
      screen: 'fillBlankGame',
      quote,
      setNumber: prev.setNumber,
      lessonNumber: prev.lessonNumber,
    }));
  };

  const playSelectedGame = (gameId) => {
    const { setNumber, lessonNumber } = getCurrentProgress();
    let content = '';
    if (profile?.grade === 1) {
      const lesson = grade1Lessons.find(l => l.lesson === lessonNumber);
      content = lesson ? lesson.quote : '';
    } else if (profile?.grade === 2) {
      content = quoteMap[`${setNumber}-${lessonNumber}`] || '';
    }
    if (gameId === 'practice') {
      goPractice(content);
    } else if (gameId === 'tapGame') {
      goTapGame(content);
    } else if (gameId === 'scrambleGame') {
      goScrambleGame(content);
    } else if (gameId === 'nextWordGame') {
      goNextWordGame(content);
    } else if (gameId === 'memoryGame') {
      goMemoryGame(content);
    } else if (gameId === 'flashGame') {
      goFlashGame(content);
    } else if (gameId === 'revealGame') {
      goRevealGame(content);
    } else if (gameId === 'firstLetterGame') {
      goFirstLetterGame(content);
    } else if (gameId === 'letterScrambleGame') {
      goLetterScrambleGame(content);
    } else if (gameId === 'fastTypeGame') {
      goFastTypeGame(content);
    } else if (gameId === 'hangmanGame') {
      goHangmanGame(content);
    } else if (gameId === 'fillBlankGame') {
      goFillBlankGame(content);
    } else {
      goPractice(content);
    }
  };
  const goBackToLesson = () => setNav(prev => ({ screen: 'grade2Lesson', setNumber: prev.setNumber, lessonNumber: prev.lessonNumber }));

  // Navigation for Grade 1 lessons
  const goGrade1Lesson = (lessonNumber) => setNav({ screen: 'grade1Lesson', lessonNumber });
  const goBackToGrade1Set = () => setNav({ screen: 'grade1' });


  const saveProfile = async (p) => {
    setProfile(p);
    try {
      await AsyncStorage.setItem('profile', JSON.stringify(p));
    } catch (e) {
      // ignore errors
    }
    awardAchievement('profile');
  };

  const addScore = async (value) => {
    if (!profile) return;
    const updated = { ...profile, score: (profile.score || 0) + value };
    await saveProfile(updated);
  };

  const markGamePlayed = () => {
    setGamesPlayed(n => {
      const total = n + 1;
      if (total >= 1) awardAchievement('game1');
      if (total >= 10) awardAchievement('game10');
      return total;
    });
  };

  const awardAchievement = (id) => {
    setAchievements(a => a.map(ach => {
      if (ach.id === id && !ach.earned) {
        addScore(ach.points || 0);
        return { ...ach, earned: true };
      }
      return ach;
    }));
  };

  const markDaily = () => {
    awardAchievement('daily');
  };

  const completeLesson = (setNumber, lessonNumber) => {
    setCompletedLessons(prev => {
      const lessons = prev[setNumber] || {};
      const updated = { ...prev, [setNumber]: { ...lessons, [lessonNumber]: true } };
      if (updated[setNumber] && updated[setNumber][1] && updated[setNumber][2] && updated[setNumber][3]) {
        awardAchievement(`set${setNumber}`);
      }
      // After completing sets 1-3, award grade2 achievement
      if ([1, 2, 3].every(num => {
        const lessonsInSet = updated[num];
        return lessonsInSet && lessonsInSet[1] && lessonsInSet[2] && lessonsInSet[3];
      })) {
        awardAchievement('grade2');
      }
      return updated;
    });
  };

  // Handle "Go to Lesson" navigation based on current profile grade
  const handleGoLesson = () => {
    if (profile.grade === 1) goGrade1();
    else if (profile.grade === 2) goGrade2();
    else if (profile.grade === 3) goGrade3();
    else if (profile.grade === 4) goGrade4();
    else goHome();
  };

  // Handle "Go to Set" navigation based on current profile grade
  const handleGoSet = () => {
    if (profile.grade === 1) goGrade1();
    else if (profile.grade === 2) goGrade2();
    else if (profile.grade === 3) goGrade3();
    else if (profile.grade === 4) goGrade4();
    else goGrades();
  };

  // Determine current set and lesson based on completed lessons
  const getCurrentProgress = () => {
    if (overrideProgress) return overrideProgress;
    if (!profile) return { setNumber: 1, lessonNumber: 1 };
    const gradeNum = profile.grade;
    // Default to first set and first lesson
    let setNumber = 1;
    let lessonNumber = 1;
    // Use completedLessons to find next uncompleted lesson in set 1
    const completed = completedLessons[setNumber] || {};
    while (completed[lessonNumber]) {
      lessonNumber += 1;
    }
    return { setNumber, lessonNumber };
  };

  // Handle navigation to the current lesson directly
  const handleGoCurrentLesson = () => {
    const { setNumber, lessonNumber } = getCurrentProgress();
    if (profile.grade === 1) {
      goGrade1Lesson(lessonNumber);
    } else if (profile.grade === 2) {
      setNav({ screen: 'grade2Lesson', setNumber, lessonNumber });
    } else if (profile.grade === 3) {
      goGrade3();
    } else if (profile.grade === 4) {
      goGrade4();
    }
  };

  // Handle daily challenge for current lesson (practice prayer or quote)
  const handleDailyChallenge = () => {
    markDaily();
    const { setNumber, lessonNumber } = getCurrentProgress();
    // Determine quote for current lesson
    let content = '';
    if (profile.grade === 1) {
      const lesson = grade1Lessons.find(l => l.lesson === lessonNumber);
      content = lesson ? lesson.quote : '';
    } else if (profile.grade === 2) {
      // Grade 2 quotes from data/grade2
      content = quoteMap[`${setNumber}-${lessonNumber}`] || '';
    }
    // Pick a random game and navigate accordingly
    const gameId = pickRandomGame();
    if (gameId === 'practice') {
      goPractice(content);
    } else if (gameId === 'tapGame') {
      goTapGame(content);
    } else if (gameId === 'scrambleGame') {
      goScrambleGame(content);
    } else if (gameId === 'nextWordGame') {
      goNextWordGame(content);
    } else if (gameId === 'memoryGame') {
      goMemoryGame(content);
    } else if (gameId === 'flashGame') {
      goFlashGame(content);
    } else if (gameId === 'revealGame') {
      goRevealGame(content);
    } else if (gameId === 'firstLetterGame') {
      goFirstLetterGame(content);
    } else if (gameId === 'letterScrambleGame') {
      goLetterScrambleGame(content);
    } else if (gameId === 'fastTypeGame') {
      goFastTypeGame(content);
    } else if (gameId === 'hangmanGame') {
      goHangmanGame(content);
    } else if (gameId === 'fillBlankGame') {
      goFillBlankGame(content);
    } else {
      // Fallback: use practice
      goPractice(content);
    }
  };


  
  // Wipe profile and score for testing
  const wipeProfile = async () => {
    try {
      await AsyncStorage.removeItem('profile');
    } catch (e) {
      // ignore errors
    }
    setProfile(null);
    setShowSetup(false);
  };

  // Render the appropriate screen
  const renderScreen = () => {
    if (!profile) {
      if (!showSetup) {
        return (
          <StartScreen
            onSignIn={handleStartSignIn}
            onGuest={handleContinueGuest}
          />
        );
      }
      return <ProfileSetupScreen onSave={saveProfile} />;
    }
    // Grade 1 screens: set and lesson
    if (nav.screen === 'grade1') return <Grade1SetScreen onBack={goHome} onLessonSelect={goGrade1Lesson} />;
    if (nav.screen === 'grade1Lesson') return <Grade1LessonScreen lessonNumber={nav.lessonNumber} onBack={goBackToGrade1Set} />;
    if (nav.screen === 'grade2Lesson') return <Grade2LessonScreen setNumber={nav.setNumber} lessonNumber={nav.lessonNumber} onBack={goBackToGrade2Set} onComplete={completeLesson} onPractice={goPractice} onPlayGame={goTapGame} />;
    if (nav.screen === 'practice')
      return (
        <QuotePracticeScreen
          quote={nav.quote}
          onBack={goBackToLesson}
        />
      );
    if (nav.screen === 'tapGame') return <TapMissingWordsGame quote={nav.quote} onBack={goBackToLesson} />;
    if (nav.screen === 'scrambleGame')
      return <TapScrambledGame quote={nav.quote} onBack={goBackToLesson} />;
    if (nav.screen === 'nextWordGame')
      return <NextWordQuizGame quote={nav.quote} onBack={goBackToLesson} />;
    if (nav.screen === 'memoryGame')
      return <MemoryMatchGame quote={nav.quote} onBack={goBackToLesson} />;
    if (nav.screen === 'flashGame')
      return <FlashCardRecallGame quote={nav.quote} onBack={goBackToLesson} />;
    if (nav.screen === 'revealGame')
      return <RevealWordGame quote={nav.quote} onBack={goBackToLesson} />;
    if (nav.screen === 'firstLetterGame')
      return <FirstLetterQuizGame quote={nav.quote} onBack={goBackToLesson} />;
    if (nav.screen === 'letterScrambleGame')
      return <LetterScrambleGame quote={nav.quote} onBack={goBackToLesson} />;
    if (nav.screen === 'fastTypeGame')
      return <FastTypeGame quote={nav.quote} onBack={goBackToLesson} />;
    if (nav.screen === 'hangmanGame')
      return <HangmanGame quote={nav.quote} onBack={goBackToLesson} />;
    if (nav.screen === 'fillBlankGame')
      return <FillBlankTypingGame quote={nav.quote} onBack={goBackToLesson} />;
    if (nav.screen === 'grade2Set') {
      const backHandler = nav.setNumber === 2 ? goHome : goBackToGrade2;
      return <Grade2SetScreen setNumber={nav.setNumber} onLessonSelect={goGrade2Lesson} onBack={backHandler} />;
    }
    if (nav.screen === 'grade2') return <Grade2Screen onSetSelect={goGrade2Set} onBack={goHome} />;
    if (nav.screen === 'grade2Coming') {
      // Coming soon for Grade 2 - Book 3-2
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Grade 2 - Book 3-2</Text>
          <Text style={styles.subtitle}>Content coming soon</Text>
          <View style={styles.buttonContainer}>
            <ThemedButton title="Back" onPress={goGrades} />
          </View>
        </View>
      );
    }
    if (nav.screen === 'grade3') return <Grade3Screen onBack={goHome} />;
    if (nav.screen === 'grade4') return <Grade4Screen onBack={goHome} />;
    if (nav.screen === 'achievements') return <AchievementsScreen achievements={achievements} />;
    if (nav.screen === 'games') return <GamesListScreen onSelect={playSelectedGame} />;
    if (nav.screen === 'settings') {
      return (
        <SettingsScreen
          profile={profile}
          currentProgress={getCurrentProgress()}
          overrideProgress={overrideProgress}
          onSaveOverride={saveOverrideProgress}
          onBack={goHome}
          onReset={wipeProfile}
        />
      );
    }
    // Class page
    if (nav.screen === 'class') {
      // Pass aggregated classes from user context
      return <ClassScreen classes={classes || []} onBack={goHome} />;
    }
    // Grades pick screen
    if (nav.screen === 'grades') {
      return (
        <GradesScreen
          onGradeSelect={(g, setNumber) => {
            if (g === 1) {
              goGrade1();
            } else if (g === 2) {
              // Book 3-2 is coming soon: show coming soon screen
              if (setNumber === 2) {
                goGrade2Coming();
              } else if (setNumber) {
                // Navigate to specific set (for Book 3-1 and others)
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
    }
    // Default: home screen (profile overview)
      const { setNumber, lessonNumber } = getCurrentProgress();
      // Determine current content: prayer for Grade 1, quote for Grade 2
      const content = profile.grade === 1
        ? (grade1Lessons.find(l => l.lesson === lessonNumber)?.prayer || '')
        : profile.grade === 2
          ? (quoteMap[`${setNumber}-${lessonNumber}`] || '')
          : '';
      return (
        <HomeScreen
          profile={profile}
          achievements={achievements}
          content={content}
          onDailyChallenge={handleDailyChallenge}
          onGoCurrentLesson={handleGoCurrentLesson}
          onGoSet={handleGoSet}
          // show class button only if there are any classes in context
          onSeeClass={classes?.length > 0 ? goClass : undefined}
          currentSet={setNumber}
          currentLesson={lessonNumber}
          onProfilePress={() => setChooseChildVisible(true)}
        />
      );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* if multiple children, show chooser modal */}
      {chooseChildVisible && (
        <Modal visible transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Who are you?</Text>
              <FlatList
                data={children}
                keyExtractor={item => item.child._id}
                renderItem={({ item }) => {
                  // extract the child object and compute full name
                  const childObj = item.child;
                  const fullName = `${childObj.firstName} ${childObj.lastName}`;
                  const selected = { ...childObj, name: fullName };
                  return (
                    <TouchableOpacity
                      style={styles.childButton}
                      onPress={() => {
                        setProfile(selected);
                        setUser(selected);
                        setChooseChildVisible(false);
                      }}
                    >
                      <Avatar size={40} name={fullName} variant="beam" />
                      <Text style={styles.childText}>{fullName}</Text>
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          </View>
        </Modal>
      )}
      <View style={styles.container}>
        {renderScreen()}
      </View>
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={goHome}>
          <FontAwesomeIcon icon={faHome} size={24} color="#333" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={goGrades}>
          <FontAwesomeIcon icon={faBook} size={24} color="#333" />
          <Text style={styles.navText}>Grade</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={goGames}>
          <FontAwesomeIcon icon={faGamepad} size={24} color="#333" />
          <Text style={styles.navText}>Game</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={goAchievements}>
          <FontAwesomeIcon icon={faTrophy} size={24} color="#333" />
          <Text style={styles.navText}>Badges</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={goSettings}>
          <FontAwesomeIcon icon={faCog} size={24} color="#333" />
          <Text style={styles.navText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const App = () => (
  <UserProvider>
    <MainApp />
  </UserProvider>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Allow screens to fill full width and align at top
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    // Horizontal padding can be managed within individual screens as needed
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 32,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  buttonContainer: {
    width: '80%',
    marginVertical: 8,
  },
  tileContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  tile: {
    backgroundColor: '#f0f0f0',
    width: '48%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 10,
    marginBottom: 16,
    borderRadius: 8,
  },
  tileTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tileInfo: {
    fontSize: 14,
    textAlign: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 8,
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
    color: '#333',
  },
  // Home/profile overview styles
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileTextContainer: {
    marginLeft: 12,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileGrade: {
    fontSize: 16,
  },
  scoreText: {
    fontSize: 16,
    marginBottom: 16,
  },
  homeButtonContainer: {
    width: '80%',
    marginVertical: 8,
  },
  // Modal styles for choosing a child
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    width: '80%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  childButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  childAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  childText: {
    fontSize: 16,
    marginLeft: 12,
  },
});

export default App;