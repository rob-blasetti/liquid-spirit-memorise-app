/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import Grade1Screen from './screens/Grade1Screen';
import Grade2Screen from './screens/Grade2Screen';
import Grade2SetScreen from './screens/Grade2SetScreen';
import Grade2LessonScreen from './screens/Grade2LessonScreen';
import Grade3Screen from './screens/Grade3Screen';
import Grade4Screen from './screens/Grade4Screen';
import SettingsScreen from './screens/SettingsScreen';
import TapMissingWordsGame from './screens/TapMissingWordsGame';
import ProfileSetupScreen from './screens/ProfileSetupScreen';

const App = () => {
  const [nav, setNav] = useState({ screen: 'home' });
  const [profile, setProfile] = useState(null);
  const goHome = () => setNav({ screen: 'home' });
  const goGrade1 = () => setNav({ screen: 'grade1' });
  const goGrade2 = () => setNav({ screen: 'grade2' });
  const goGrade3 = () => setNav({ screen: 'grade3' });
  const goGrade4 = () => setNav({ screen: 'grade4' });
  const goSettings = () => setNav({ screen: 'settings' });
  const goGrade2Set = (setNumber) => setNav({ screen: 'grade2Set', setNumber });
  const goGrade2Lesson = (lessonNumber) => setNav(prev => ({ screen: 'grade2Lesson', setNumber: prev.setNumber, lessonNumber }));
  const goBackToGrade2Set = () => setNav(prev => ({ screen: 'grade2Set', setNumber: prev.setNumber }));
  const goBackToGrade2 = () => setNav({ screen: 'grade2' });
  const goTapGame = (quote) => setNav(prev => ({ screen: 'tapGame', quote, setNumber: prev.setNumber, lessonNumber: prev.lessonNumber }));
  const goBackToLesson = () => setNav(prev => ({ screen: 'grade2Lesson', setNumber: prev.setNumber, lessonNumber: prev.lessonNumber }));

  
  useEffect(() => {
    const load = async () => {
      try {
        const data = await AsyncStorage.getItem('profile');
        if (data) setProfile(JSON.parse(data));
      } catch (e) {
        // ignore errors
      }
    };
    load();
  }, []);

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


  
  // Render the appropriate screen
  const renderScreen = () => {
    if (!profile) return <ProfileSetupScreen onSave={saveProfile} />;
    // Detail screens
    if (nav.screen === 'grade1') return <Grade1Screen onBack={goHome} />;
    if (nav.screen === 'grade2Lesson') return <Grade2LessonScreen setNumber={nav.setNumber} lessonNumber={nav.lessonNumber} onBack={goBackToGrade2Set} onPlayGame={goTapGame} />;
    if (nav.screen === 'tapGame') return <TapMissingWordsGame quote={nav.quote} onBack={goBackToLesson} />;
    if (nav.screen === 'grade2Set') {
      const backHandler = nav.setNumber === 2 ? goHome : goBackToGrade2;
      return <Grade2SetScreen setNumber={nav.setNumber} onLessonSelect={goGrade2Lesson} onBack={backHandler} />;
    }
    if (nav.screen === 'grade2') return <Grade2Screen onSetSelect={goGrade2Set} onBack={goHome} />;
    if (nav.screen === 'grade3') return <Grade3Screen onBack={goHome} />;
    if (nav.screen === 'grade4') return <Grade4Screen onBack={goHome} />;
    if (nav.screen === 'settings') return <SettingsScreen onBack={goHome} />;
    // Default: home screen with tiles
    return (
      <>
        <Text style={styles.title}>{profile.name}</Text>
        <Text style={styles.subtitle}>Grade: {profile.grade || 'N/A'}    Score: {profile.score || 0}</Text>
        <View style={styles.tileContainer}>
          <TouchableOpacity style={styles.tile} onPress={goGrade1}>
            <Text style={styles.tileTitle}>Grade 1</Text>
            <Text style={styles.tileInfo}>Book 3</Text>
            <Text style={styles.tileInfo}>Age 5-7 Years</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tile} onPress={() => goGrade2Set(1)}>
            <Text style={styles.tileTitle}>Grade 2</Text>
            <Text style={styles.tileInfo}>Book 3-1</Text>
            <Text style={styles.tileInfo}>Age 7-8 Years</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tile} onPress={() => goGrade2Set(2)}>
            <Text style={styles.tileTitle}>Grade 2</Text>
            <Text style={styles.tileInfo}>Book 3-2</Text>
            <Text style={styles.tileInfo}>Age 7-8 Years</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tile} onPress={goGrade3}>
            <Text style={styles.tileTitle}>Grade 3</Text>
            <Text style={styles.tileInfo}>Book 3-3</Text>
            <Text style={styles.tileInfo}>Age 8-9 Years</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tile} onPress={goGrade4}>
            <Text style={styles.tileTitle}>Grade 4</Text>
            <Text style={styles.tileInfo}>Book 3-4</Text>
            <Text style={styles.tileInfo}>Age 9-10 Years</Text>
          </TouchableOpacity>
        </View>
        <Button title="Add Point" onPress={() => addScore(1)} />
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        {renderScreen()}
      </View>
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={goHome}>
          <Icon name="home" size={24} color="#333" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={goGrade2}>
          <Icon name="book" size={24} color="#333" />
          <Text style={styles.navText}>Lessons</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={goSettings}>
          <Icon name="cog" size={24} color="#333" />
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
});

export default App;
