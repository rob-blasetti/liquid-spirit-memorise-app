import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, Modal, FlatList, Image } from 'react-native';
import Avatar from '@flipxyz/react-native-boring-avatars';
import ThemedButton from './ThemedButton';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
// import Grade1Screen from './screens/Grade1Screen';
import { gameScreens } from '../games/gameRoutes';
import { launchImageLibrary } from 'react-native-image-picker';
import { grade1Lessons } from '../data/grade1';
import { quoteMap } from '../data/grade2';
import { quoteMap as quoteMap2b } from '../data/grade2b';
import { achievements as defaultAchievements } from '../data/achievements';
import { useUser } from '../contexts/UserContext';
import { useDifficulty } from '../contexts/DifficultyContext';
import styles from '../styles/mainAppStyles';
import { pickRandomGame } from '../games';
import {
  loadProfile,
  loadGuestProfile,
  saveProfile as persistProfile,
  deleteGuestProfile,
  clearProfile,
} from '../services/profileService';
import speechService from '../services/speechService';
import NotificationBanner from './NotificationBanner';
import DifficultyFAB from './DifficultyFAB';
import BottomNav from '../navigation/BottomNav';
import AuthNavigator from '../navigation/AuthNavigator';
import { NavigationContainer } from '@react-navigation/native';

 const MainApp = () => {
  // access user context (user, family, children, classes)
  const { classes, children, setUser } = useUser();
  const { level } = useDifficulty();
  const [showSplash, setShowSplash] = useState(true);
  const [nav, setNav] = useState({ screen: 'home' });
  const [profile, setProfile] = useState(null);
  // Handler to change profile image
  const changeAvatar = async () => {
    try {
      const result = await launchImageLibrary({ mediaType: 'photo', quality: 1, includeBase64: true });
      if (result.didCancel) return;
      if (result.errorCode) {
        console.warn('ImagePicker Error: ', result.errorMessage);
        return;
      }
      const asset = result.assets && result.assets[0];
      if (asset && asset.base64) {
        const type = asset.type || 'image/jpeg';
        const newAvatar = `data:${type};base64,${asset.base64}`;
        const updatedProfile = { ...profile, avatar: newAvatar };
        // Update profile state and persist to storage
        setProfile(updatedProfile);
        // Persist to profile storage
        await persistProfile(updatedProfile);
        // Also update user context
        setUser(updatedProfile);
      }
    } catch (e) {
      console.error('Failed to pick image:', e);
    }
  };
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
  const [notification, setNotification] = useState(null);
  // Persisted guest profile
  const [guestProfile, setGuestProfile] = useState(null);
  // Delete guest account handler
  const deleteGuestAccount = async () => {
    await deleteGuestProfile();
    setGuestProfile(null);
    // If currently using guest profile, clear active profile state and reset achievements
    if (profile && profile.guest) {
      setProfile(null);
      setAchievements(defaultAchievements);
    }
    setChooseChildVisible(false);
  };
  const [achievements, setAchievements] = useState(defaultAchievements);
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
    const fetchProfiles = async () => {
      const prof = await loadProfile();
      if (prof) {
        setProfile(prof);
        // Sync context user with loaded profile
        setUser({ ...prof });
        if (prof.achievements) {
          setAchievements(prof.achievements);
        }
      }
      const guest = await loadGuestProfile();
      if (guest) {
        setGuestProfile(guest);
      }
    };
    fetchProfiles();
  }, []);

  if (showSplash) {
    return <Splash />;
  }
  const handleStartSignIn = (user) => {
    // Determine initial profile for sign-in: for LS login, choose first child
    let profileToSave;
    if (Array.isArray(user.children) && user.children.length > 0) {
      // Select first child by default, ensuring numeric grade
      const firstChild = user.children[0];
      const fullName = firstChild.firstName && firstChild.lastName
        ? `${firstChild.firstName} ${firstChild.lastName}`
        : firstChild.name || '';
      const gradeNum = typeof firstChild.grade === 'string'
        ? parseInt(firstChild.grade, 10)
        : firstChild.grade;
      profileToSave = {
        ...firstChild,
        name: fullName,
        grade: gradeNum,
        guest: false,
        // include list of all children for account switching
        children: user.children,
      };
    } else {
      // Fallback for guest or single-profile users: preserve '2b' or parse numeric grade
      const gradeVal = user.guest
        ? user.grade
        : typeof user.grade === 'string'
        ? parseInt(user.grade, 10)
        : user.grade;
      profileToSave = { ...user, grade: gradeVal, guest: !!user.guest };
    }
    // Clear previous progress and selections for new login
    setOverrideProgress(null);
    AsyncStorage.removeItem('currentSet');
    AsyncStorage.removeItem('currentLesson');
    setCompletedLessons({});
    setVisitedGrades({});
    // Save authenticated user profile
    saveProfile(profileToSave);
    // Clear navigation and progress for new session
    setNav({ screen: 'home' });
    setOverrideProgress(null);
    AsyncStorage.removeItem('currentSet');
    AsyncStorage.removeItem('currentLesson');
    setCompletedLessons({});
    setVisitedGrades({});
    // Award initial profile achievement
    awardAchievement('profile');
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
  const goClass = () => setNav({ screen: 'class', classes: classes || [] });
  const goGrade3 = () => { visitGrade(3); setNav({ screen: 'grade3' }); };
  const goGrade4 = () => { visitGrade(4); setNav({ screen: 'grade4' }); };
  const goSettings = () => setNav({ screen: 'settings' });
  const goAchievements = () => setNav({ screen: 'achievements' });
  const goGames = () => setNav({ screen: 'games' });
  const goGrade2Set = (setNumber) => setNav({ screen: 'grade2Set', setNumber });
  const goGrade2b = () => { visitGrade(2); setNav({ screen: 'grade2b' }); };
  const goGrade2bSet = (setNumber) => setNav({ screen: 'grade2bSet', setNumber });
  const goGrade2bLesson = (lessonNumber) =>
    setNav(prev => ({ screen: 'grade2bLesson', setNumber: prev.setNumber, lessonNumber }));
  const goBackToGrade2bSet = () => setNav(prev => ({ screen: 'grade2bSet', setNumber: prev.setNumber }));
  const goBackToGrade2b = () => setNav({ screen: 'grade2b' });
  const goGrade2Lesson = (lessonNumber) => setNav(prev => ({ screen: 'grade2Lesson', setNumber: prev.setNumber, lessonNumber }));
  const goBackToGrade2Set = () => setNav(prev => ({ screen: 'grade2Set', setNumber: prev.setNumber }));
  const goBackToGrade2 = () => setNav({ screen: 'grade2' });
  const goPractice = (quote) => setNav(prev => ({
    screen: 'practice',
    quote,
    setNumber: prev.setNumber,
    lessonNumber: prev.lessonNumber,
  }));

  const goGame = (gameId, quote, fromGames = false) => {
    markGamePlayed();
    setNav(prev => ({
      screen: gameId,
      quote,
      setNumber: prev.setNumber,
      lessonNumber: prev.lessonNumber,
      fromGames,
      lessonScreen: prev.screen,
    }));
  };

  const playSelectedGame = (gameId) => {
    const { setNumber, lessonNumber } = getCurrentProgress();
    let content = '';
    if (profile?.grade === 1) {
      const lesson = grade1Lessons.find(l => l.lesson === lessonNumber);
      content = lesson ? lesson.quote : '';
    } else if (profile?.grade === 2) {
      const qObj = quoteMap[`${setNumber}-${lessonNumber}`];
      content = qObj || '';
    }
    // Navigate to the selected game; treat all games (including practice) uniformly
    goGame(gameId, content, true);
  };
  const goBackToLesson = () =>
    setNav(prev => ({
      screen: prev.lessonScreen === 'grade2bLesson' ? 'grade2bLesson' : 'grade2Lesson',
      setNumber: prev.setNumber,
      lessonNumber: prev.lessonNumber,
    }));

  // Navigation for Grade 1 lessons
  const goGrade1Lesson = (lessonNumber) => setNav({ screen: 'grade1Lesson', lessonNumber });
  const goBackToGrade1Set = () => setNav({ screen: 'grade1' });


  const saveProfile = async (p) => {
    // Merge with current achievements if not provided
    const newProfile = { ...p };
    if (!newProfile.achievements) {
      newProfile.achievements = achievements;
    }
    setProfile(newProfile);
    await persistProfile(newProfile);
    if (newProfile.guest) {
      setGuestProfile(newProfile);
    }
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
    if (!profile) return;
    setAchievements(prev => {
      // Find the achievement by id
      const ach = prev.find(a => a.id === id);
      // If not found or already earned, do nothing
      if (!ach || ach.earned) {
        return prev;
      }
      // Mark achievement as earned
      const updated = prev.map(a => a.id === id ? { ...a, earned: true } : a);
      // Recalculate total score from earned achievements
      const newScore = updated.reduce((sum, a) => sum + (a.earned && a.points ? a.points : 0), 0);
      // Persist updated profile (score + achievements)
      saveProfile({ ...profile, achievements: updated, score: newScore });
      // Show notification for newly earned achievement
      setNotification({ id, title: ach.title });
      return updated;
    });
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
    if (profile.grade === '2b') goGrade2b();
    else if (profile.grade === 1) goGrade1();
    else if (profile.grade === 2) goGrade2();
    else if (profile.grade === 3) goGrade3();
    else if (profile.grade === 4) goGrade4();
    else goGrades();
  };

  // Determine current set and lesson based on completed lessons
  const getCurrentProgress = () => {
    if (overrideProgress) return overrideProgress;
    if (!profile) return { setNumber: 1, lessonNumber: 1 };
    // Default starting set based on grade (Grade 2b starts at set 4)
    const startingSet = profile.grade === '2b' ? 4 : 1;
    let setNumber = startingSet;
    let lessonNumber = 1;
    // Find next uncompleted lesson in the starting set
    const completed = completedLessons[setNumber] || {};
    while (completed[lessonNumber]) {
      lessonNumber += 1;
    }
    return { setNumber, lessonNumber };
  };

  // Handle navigation to the current lesson directly
  const handleGoCurrentLesson = () => {
    const { setNumber, lessonNumber } = getCurrentProgress();
    if (profile.grade === '2b') {
      setNav({ screen: 'grade2bLesson', setNumber, lessonNumber });
    } else if (profile.grade === 1) {
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
      // Grade 2 quotes for sets 1-3 (Book 3-1) or sets 4-7 (Book 3-2)
      const key = `${setNumber}-${lessonNumber}`;
      const qObj = setNumber <= 3
        ? quoteMap[key]
        : quoteMap2b[key];
      content = qObj || '';
    }
    // Pick a random game and navigate accordingly
    const gameId = pickRandomGame();
    if (gameId === 'practice') {
      goPractice(content);
    } else {
      goGame(gameId, content);
    }
  };


  
  // Wipe profile and score for testing
  const wipeProfile = async () => {
    await clearProfile();
    setProfile(null);
    // Reset achievements to defaults when wiping profile
    setAchievements(defaultAchievements);
  };

  // Render the appropriate screen
  const renderScreen = () => {
    if (!profile) {
      return (
        <NavigationContainer>
          <AuthNavigator onSignIn={handleStartSignIn} />
        </NavigationContainer>
      );
    }
    // Grade 1 screens: set and lesson
    if (nav.screen === 'grade1') return <Grade1SetScreen onBack={goHome} onLessonSelect={goGrade1Lesson} />;
    if (nav.screen === 'grade1Lesson') return <Grade1LessonScreen lessonNumber={nav.lessonNumber} onBack={goBackToGrade1Set} />;
    if (nav.screen === 'grade2Lesson')
      return (
        <Grade2LessonScreen
          setNumber={nav.setNumber}
          lessonNumber={nav.lessonNumber}
          onBack={goBackToGrade2Set}
          onComplete={completeLesson}
          onPractice={goPractice}
          onPlayGame={(q) => goGame('tapGame', q)}
        />
      );
    if (nav.screen === 'grade2bLesson')
      return (
        <Grade2bLessonScreen
          setNumber={nav.setNumber}
          lessonNumber={nav.lessonNumber}
          onBack={goBackToGrade2bSet}
          onComplete={completeLesson}
          onPractice={goPractice}
          onPlayGame={(q) => goGame('tapGame', q)}
        />
      );
    if (gameScreens[nav.screen]) {
      const GameComponent = gameScreens[nav.screen];
      const backHandler = nav.fromGames ? goGames : goBackToLesson;
      // Props to pass to game component
      const gameProps = { quote: nav.quote, onBack: backHandler };
      // Award achievements based on game and difficulty level
      if (nav.screen === 'memoryGame') {
        gameProps.onWin = () => awardAchievement(`memory${level}`);
      } else if (nav.screen === 'shapeBuilderGame') {
        gameProps.onWin = () => awardAchievement(`shape${level}`);
      } else if (nav.screen === 'hangmanGame') {
        gameProps.onWin = () => awardAchievement(`hangman${level}`);
      }
      return (
        <View style={{ flex: 1 }}>
          <GameComponent {...gameProps} />
          <DifficultyFAB />
        </View>
      );
    }
    if (nav.screen === 'grade2Set') {
      return (
        <Grade2SetScreen
          setNumber={nav.setNumber}
          onLessonSelect={goGrade2Lesson}
          onBack={goBackToGrade2}
        />
      );
    }
    if (nav.screen === 'grade2bSet') {
      return (
        <Grade2bSetScreen
          setNumber={nav.setNumber}
          onLessonSelect={goGrade2bLesson}
          onBack={goBackToGrade2b}
        />
      );
    }
    if (nav.screen === 'grade2') return <Grade2Screen onSetSelect={goGrade2Set} onBack={goHome} />;
    if (nav.screen === 'grade2b') return <Grade2bScreen onSetSelect={goGrade2bSet} onBack={goHome} />;
    if (nav.screen === 'grade3') return <Grade3Screen onBack={goHome} />;
    if (nav.screen === 'grade4') return <Grade4Screen onBack={goHome} />;
    if (nav.screen === 'achievements') {
      return (
        <AchievementsScreen
          achievements={achievements}
          highlightId={nav.highlight}
        />
      );
    }
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
          onSaveProfile={saveProfile}
        />
      );
    }
    // Class page
    if (nav.screen === 'class') {
      // Pass aggregated classes from user context
      return <ClassScreen childEntries={children || []} onBack={goHome} />;
    }
    // Grades pick screen
    if (nav.screen === 'grades') {
      return (
        <GradesScreen
          onGradeSelect={(g, setNumber) => {
            if (g === 1) {
              goGrade1();
            } else if (g === 2) {
              if (setNumber === 2) {
                goGrade2b();
              } else if (setNumber) {
                // Navigate to specific set (for Book 3-1)
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
      // Determine current content: prayer for Grade 1, quote for Grade 2 (Book 3-1 sets 1-3 or Book 3-2 sets 4-7)
      let content = '';
      if (profile.grade === 1) {
        content = grade1Lessons.find(l => l.lesson === lessonNumber)?.prayer || '';
      } else if (profile.grade === '2b') {
        const key = `${setNumber}-${lessonNumber}`;
        content = quoteMap2b[key] || '';
      } else if (profile.grade === 2) {
        const key = `${setNumber}-${lessonNumber}`;
        const cObj = setNumber <= 3 ? quoteMap[key] : quoteMap2b[key];
        content = cObj || '';
      }
      return (
        <HomeScreen
          profile={profile}
          achievements={achievements}
          content={content}
          onDailyChallenge={handleDailyChallenge}
          onTestMemory={() => goGame('memoryGame', content)}
          onSeeClass={goClass}
          onGoToSet={handleGoSet}
          onGoToLesson={handleGoCurrentLesson}
          currentSet={setNumber}
          currentLesson={lessonNumber}
          onProfilePress={() => setChooseChildVisible(true)}
          onAvatarPress={changeAvatar}
        />
      );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Notification banner */}
      {notification && (
        <NotificationBanner
          title={notification.title}
          onPress={() => {
            setNav({ screen: 'achievements', highlight: notification.id });
            setNotification(null);
          }}
          onHide={() => setNotification(null)}
        />
      )}
      {/* if multiple children, show chooser modal */}
      {chooseChildVisible && (
        <Modal visible transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Change Account</Text>
              {/* Guest account */}
              {guestProfile && (
                <>
                  <TouchableOpacity
                    style={styles.childButton}
                    onPress={() => {
                      // Switch to guest account
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
                    <Text style={styles.childText}>{guestProfile.name} (Guest)</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteButton} onPress={deleteGuestAccount}>
                    <Text style={styles.deleteButtonText}>Delete Guest Account</Text>
                  </TouchableOpacity>
                  <View style={styles.divider} />
                </>
              )}
              <FlatList
                data={children}
                keyExtractor={item => {
                  const childObj = item.child || item;
                  return childObj._id;
                }}
                renderItem={({ item }) => {
                  // Support both entry shapes: { child, classes } or child object directly
                  const entry = item.child ? item : { child: item, classes: [] };
                  const childObj = entry.child;
                  const fullName = `${childObj.firstName} ${childObj.lastName}`;
                  const gradeNum = typeof childObj.grade === 'string'
                    ? parseInt(childObj.grade, 10)
                    : childObj.grade;
                  const selected = { ...childObj, name: fullName, grade: gradeNum };
                  return (
                    <TouchableOpacity
                      style={styles.childButton}
                      onPress={() => {
                        // Switch to selected child account
                        const childAchievements = selected.achievements || defaultAchievements;
                        const childScore = selected.score || 0;
                        setAchievements(childAchievements);
                        // Save profile of selected child (no children list)
                        saveProfile({
                          ...selected,
                          guest: false,
                          achievements: childAchievements,
                          score: childScore,
                        });
                        // Update user context
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
      <BottomNav
        goHome={goHome}
        goGrades={goGrades}
        goClass={goClass}
        goGames={goGames}
        goAchievements={goAchievements}
        goSettings={goSettings}
        // Pass current active screen to highlight the corresponding tab
        activeScreen={nav.screen}
      />
    </SafeAreaView>
  );
};

export default MainApp;
