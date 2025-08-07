import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import themeVariables from '../styles/theme';
import { useAchievementsContext } from '../contexts/AchievementsContext';

const { width } = Dimensions.get('window');
const HORIZONTAL_PADDING = 16;
const CARD_HEIGHT = 120;
// Customize these two colors to match your design
const CARD_GRADIENT = ['#E21281', '#6E33A7'];

const order = ['Prayers', 'Quotes', 'Games', 'Profile', 'Explorer'];

const AchievementsScreen = () => {
  const { achievements = [] } = useAchievementsContext();
  console.log('Achievements screen achievements:', achievements);
  // compute total points earned (sum of earned achievements)
  const totalPoints = achievements.reduce((sum, ach) => ach.earned ? sum + ach.points : sum, 0);
  // Group achievements into categories based on id prefixes
  const grouped = achievements.reduce((acc, ach) => {
    // lowercase title for simpler matching
    const t = ach.title.toLowerCase();

    let category;
    if (t.includes('prayer')) {
      category = 'Prayers';
    } else if (t.includes('quote')) {
      category = 'Quotes';
    } else if (
      t.includes('daily')    ||  // Daily Learner
      t.includes('master')   ||  // Set 1 Master, Set 2 Master, etc
      t.includes('star')        // Grade 1 Star
    ) {
      category = 'Games';
    } else if (t.includes('profile')) {
      category = 'Profile';
    } else if (t.includes('explorer')) {
      category = 'Explorer';
    } else {
      // if you ever add a new category, you can catch it here
      category = 'Other';
    }

    acc[category] = acc[category] || [];
    acc[category].push(ach);
    return acc;
  }, {});

  return (
    <LinearGradient
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      colors={[themeVariables.gradientStart, themeVariables.gradientEnd]}
      style={styles.background}
    >
      <SafeAreaView style={styles.container}>

        {/* Header with subtle background burst */}
        <View style={styles.header}>
          <Ionicons
            name="star-outline"
            size={96}
            color="rgba(255,255,255,0.1)"
            style={styles.headerBgIcon}
          />
          <Text style={styles.title}>Achievements</Text>
          {/* total points earned */}
          <Text style={styles.totalPoints}>Total Points: {totalPoints}</Text>
        </View>

        {/* Achievement Cards */}
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {order.flatMap((section) => {
            // group and sort: earned achievements first
            const rawItems = grouped[section] || [];
            const items = [
              ...rawItems.filter(a => a.earned),
              ...rawItems.filter(a => !a.earned),
            ];
            return items.map((item) => {
              const pct = Math.max(0, Math.min(100, item.points));
              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.cardWrapper}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={CARD_GRADIENT}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.card}
                  >
                    <View style={styles.cardText}>
                      <Text style={styles.cardTitle}>{item.title}</Text>
                      <Text style={styles.cardDesc}>{item.description}</Text>
                    </View>

                    <Ionicons
                      name={item.earned ? 'star' : 'star-outline'}
                      size={32}
                      color={themeVariables.whiteColor}
                      style={styles.cardIcon}
                    />

                    <View style={styles.progressTrack}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${pct}%` },
                        ]}
                      />
                    </View>
                    {/* points value */}
                    <Text style={styles.cardPoints}>{item.points}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              );
            });
          })}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default AchievementsScreen;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    marginBottom: -40,
  },
  container: {
    flex: 1,
    marginBottom: -40,
  },
  header: {
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: HORIZONTAL_PADDING,
    position: 'relative',
  },
  headerBgIcon: {
    position: 'absolute',
    top: -20,
    left: -10,
  },
  title: {
    color: themeVariables.whiteColor,
    fontSize: 24,
    fontWeight: '700',
  },
  content: {
    paddingBottom: 24,
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  cardWrapper: {
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  card: {
    height: CARD_HEIGHT,
    borderRadius: themeVariables.borderRadiusPill,
    overflow: 'hidden',
  },
  cardText: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 64, // space for the icon on the right
  },
  cardTitle: {
    color: themeVariables.whiteColor,
    fontSize: 20,
    fontWeight: '500',
  },
  cardDesc: {
    color: themeVariables.whiteColor,
    fontSize: 16,
    marginTop: 4,
  },
  cardIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  progressTrack: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    right: 16,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: themeVariables.whiteColor,
  },
  // points badge on each card
  cardPoints: {
    position: 'absolute',
    bottom: 20,
    right: 16,
    color: themeVariables.whiteColor,
    fontSize: 16,
    fontWeight: '500',
  },
  // total points at header
  totalPoints: {
    color: themeVariables.whiteColor,
    fontSize: 18,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
});