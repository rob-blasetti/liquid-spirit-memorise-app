import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const AchievementItem = ({ icon, title, description, earned }) => (
  <View style={styles.item}>
    <Icon name={icon} size={32} color={earned ? '#4caf50' : '#ccc'} />
    <View style={styles.itemText}>
      <Text style={styles.itemTitle}>{title}</Text>
      <Text style={styles.itemDesc}>{description}</Text>
    </View>
  </View>
);

const AchievementsScreen = ({ achievements, onDailyPress }) => (
  <View style={styles.container}>
    <Text style={styles.title}>Achievements</Text>
    {achievements.map((ach) => (
      <AchievementItem
        key={ach.id}
        icon={ach.icon}
        title={ach.title}
        description={ach.description}
        earned={ach.earned}
      />
    ))}
    <View style={styles.buttonContainer}>
      <Button title="Mark Daily Challenge Complete" onPress={onDailyPress} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 8,
  },
  itemText: {
    marginLeft: 16,
    flex: 1,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemDesc: {
    fontSize: 14,
    color: '#666',
  },
  buttonContainer: {
    marginTop: 24,
    width: '100%',
  },
});

export default AchievementsScreen;
