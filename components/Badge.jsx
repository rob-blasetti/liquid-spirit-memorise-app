import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Avatar from '@flipxyz/react-native-boring-avatars';
import Ionicons from 'react-native-vector-icons/Ionicons';
import themeVariables from '../styles/theme';

const Badge = ({ name, score, isTeacher }) => {
  return (
    <View style={styles.container}>
      <Avatar size={50} name={name} variant="beam" />
      <View style={styles.textContainer}>
        <Text style={styles.nameText}>
          {name} {isTeacher ? '(Teacher)' : ''}
        </Text>
        {!isTeacher && (
          <View style={styles.scoreContainer}>
            <Ionicons name="star" size={16} color={themeVariables.primaryColor} />
            <Text style={styles.scoreText}>{score}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
  textContainer: {
    marginLeft: 12,
  },
  nameText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  scoreText: {
    fontSize: 14,
    marginLeft: 4,
  },
});

export default Badge;