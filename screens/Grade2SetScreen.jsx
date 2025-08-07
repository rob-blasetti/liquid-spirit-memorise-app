import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ButtonList from '../components/ButtonList';
import themeVariables from '../styles/theme';

const Grade2SetScreen = ({ setNumber, onLessonSelect, onBack }) => (
  <View style={styles.container}>
    <Text style={styles.title}>Grade 2 - Set {setNumber}</Text>
    <ButtonList
      containerStyle={{ marginVertical: 8 }}
      buttons={[
        { title: 'Lesson 1', onPress: () => onLessonSelect(1) },
        { title: 'Lesson 2', onPress: () => onLessonSelect(2) },
        { title: 'Lesson 3', onPress: () => onLessonSelect(3) },
        { title: 'Back', onPress: onBack },
      ]}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
    color: themeVariables.whiteColor,
  },
});

export default Grade2SetScreen;