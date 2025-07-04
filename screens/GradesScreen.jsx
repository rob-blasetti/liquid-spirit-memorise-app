import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import themeVariables from '../styles/theme';

const GradesScreen = ({ onGradeSelect }) => (
  <View style={styles.container}>
    <Text style={styles.title}>Select Grade</Text>
    <View style={styles.tileContainer}>
        {[
        { grade: 1, book: 'Book 3', ages: 'Ages 5-7' },
        { grade: 2, book: 'Book 3-1', ages: 'Ages 7-8' },
        { grade: 2, book: 'Book 3-2', ages: 'Ages 7-8', setNumber: 2 },
        { grade: 3, book: 'Book 3-3', ages: 'Ages 8-9' },
        { grade: 4, book: 'Book 3-4', ages: 'Ages 9-10' },
      ].map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.tile}
          onPress={() => onGradeSelect(item.grade, item.setNumber)}
        >
          <Text style={styles.tileGrade}>Grade {item.grade}</Text>
          <Text style={styles.tileBook}>{item.book}</Text>
          <Text style={styles.tileAge}>{item.ages}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

export default GradesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: themeVariables.darkGreyColor,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
  tileContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16,
  },
  tile: {
    backgroundColor: themeVariables.primaryColor,
    width: '48%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginBottom: 16,
    borderRadius: themeVariables.borderRadiusPill,
  },
  tileGrade: {
    color: themeVariables.whiteColor,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tileBook: {
    color: themeVariables.whiteColor,
    fontSize: 14,
    marginBottom: 4,
  },
  tileAge: {
    color: themeVariables.whiteColor,
    fontSize: 12,
  },
});