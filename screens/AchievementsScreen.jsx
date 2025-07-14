import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import themeVariables from '../styles/theme';

// Map icon name strings to Ionicons names
const iconMap = {
  'calendar-check-o': 'calendar',
  'trophy': 'trophy',
};
const AchievementItem = ({ icon, title, description, points, earned }) => (
  <View style={styles.item}>
    <Ionicons
      name={iconMap[icon]}
      size={32}
      color={earned ? themeVariables.secondaryColor : '#ccc'}
    />
    <View style={styles.itemText}>
      <Text style={styles.itemTitle}>{title}</Text>
      <Text style={styles.itemDesc}>{description}</Text>
    </View>
    <View style={styles.pointsContainer}>
      <Text style={styles.pointsText}>{points}</Text>
      <Ionicons
        name="star"
        size={24}
        color={earned ? themeVariables.secondaryColor : '#ccc'}
      />
    </View>
  </View>
);

const AchievementsScreen = ({ achievements, highlightId }) => {
  const scrollRef = useRef();
  const offsetMap = useRef({});

  useEffect(() => {
    if (highlightId && scrollRef.current && offsetMap.current[highlightId] != null) {
      scrollRef.current.scrollTo({ y: offsetMap.current[highlightId] - 64, animated: true });
    }
  }, [highlightId]);
  // Show all achievements (including those with prerequisites), greyed out if not yet earned
  const visible = achievements;
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
    else if (
      ach.id.startsWith('game') ||
      ach.id.startsWith('memory') ||
      ach.id.startsWith('shape') ||
      ach.id.startsWith('hangman') ||
      ach.id === 'tapPerfect'
    )
      category = 'Games';
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
      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {order.map((section) => {
          const items = grouped[section];
          if (!items) return null;
          return (
            <View key={section} style={styles.section}>
              <Text style={styles.sectionHeader}>{section}</Text>
              {items.map((ach) => (
                <View
                  key={ach.id}
                  onLayout={e => { offsetMap.current[ach.id] = e.nativeEvent.layout.y; }}
                  style={[
                    styles.item,
                    highlightId === ach.id && styles.highlight,
                  ]}
                >
                  <AchievementItem
                    icon={ach.icon}
                    title={ach.title}
                    description={ach.description}
                    points={ach.points}
                    earned={ach.earned}
                  />
                </View>
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
    paddingHorizontal: 16,
    backgroundColor: themeVariables.darkGreyColor,
  },
  title: {
    fontSize: 24,
  },
  headerContainer: {
    paddingTop: 12,
    paddingBottom: 6,
    alignItems: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
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
  // Deprecated: use pointsContainer and pointsText instead
  itemPoints: {
    fontSize: 12,
    color: '#333',
  },
  pointsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    marginRight: 16,
  },
  pointsText: {
    fontSize: 12,
    color: '#333',
    marginBottom: 4,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
    alignSelf: 'stretch',
  },
  scrollContent: {
    paddingVertical: 6,
  },
  section: {
    marginBottom: 12,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    /* align with container's horizontal padding */
    paddingTop: 6,
    paddingBottom: 2,
  },
  // Highlighted achievement
  highlight: {
    backgroundColor: themeVariables.neutralLight,
    borderColor: themeVariables.primaryColor,
    borderWidth: 2,
    borderRadius: 8,
  },
});

export default AchievementsScreen;
