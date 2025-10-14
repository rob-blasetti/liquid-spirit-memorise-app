import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import themeVariables from '../styles/theme';
import { GRADE_CARD_DATA } from '../data/gradesConfig';

const HORIZONTAL_PADDING = 16;
const TILE_HEIGHT = 115; // reduced slightly so bottom item clears nav

const GradesScreen = ({
  onGradeSelect,
  onBack,
  comingSoonGrades = [],
  onComingSoonGrade,
}) => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {typeof onBack === 'function' ? (
          <TouchableOpacity
            style={styles.headerButton}
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Back to home"
          >
            <Ionicons name="chevron-back" size={20} color={themeVariables.whiteColor} />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerButtonPlaceholder} />
        )}
        <Text style={styles.title}>Library</Text>
        <View style={styles.headerButtonPlaceholder} />
      </View>

      {/* Grade Cards */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {GRADE_CARD_DATA.map((item) => {
          const range = item.ages.split(' ')[1] || item.ages;
          const pct = (item.grade / GRADE_CARD_DATA.length) * 100;
          const isComingSoon = comingSoonGrades.includes(item.grade);

          const handlePress = () => {
            if (isComingSoon) {
              if (typeof onComingSoonGrade === 'function') {
                onComingSoonGrade(item.grade);
              }
              return;
            }
            if (typeof onGradeSelect === 'function') {
              onGradeSelect(item.grade, item.setNumber);
            }
          };

          return (
            <TouchableOpacity
              key={item.grade}
              style={[
                styles.tile,
                isComingSoon && styles.tileDisabled,
              ]}
              activeOpacity={0.7}
              onPress={handlePress}
              accessibilityLabel={isComingSoon ? `${item.title} coming soon` : `Open ${item.title}`}
            >
              <View style={styles.left}>
                <View style={styles.titleRow}>
                  <Text style={styles.gradeText}>{item.title}</Text>
                  {isComingSoon ? (
                    <View style={styles.chip}>
                      <Text style={styles.chipText}>Coming Soon</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.bookText}>{item.book}</Text>
              </View>
              <View style={styles.right}>
                <Text style={styles.ageLabel}>age</Text>
                <Text style={styles.ageValue}>{range}</Text>
              </View>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${pct}%` }
                  ]}
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

export default GradesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  headerButtonPlaceholder: {
    width: 36,
    height: 36,
  },
  title: {
    color: themeVariables.whiteColor,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: 24,
  },
  tile: {
    height: TILE_HEIGHT,
    backgroundColor: themeVariables.tertiaryDarkColor,
    borderRadius: themeVariables.borderRadiusPill,
    marginBottom: 16,
    overflow: 'hidden',
  },
  tileDisabled: {
    opacity: 0.65,
  },
  left: {
    position: 'absolute',
    top: 16,
    left: 16,
  },
  right: {
    position: 'absolute',
    top: 16,
    right: 16,
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gradeText: {
    color: themeVariables.whiteColor,
    fontSize: 20,
    fontWeight: '500',
  },
  bookText: {
    color: themeVariables.whiteColor,
    fontSize: 16,
    marginTop: 4,
  },
  ageLabel: {
    color: themeVariables.whiteColor,
    fontSize: 12,
  },
  ageValue: {
    color: themeVariables.whiteColor,
    fontSize: 32,
    fontWeight: '300',
    marginTop: 2,
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
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginLeft: 8,
  },
  chipText: {
    color: themeVariables.whiteColor,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
