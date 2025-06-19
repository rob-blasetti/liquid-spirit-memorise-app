/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState } from 'react';
import { SafeAreaView, View, Text, Button, StyleSheet } from 'react-native';
import Grade1Screen from './screens/Grade1Screen';
import Grade2Screen from './screens/Grade2Screen';
import Grade2SetScreen from './screens/Grade2SetScreen';
import Grade2LessonScreen from './screens/Grade2LessonScreen';
import Grade3Screen from './screens/Grade3Screen';

const App = () => {
  const [nav, setNav] = useState({ screen: 'home' });
  const goHome = () => setNav({ screen: 'home' });
  const goGrade1 = () => setNav({ screen: 'grade1' });
  const goGrade2 = () => setNav({ screen: 'grade2' });
  const goGrade3 = () => setNav({ screen: 'grade3' });
  const goGrade2Set = (setNumber) => setNav({ screen: 'grade2Set', setNumber });
  const goGrade2Lesson = (lessonNumber) => setNav(prev => ({ screen: 'grade2Lesson', setNumber: prev.setNumber, lessonNumber }));
  const goBackToGrade2Set = () => setNav(prev => ({ screen: 'grade2Set', setNumber: prev.setNumber }));
  const goBackToGrade2 = () => setNav({ screen: 'grade2' });

  if (nav.screen === 'grade1') {
    return <Grade1Screen onBack={goHome} />;
  }
  if (nav.screen === 'grade2Lesson') {
    return <Grade2LessonScreen setNumber={nav.setNumber} lessonNumber={nav.lessonNumber} onBack={goBackToGrade2Set} />;
  }
  if (nav.screen === 'grade2Set') {
    return <Grade2SetScreen setNumber={nav.setNumber} onLessonSelect={goGrade2Lesson} onBack={goBackToGrade2} />;
  }
  if (nav.screen === 'grade2') {
    return <Grade2Screen onSetSelect={goGrade2Set} onBack={goHome} />;
  }

  if (nav.screen === 'grade3') {
    return <Grade3Screen onBack={goHome} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Liquid Spirit Memorise</Text>
      <View style={styles.buttonContainer}>
        <Button title="Grade 1" onPress={goGrade1} />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Grade 2" onPress={goGrade2} />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Grade 3" onPress={goGrade3} />
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
  buttonContainer: {
    width: '80%',
    marginVertical: 8,
  },
});

export default App;
