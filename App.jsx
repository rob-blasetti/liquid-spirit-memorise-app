/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import ThemedButton from './components/ThemedButton';
import GradesScreen from './screens/GradesScreen';
import Avatar from '@flipxyz/react-native-boring-avatars';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Use FontAwesome via @fortawesome/react-native-fontawesome
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTrash, faHome, faBook, faTrophy, faCog } from '@fortawesome/free-solid-svg-icons';
// import Grade1Screen from './screens/Grade1Screen';
import Grade2Screen from './screens/Grade2Screen';
import Grade2SetScreen from './screens/Grade2SetScreen';
import Grade2LessonScreen from './screens/Grade2LessonScreen';
import QuotePracticeScreen from './screens/QuotePracticeScreen';
import Grade3Screen from './screens/Grade3Screen';
import Grade4Screen from './screens/Grade4Screen';
import SettingsScreen from './screens/SettingsScreen';
import AchievementsScreen from './screens/AchievementsScreen';
import TapMissingWordsGame from './screens/TapMissingWordsGame';
import ProfileSetupScreen from './screens/ProfileSetupScreen';
import StartScreen from './screens/StartScreen';
import Splash from './screens/Splash';
import Grade1SetScreen from './screens/Grade1SetScreen';
import Grade1LessonScreen from './screens/Grade1LessonScreen';

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [nav, setNav] = useState({ screen: 'home' });
  const [profile, setProfile] = useState(null);
  const [showSetup, setShowSetup] = useState(false);
  const [achievements, setAchievements] = useState([
    {
      id: 'daily',
      title: 'Daily Learner',
      description: 'Do a memorisation game each day',
      icon: 'calendar-check-o',
      earned: false,
    },
    {
      id: 'set1',
      title: 'Set 1 Master',
      description: 'Complete all lessons in Set 1',
      icon: 'trophy',
      earned: false,
    },
  ]);
  const [completedLessons, setCompletedLessons] = useState({});

  // Splash timeout
  useEffect(() => {
    const timeout = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timeout);
  }, []);
  // Load saved profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await AsyncStorage.getItem('profile');
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
  const handleContinueGuest = () => setShowSetup(true);
  const goHome = () => setNav({ screen: 'home' });
  const goGrade1 = () => setNav({ screen: 'grade1' });
  const goGrade2 = () => setNav({ screen: 'grade2' });
  const goGrades = () => setNav({ screen: 'grades' });
  const goGrade3 = () => setNav({ screen: 'grade3' });
  const goGrade4 = () => setNav({ screen: 'grade4' });
  const goSettings = () => setNav({ screen: 'settings' });
  const goAchievements = () => setNav({ screen: 'achievements' });
  const goGrade2Set = (setNumber) => setNav({ screen: 'grade2Set', setNumber });
  const goGrade2Lesson = (lessonNumber) => setNav(prev => ({ screen: 'grade2Lesson', setNumber: prev.setNumber, lessonNumber }));
  const goBackToGrade2Set = () => setNav(prev => ({ screen: 'grade2Set', setNumber: prev.setNumber }));
  const goBackToGrade2 = () => setNav({ screen: 'grade2' });
  const goPractice = (quote) => setNav(prev => ({
    screen: 'practice',
    quote,
    setNumber: prev.setNumber,
    lessonNumber: prev.lessonNumber,
  }));
  const goTapGame = (quote) => setNav(prev => ({ screen: 'tapGame', quote, setNumber: prev.setNumber, lessonNumber: prev.lessonNumber }));
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
  };

  const addScore = async (value) => {
    if (!profile) return;
    const updated = { ...profile, score: (profile.score || 0) + value };
    await saveProfile(updated);
  };

  const markDaily = () => {
    setAchievements(a => a.map(ach => ach.id === 'daily' ? { ...ach, earned: true } : ach));
  };

  const completeLesson = (setNumber, lessonNumber) => {
    setCompletedLessons(prev => {
      const lessons = prev[setNumber] || {};
      const updated = { ...prev, [setNumber]: { ...lessons, [lessonNumber]: true } };
      if (updated[1] && updated[1][1] && updated[1][2] && updated[1][3]) {
        setAchievements(a => a.map(ach => ach.id === 'set1' ? { ...ach, earned: true } : ach));
      }
      return updated;
    });
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
    if (nav.screen === 'grade2Set') {
      const backHandler = nav.setNumber === 2 ? goHome : goBackToGrade2;
      return <Grade2SetScreen setNumber={nav.setNumber} onLessonSelect={goGrade2Lesson} onBack={backHandler} />;
    }
    if (nav.screen === 'grade2') return <Grade2Screen onSetSelect={goGrade2Set} onBack={goHome} />;
    if (nav.screen === 'grade3') return <Grade3Screen onBack={goHome} />;
    if (nav.screen === 'grade4') return <Grade4Screen onBack={goHome} />;
    if (nav.screen === 'achievements') return <AchievementsScreen achievements={achievements} onDailyPress={markDaily} />;
    if (nav.screen === 'settings') return <SettingsScreen onBack={goHome} />;
    // Grades pick screen
    if (nav.screen === 'grades') {
      return (
        <GradesScreen
          onGradeSelect={(g) => {
            if (g === 1) goGrade1();
            else if (g === 2) goGrade2();
            else if (g === 3) goGrade3();
            else if (g === 4) goGrade4();
          }}
        />
      );
    }
    // Default: home screen (profile overview)
    // Daily challenge and lesson access buttons
    return (
      <>
        <View style={styles.profileContainer}>
          <Avatar size={60} name={profile.name} variant="beam" />
          <View style={styles.profileTextContainer}>
            <Text style={styles.profileName}>{profile.name}</Text>
            <Text style={styles.profileGrade}>Grade {profile.grade || 'N/A'}</Text>
          </View>
        </View>
        <Text style={styles.scoreText}>Score: {profile.score || 0}</Text>
        <View style={styles.homeButtonContainer}>
          <Button title="Daily Challenge" onPress={() => { markDaily(); goAchievements(); }} />
        </View>
        <View style={styles.homeButtonContainer}>
          <Button title="Go to Lesson" onPress={() => {
            // navigate to this week's lesson content based on grade
            if (profile.grade === 1) goGrade1();
            else if (profile.grade === 2) goGrade2();
            else if (profile.grade === 3) goGrade3();
            else if (profile.grade === 4) goGrade4();
            else goHome();
          }} />
        </View>
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        {renderScreen()}
        {profile && nav.screen === 'home' && (
          <TouchableOpacity style={styles.resetButton} onPress={wipeProfile}>
            <FontAwesomeIcon icon={faTrash} size={24} color="#333" />
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        )}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
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
    justifyContent: 'center',
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
  // Reset button style on home screen
  resetButton: {
    position: 'absolute',
    left: 16,
    bottom: 64,
    alignItems: 'center',
  },
  resetText: {
    fontSize: 12,
    marginTop: 4,
    color: '#333',
  },
});

export default App;
