import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import themeVariables from '../../../ui/stylesheets/theme';
import { GRADE_CARD_DATA } from '../../../utils/data/core/gradesConfig';
import TopNav from '../../../ui/components/TopNav';

const HORIZONTAL_PADDING = 16;
const GradesScreen = ({
  onGradeSelect,
  onBack,
  comingSoonGrades = [],
  onComingSoonGrade,
}) => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <TopNav title="Library" onBack={onBack} containerStyle={styles.header} />

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
              <View style={styles.tileContent}>
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
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 12,
    paddingBottom: 16,
  },
  scrollContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: 24,
  },
  tile: {
    backgroundColor: themeVariables.tertiaryDarkColor,
    borderRadius: themeVariables.borderRadiusPill,
    marginBottom: 16,
    overflow: 'hidden',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  tileDisabled: {
    opacity: 0.65,
  },
  tileContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 24,
  },
  left: {
    flexShrink: 1,
  },
  right: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 72,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gradeText: {
    color: themeVariables.whiteColor,
    fontSize: 20,
    fontWeight: '500',
  },
  bookText: {
    color: themeVariables.whiteColor,
    fontSize: 16,
    marginTop: 6,
  },
  ageLabel: {
    color: themeVariables.whiteColor,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  ageValue: {
    color: themeVariables.whiteColor,
    fontSize: 32,
    fontWeight: '300',
    marginTop: 4,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginTop: 20,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: themeVariables.whiteColor,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  chipText: {
    color: themeVariables.whiteColor,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
