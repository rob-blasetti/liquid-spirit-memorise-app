import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import themeVariables from '../styles/theme';
import { useAchievementsContext } from '../contexts/AchievementsContext';
import TopNav from '../components/TopNav';

const { width } = Dimensions.get('window');
const HORIZONTAL_PADDING = 16;
const CARD_HEIGHT = 120;
// Customize these two colors to match your design
const CARD_GRADIENT = ['#E21281', '#6E33A7'];
const EMPTY_STATE_ICON = 'sparkles-outline';
const EMPTY_STATE_ICON_SIZE = 56;

const order = ['Prayers', 'Quotes', 'Games', 'Profile', 'Explorer', 'Other'];

const AchievementsScreen = ({ onBack }) => {
  const {
    achievements = [],
    totalPoints = 0,
    isPointsSynced = true,
    computedPoints = 0,
    refreshFromServer,
    isGuest = false,
    isLoading = false,
  } = useAchievementsContext();
  const [refreshing, setRefreshing] = useState(false);
  const [filterOption, setFilterOption] = useState('all'); // 'earned' | 'unearned' | 'all'

  const onRefresh = async () => {
    if (isLoading) return;
    setRefreshing(true);
    try {
      await refreshFromServer?.();
    } finally {
      setRefreshing(false);
    }
  };
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.debug('Achievements screen achievements:', achievements);
    if (!isPointsSynced) {
      // eslint-disable-next-line no-console
      console.warn('AchievementsScreen: points mismatch', { totalPoints, computedPoints });
    }
  }
  // totalPoints comes from context (server/profile canonical); computedPoints is derived for verification
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
      t.includes('daily')      ||  
      t.includes('master')     ||  
      t.includes('star')       ||  
      t.includes('game')       ||  
      t.includes('tap')        ||  
      t.includes('practice')   ||  
      t.includes('memory')     ||  
      t.includes('shape')      ||  
      t.includes('hangman')    ||  
      t.includes('bubble')
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

  const hasBackHandler = typeof onBack === 'function';

  const filterAchievements = (items) => {
    if (filterOption === 'all') return items;
    return items.filter((a) =>
      filterOption === 'earned' ? a.earned : !a.earned
    );
  };

  const filteredSections = order.map((section) => {
    const rawItems = grouped[section] || [];
    return {
      section,
      items: filterAchievements(rawItems),
    };
  });

  const hasFilteredAchievements = filteredSections.some((entry) => entry.items.length > 0);

  const emptyStateLookup = {
    earned: {
      title: 'No earned badges yet',
      subtitle:
        'Keep learning and exploring—complete lessons, games, or challenges to unlock your first achievements.',
    },
    unearned: {
      title: 'Nothing left to unlock!',
      subtitle:
        'You have already earned every available badge. Check back soon for new challenges to chase.',
    },
    all: {
      title: 'No badges available yet',
      subtitle: 'Stay tuned—new achievements will appear here as you continue your journey.',
    },
  };

  const emptyStateConfig = emptyStateLookup[filterOption] || emptyStateLookup.all;
  const showEmptyState = !hasFilteredAchievements;

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
          <TopNav
            title="Achievements"
            onBack={hasBackHandler ? onBack : undefined}
            containerStyle={styles.topRow}
            titleStyle={styles.topRowTitle}
          />
          {/* total points (left) + filter (right) */}
          <View style={styles.headerRow}>
            <Text style={styles.totalPointsLeft}>Total Points: {totalPoints}</Text>
            <View style={styles.filterGroup}>
              <View style={styles.filterRow}>
                <TouchableOpacity
                  style={[styles.filterBtn, filterOption === 'all' && styles.filterBtnActive]}
                  onPress={() => setFilterOption('all')}
                >
                  <Text style={[styles.filterText, filterOption === 'all' && styles.filterTextActive]}>All</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterBtn, filterOption === 'earned' && styles.filterBtnActive]}
                  onPress={() => setFilterOption('earned')}
                >
                  <Text style={[styles.filterText, filterOption === 'earned' && styles.filterTextActive]}>Earned</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterBtn, filterOption === 'unearned' && styles.filterBtnActive]}
                  onPress={() => setFilterOption('unearned')}
                >
                  <Text style={[styles.filterText, filterOption === 'unearned' && styles.filterTextActive]}>Unearned</Text>
                </TouchableOpacity>
              </View>
              {isGuest ? (
                <Text style={styles.guestBadge}>Guest Mode — Local Only</Text>
              ) : null}
            </View>
          </View>
          {__DEV__ && !isPointsSynced && (
            <Text style={styles.pointsWarning}>Points mismatch (computed {computedPoints})</Text>
          )}
        </View>

        {/* Achievement Cards */}
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={themeVariables.whiteColor}
            />
          }
        >
          {showEmptyState ? (
            <View style={styles.emptyState}>
              <Ionicons
                name={EMPTY_STATE_ICON}
                size={EMPTY_STATE_ICON_SIZE}
                style={styles.emptyStateIcon}
              />
              <Text style={styles.emptyStateTitle}>{emptyStateConfig.title}</Text>
              <Text style={styles.emptyStateSubtitle}>
                {emptyStateConfig.subtitle}
              </Text>
            </View>
          ) : (
            filteredSections.flatMap(({ items }) =>
              items.map((item) => {
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
              })
            )
          )}
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
  topRow: {
    marginBottom: 12,
    paddingHorizontal: 0,
  },
  topRowTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  headerBgIcon: {
    position: 'absolute',
    top: -20,
    left: -10,
  },
  headerRow: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
  // total points at header (left)
  totalPointsLeft: {
    color: themeVariables.whiteColor,
    fontSize: 16,
    fontWeight: '600',
  },
  pointsWarning: {
    color: '#FFD54F',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  filterGroup: {
    position: 'relative',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  filterBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    backgroundColor: 'transparent',
  },
  filterBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderColor: themeVariables.whiteColor,
  },
  filterText: {
    color: themeVariables.whiteColor,
    fontSize: 12,
    fontWeight: '600',
  },
  filterTextActive: {
    color: themeVariables.whiteColor,
  },
  guestBadge: {
    position: 'absolute',
    top: -32,
    right: 0,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: themeVariables.whiteColor,
    borderWidth: 1,
    borderColor: themeVariables.tertiaryColor,
    color: themeVariables.tertiaryColor,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyState: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyStateIcon: {
    marginBottom: 20,
    color: themeVariables.whiteColor,
  },
  emptyStateTitle: {
    color: themeVariables.whiteColor,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
