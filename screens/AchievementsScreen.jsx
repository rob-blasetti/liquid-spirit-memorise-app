import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
// import ThemedButton from '../components/ThemedButton';
// Use FontAwesome via @fortawesome/react-native-fontawesome
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCalendarCheck, faTrophy } from '@fortawesome/free-solid-svg-icons';

// Map icon name strings to FontAwesome icons
const iconMap = {
  'calendar-check-o': faCalendarCheck,
  'trophy': faTrophy,
};
const AchievementItem = ({ icon, title, description, points, earned }) => (
  <View style={styles.item}>
    <FontAwesomeIcon icon={iconMap[icon]} size={32} color={earned ? '#4caf50' : '#ccc'} />
    <View style={styles.itemText}>
      <Text style={styles.itemTitle}>{title}</Text>
      <Text style={styles.itemDesc}>{description}</Text>
      <Text style={styles.itemPoints}>Points: {points}</Text>
    </View>
  </View>
);

const AchievementsScreen = ({ achievements }) => {
  // Only show achievements when prerequisites are met
  const visible = achievements.filter(
    (ach) => !ach.prereq || achievements.find(a => a.id === ach.prereq)?.earned
  );
  // Group achievements into categories based on id prefix
  const grouped = visible.reduce((acc, ach) => {
    let category = 'Other';
    if (ach.id === 'daily') category = 'Daily Challenge';
    else if (ach.id.startsWith('streak')) category = 'Streaks';
    else if (ach.id.startsWith('set')) category = 'Sets';
    else if (ach.id.startsWith('grade')) category = 'Grades';
    else if (ach.id.startsWith('prayer')) category = 'Prayers';
    else if (ach.id.startsWith('quote')) category = 'Quotes';
    else if (ach.id.startsWith('practice')) category = 'Practice';
    else if (ach.id.startsWith('game') || ach.id === 'tapPerfect') category = 'Games';
    else if (ach.id === 'profile') category = 'Profile';
    else if (ach.id === 'explorer') category = 'Explorer';
    acc[category] = acc[category] || [];
    acc[category].push(ach);
    return acc;
  }, {});
  // Define display order for categories
  const order = ['Daily Challenge', 'Streaks', 'Sets', 'Grades', 'Prayers', 'Quotes', 'Practice', 'Games', 'Profile', 'Explorer', 'Other'];
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Achievements</Text>
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {order.map((section) => {
          const items = grouped[section];
          if (!items) return null;
          return (
            <View key={section} style={styles.section}>
              <Text style={styles.sectionHeader}>{section}</Text>
              {items.map((ach) => (
                <AchievementItem
                  key={ach.id}
                  icon={ach.icon}
                  title={ach.title}
                  description={ach.description}
                  points={ach.points}
                  earned={ach.earned}
                />
              ))}
            </View>
          );
        })}
      </ScrollView>
      {/* Mark Daily Challenge button removed */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
  },
  title: {
    fontSize: 24,
  },
  headerContainer: {
    paddingTop: 16,
    paddingBottom: 8,
    alignItems: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    width: '100%',
  },
  itemText: {
    marginLeft: 12,
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
  itemPoints: {
    fontSize: 12,
    color: '#333',
  },
  scrollView: {
    flex: 1,
    alignSelf: 'stretch',
  },
  scrollContent: {
    paddingVertical: 8,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
});

export default AchievementsScreen;
