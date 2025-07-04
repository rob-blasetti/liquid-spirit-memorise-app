import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, Button, TouchableOpacity, Modal, FlatList, Image } from 'react-native';
import Avatar from '@flipxyz/react-native-boring-avatars';
import ThemedButton from './ThemedButton';
import GradesScreen from '../screens/GradesScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Use FontAwesome via @fortawesome/react-native-fontawesome
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTrash, faHome, faBook, faTrophy, faCog, faGamepad, faChalkboardTeacher } from '@fortawesome/free-solid-svg-icons';
// import Grade1Screen from './screens/Grade1Screen';
import Grade2Screen from '../screens/Grade2Screen';
import Grade2SetScreen from '../screens/Grade2SetScreen';
import Grade2LessonScreen from '../screens/Grade2LessonScreen';
import Grade3Screen from '../screens/Grade3Screen';
import Grade4Screen from '../screens/Grade4Screen';
import SettingsScreen from '../screens/SettingsScreen';
import AchievementsScreen from '../screens/AchievementsScreen';
import { gameScreens } from '../games/gameRoutes';
import ProfileSetupScreen from '../screens/ProfileSetupScreen';
import { launchImageLibrary } from 'react-native-image-picker';
import HomeScreen from '../screens/HomeScreen';
import { grade1Lessons } from '../data/grade1';
import { quoteMap } from '../data/grade2';
import { achievements as defaultAchievements } from '../data/achievements';
import StartScreen from '../screens/StartScreen';
import Splash from '../screens/Splash';
import Grade1SetScreen from '../screens/Grade1SetScreen';
import Grade1LessonScreen from '../screens/Grade1LessonScreen';
import GamesListScreen from '../screens/GamesListScreen';
import ClassScreen from '../screens/ClassScreen';
import { useUser } from '../contexts/UserContext';
// Game registry for daily challenge
import theme from '../styles/theme';
import styles from '../styles/mainAppStyles';
import { pickRandomGame } from '../games';
import { API_URL } from '../config';
import {
  loadProfile,
  loadGuestProfile,
  saveProfile as persistProfile,
  deleteGuestProfile,
  clearProfile,
} from '../services/profileService';


// Notification banner shown when an achievement is earned, auto-dismisses after a delay
import NotificationBanner from './NotificationBanner';
import DifficultyFAB from './DifficultyFAB';

 const MainApp = () => {
  // access user context (user, family, children, classes)
  const { user, classes, children, setUser } = useUser();
  useEffect(() => {
    console.log('API_URL:', API_URL);
    console.log('classes:', classes);
  }, []);
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
  const [showSetup, setShowSetup] = useState(false);
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
      setShowSetup(false);
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
    // Save authenticated user profile
    saveProfile({ ...user, guest: false });
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
  const goClass = () => setNav({ screen: 'class', classes: classes || [] });
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

  const goGame = (gameId, quote, fromGames = false) => {
    markGamePlayed();
    setNav(prev => ({
      screen: gameId,
      quote,
      setNumber: prev.setNumber,
      lessonNumber: prev.lessonNumber,
      fromGames,
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
  const goBackToLesson = () => setNav(prev => ({ screen: 'grade2Lesson', setNumber: prev.setNumber, lessonNumber: prev.lessonNumber }));

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
      const qObj = quoteMap[`${setNumber}-${lessonNumber}`];
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
    setShowSetup(false);
    // Reset achievements to defaults when wiping profile
    setAchievements(defaultAchievements);
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
      // Guest profile creation
      // Handler for creating a new guest profile: initialize fresh achievements and score
      const handleGuestSave = (p) => {
        // Deep copy default achievements to reset state
        const initAch = defaultAchievements.map(a => ({ ...a }));
        setAchievements(initAch);
        // New guest starts with fresh achievements and zero score
        const newProfile = { ...p, guest: true, achievements: initAch, score: 0 };
        // Update profile state and user context
        setProfile(newProfile);
        setUser(newProfile);
        setShowSetup(false);
        // Save and persist profile
        saveProfile(newProfile);
        // Award initial 'profile' achievement
        awardAchievement('profile');
      };
      return <ProfileSetupScreen onSave={handleGuestSave} />;
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
    if (gameScreens[nav.screen]) {
      const GameComponent = gameScreens[nav.screen];
      const backHandler = nav.fromGames ? goGames : goBackToLesson;
      return (
        <View style={{ flex: 1 }}>
          <GameComponent quote={nav.quote} onBack={backHandler} />
          <DifficultyFAB />
        </View>
      );
    }
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
          onTestMemory={() => goGame('memoryGame', content)}
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
                        // Switch to selected child account, restoring achievements and score
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
        <TouchableOpacity style={styles.navItem} onPress={goClass}>
          <FontAwesomeIcon icon={faChalkboardTeacher} size={24} color="#333" />
          <Text style={styles.navText}>Classes</Text>
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

export default MainApp;
